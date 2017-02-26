function openFile(name, center, scale, alpha, filename){
  var datastring;
  $.ajax({
    url : filename,
    dataType: "text",
    success : function (data) {
      datastring = data;
      createModel(name, center, scale, alpha, datastring);
    }
  });
}

function makeModel(name, filename, center = [0, 0, 0], scale = [1, 1, 1], alpha = 1){
  openFile(name, center, scale, alpha, filename);
}

function createModel(name, center, scale, alpha, filedata) //Create object from blender
{
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
  for (var jj=0; jj<lines.length; jj++){
    let words = lines[jj].split(' ');
    if(words[0] == "f"){
      var t = [];
      var linemod = lines[jj].substring(1);
      let j,ans=0,state=0;
      for(j=0;j<linemod.length;j++){
        if(linemod[j]==' '){
          ans=0;
          state=1;
        }
        else if(linemod[j]=='/' && ans!=0 && state==1){
          t.push(ans);
          state=0;
        }
        else if(linemod[j]!='/'){
          ans=ans*10+linemod.charCodeAt(j)-'0'.charCodeAt(0);
        }
      }
      t.push(ans);
      var my_triangle = {};
      my_triangle['p1'] = t[0]-1;
      my_triangle['p2'] = t[1]-1;
      my_triangle['p3'] = t[2]-1;
      vertex_buffer_data.push(points[my_triangle['p1']]['x']);
      vertex_buffer_data.push(points[my_triangle['p1']]['y']);
      vertex_buffer_data.push(points[my_triangle['p1']]['z']);
      vertex_buffer_data.push(points[my_triangle['p2']]['x']);
      vertex_buffer_data.push(points[my_triangle['p2']]['y']);
      vertex_buffer_data.push(points[my_triangle['p2']]['z']);
      vertex_buffer_data.push(points[my_triangle['p3']]['x']);
      vertex_buffer_data.push(points[my_triangle['p3']]['y']);
      vertex_buffer_data.push(points[my_triangle['p3']]['z']);
    }
    if(words[0] == 'c'){
      var r1,g1,b1,r2,g2,b2,r3,g3,b3;
      r1 = words[1]; g1 = words[2]; b1 = words[3];
      r2 = words[4]; g2 = words[5]; b2 = words[6];
      r3 = words[7]; g3 = words[8]; b3 = words[9];
      color_buffer_data.push(r1/255.0);
      color_buffer_data.push(g1/255.0);
      color_buffer_data.push(b1/255.0);
      color_buffer_data.push(alpha);
      color_buffer_data.push(r2/255.0);
      color_buffer_data.push(g2/255.0);
      color_buffer_data.push(b2/255.0);
      color_buffer_data.push(alpha);
      color_buffer_data.push(r3/255.0);
      color_buffer_data.push(g3/255.0);
      color_buffer_data.push(b3/255.0);
      color_buffer_data.push(alpha);
    }
  }

  while (3*color_buffer_data.length < 4*vertex_buffer_data.length) {
    color_buffer_data.push(0.5)
    color_buffer_data.push(0.75)
    color_buffer_data.push(1)
    color_buffer_data.push(1)
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
