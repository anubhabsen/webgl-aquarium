function openFile(name, center, scale, alpha, filename){
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
          createModel(name, center, scale, alpha, datastring, mtlstring);
        }
      })
    }
  });
}

function makeModel(name, filename, center = [0, 0, 0], scale = [1, 1, 1], alpha = 1){
  openFile(name, center, scale, alpha, filename);
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

function createModel(name, center, scale, alpha, filedata, mtlstring) //Create object from blender
{
  var mtllib = parseMtl(mtlstring)
  var vertex_buffer_data = [];
  var color_buffer_data = [];
  var points = [];
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
    }
  }
  //console.log(points);
  // let lines = filedata.split('\n');
  var curmtl = ''
  for (var jj=0; jj<lines.length; jj++){
    let words = lines[jj].split(' ');
    if(words[0] == "f") {
      for (let wc = 1; wc < 4; wc++) {
        let vxdata = words[wc].split('//')
        let t = parseInt(vxdata[0]) - 1
        vertex_buffer_data.push(points[t].x)
        vertex_buffer_data.push(points[t].y)
        vertex_buffer_data.push(points[t].z)

        color_buffer_data.push(mtllib[curmtl][0])
        color_buffer_data.push(mtllib[curmtl][1])
        color_buffer_data.push(mtllib[curmtl][2])
        color_buffer_data.push(alpha)
      }
    } else if (words[0] == 'usemtl') curmtl = words[1]
  }

  var mymodel = {
    center,
    scale,
    name,
    vertex_buffer_data, color_buffer_data
  };
  models[name] = mymodel;
}

function drawModel (model) {
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  var vertexColor = gl.getAttribLocation(program, "a_color");
  var colorbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.color_buffer_data), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(vertexColor);
  gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertex_buffer_data), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "model"), false, Matrices.model);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, model.vertex_buffer_data.length/3);
}

module.exports = {
  makeModel,
  createModel,
  drawModel,
}
