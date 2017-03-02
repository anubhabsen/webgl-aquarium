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

function makeModel(name, filename, center = [0, 0, 0], scale = [1, 1, 1], invertNormals = false) {
  models[name] = {name, center, scale, invertNormals};
  openFile(name, filename);
}

function parseMtl(mtlstring) {
  var mtllib = {}
  var lines = mtlstring.split('\n');
  var curmtl = ''
  for (var j=0; j<lines.length; j++) {
    var words = lines[j].split(' ');
    if (words[0] == 'newmtl') {
      curmtl = words[1]
      mtllib[curmtl] = {}
    } else if (words[0] == 'Kd') {
      mtllib[curmtl].diffuse = [
        parseFloat(words[1]),
        parseFloat(words[2]),
        parseFloat(words[3]),
      ]
    } else if (words[0] == 'Ks') {
      mtllib[curmtl].specular = [
        parseFloat(words[1]),
        parseFloat(words[2]),
        parseFloat(words[3]),
      ]
    } else if (words[0] == 'Ka') {
      mtllib[curmtl].ambient = [
        parseFloat(words[1]),
        parseFloat(words[2]),
        parseFloat(words[3]),
      ]
    } else if (words[0] == 'Ns') {
      mtllib[curmtl].shininess = parseFloat(words[1])
    }
  }
  return mtllib
}

function createModel(name, filedata, mtlstring) //Create object from blender
{
  var model = models[name];
  var mtllib = parseMtl(mtlstring)
  var vertex_buffer_data = [];
  var diffuse_buffer_data = [];
  var specular_buffer_data = [];
  var ambient_buffer_data = [];
  var shininess_buffer_data = [];
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

        diffuse_buffer_data.push(mtllib[curmtl].diffuse[0])
        diffuse_buffer_data.push(mtllib[curmtl].diffuse[1])
        diffuse_buffer_data.push(mtllib[curmtl].diffuse[2])

        specular_buffer_data.push(mtllib[curmtl].specular[0])
        specular_buffer_data.push(mtllib[curmtl].specular[1])
        specular_buffer_data.push(mtllib[curmtl].specular[2])

        ambient_buffer_data.push(mtllib[curmtl].ambient[0])
        ambient_buffer_data.push(mtllib[curmtl].ambient[1])
        ambient_buffer_data.push(mtllib[curmtl].ambient[2])

        shininess_buffer_data.push(mtllib[curmtl].shininess)
      }
    } else if (words[0] == 'usemtl') curmtl = words[1]
  }

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW);
  model.vertexBuffer = vertexBuffer

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normal_buffer_data), gl.STATIC_DRAW);
  model.normalBuffer = normalBuffer

  var diffuseBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, diffuseBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuse_buffer_data), gl.STATIC_DRAW);
  model.diffuseBuffer = diffuseBuffer

  var specularBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, specularBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specular_buffer_data), gl.STATIC_DRAW);
  model.specularBuffer = specularBuffer

  var ambientBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ambientBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambient_buffer_data), gl.STATIC_DRAW);
  model.ambientBuffer = ambientBuffer

  var shininessBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shininessBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shininess_buffer_data), gl.STATIC_DRAW);
  model.shininessBuffer = shininessBuffer

  model.numVertex = vertex_buffer_data.length / 3;
}

function drawModel (model) {
  if (!model.vertexBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer)
  gl.vertexAttribPointer(program.positionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer)
  gl.vertexAttribPointer(program.normalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.diffuseBuffer)
  gl.vertexAttribPointer(program.diffuseAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.specularBuffer)
  gl.vertexAttribPointer(program.specularAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.ambientBuffer)
  gl.vertexAttribPointer(program.ambientAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.shininessBuffer)
  gl.vertexAttribPointer(program.shininessAttribute, 1, gl.FLOAT, false, 0, 0);

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
