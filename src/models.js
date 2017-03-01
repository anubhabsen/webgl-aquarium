var m = require('./matrix')

function openFile(name, filename){
  var datastring;
  $.ajax({
    url : filename + '.obj',
    dataType: "text",
    success : function (data) {
      datastring = data;
      $.ajax({
        url : filename + '.mtl',
        dataType: "text",
        success : function (mtlstring) {
          createModel(name, datastring, mtlstring);
        }
      })
    }
  });
}

function makeModel(name, filename, center = [0, 0, 0], scale = [1, 1, 1], alpha = 1, invertNormals = false) {
  models[name] = {name, center, scale, invertNormals};
  openFile(name, filename);
}

function parseMtl(mtlstring) {
  var mtllib = {}
  var lines = mtlstring.split('\n');
  var curmtl = ''
  for (var j=0; j<lines.length; j++) {
    var words = lines[j].split(' ');
    if (words[0] == 'newmtl') curmtl = words[1]
    else if (words[0] == 'Kd') {
      mtllib[curmtl] = [
        parseFloat(words[1]),
        parseFloat(words[2]),
        parseFloat(words[3]),
      ]
    }
  }
  return mtllib
}

function createModel(name, filedata, mtlstring) //Create object from blender
{
  var model = models[name];
  var mtllib = parseMtl(mtlstring)
  var vertex_buffer_data = [];
  var color_buffer_data = [];
  var points = [];

  var normals = [];
  var normal_buffer_data = [];

  var lines = filedata.split('\n');
  for (var j=0; j<lines.length; j++){
    var words = lines[j].split(' ');
    if(words[0] == "v"){
      var cur_point = {};
      cur_point['x']=parseFloat(words[1]);
      cur_point['y']=parseFloat(words[2]);
      cur_point['z']=parseFloat(words[3]);
      //console.log(words);
      points.push(cur_point);
    } else if (words[0] == "vn") {
      let cur_point = {};
      cur_point['x']=parseFloat(words[1]);
      cur_point['y']=parseFloat(words[2]);
      cur_point['z']=parseFloat(words[3]);
      //console.log(words);
      normals.push(cur_point);
    }
  }
  //console.log(points);
  // let lines = filedata.split('\n');
  var curmtl = ''
  for (var jj=0; jj<lines.length; jj++){
    let words = lines[jj].split(' ');
    if(words[0] == "f") {
      for (let wc = 1; wc < 4; wc++) {
        let vxdata = words[wc].split('/')
        let t = parseInt(vxdata[0]) - 1
        let f = parseInt(vxdata[2]) - 1
        vertex_buffer_data.push(points[t].x)
        vertex_buffer_data.push(points[t].y)
        vertex_buffer_data.push(points[t].z)

        if (model.invertNormals) {
          normal_buffer_data.push(-normals[f].x)
          normal_buffer_data.push(-normals[f].y)
          normal_buffer_data.push(-normals[f].z)
        } else {
          normal_buffer_data.push(normals[f].x)
          normal_buffer_data.push(normals[f].y)
          normal_buffer_data.push(normals[f].z)
        }

        color_buffer_data.push(mtllib[curmtl][0])
        color_buffer_data.push(mtllib[curmtl][1])
        color_buffer_data.push(mtllib[curmtl][2])
        color_buffer_data.push(model.alpha)
      }
    } else if (words[0] == 'usemtl') curmtl = words[1]
  }

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal_buffer_data), gl.STATIC_DRAW);

  model.vertexBuffer = vertexBuffer
  model.normalBuffer = normalBuffer
  model.numVertex = vertex_buffer_data.length / 3;
}

function drawModel (model) {
  if (!model.vertexBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer)
  gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer)
  gl.vertexAttribPointer(program.normalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, Matrices.model);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelInv"), false, m.inverse(Matrices.model));

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, model.numVertex);
}

function drawLight(model) {
  gl.uniform1i(gl.getUniformLocation(program, "isLight"), 1);
  drawModel(model);
  gl.uniform1i(gl.getUniformLocation(program, "isLight"), 0);
}

module.exports = {
  makeModel,
  createModel,
  drawModel,
  drawLight,
}
