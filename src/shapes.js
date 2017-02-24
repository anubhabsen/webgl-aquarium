var rectangles = {}, circles = {}

function drawRectangle(name, center, height, width, color){
  for (let i = 0; i < color.length; i++) {
    if (i%4 != 3){
      color[i] /= 255.0;
    }
  }

  //Setup the color variable for the shader
  var vertexColor = gl.getAttribLocation(program, "a_color");
  var colors = [
    color[0], color[1], color[2], color[3],    // white
    color[0], color[1], color[2], color[3],    // white
    color[0], color[1], color[2], color[3],    // white
    color[0], color[1], color[2], color[3],    // white
    color[0], color[1], color[2], color[3],    // white
    color[0], color[1], color[2], color[3]    // white
  ];
  var colorbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(vertexColor);
  gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put a single clipspace rectangle in
  // it (2 triangles)
  //console.log(center.x - width/2, center.y - height/2);
  var vertices = [
    center.x - width/2, center.y - height/2,
    center.x + width/2, center.y - height/2,
    center.x - width/2, center.y + height/2,
    center.x + width/2, center.y - height/2,
    center.x + width/2, center.y + height/2,
    center.x - width/2, center.y + height/2
  ];
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  var object = {'color':[color[0]*255,color[1]*255,color[2]*255,color[3]], 'center':center, 'height':height, 'width':width};
  rectangles[name] = object;
}

function drawCircle(name, center, radius, color, triangles){

  color[0]/=255.0;
  color[1]/=255.0;
  color[2]/=255.0;

  var colors = [];

  for(let i=0; i<triangles*3; i++){
    colors.push(color[0]);
    colors.push(color[1]);
    colors.push(color[2]);
    colors.push(color[3]);
  }

  //Setup the color variable for the shader
  var vertexColor = gl.getAttribLocation(program, "a_color");
  var colorbuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(vertexColor);
  gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer and put a single clipspace rectangle in
  // it (2 triangles)
  //console.log(center.x - width/2, center.y - height/2);

  var vertices = [];
  var angle=(2*3.1415/triangles);
  var current_angle = 0;

  for(let i=0; i<triangles; i++){
    vertices.push(center.x);
    vertices.push(center.y);
    vertices.push(center.x + radius*Math.cos(current_angle));
    vertices.push(center.y + radius*Math.sin(current_angle));
    vertices.push(center.x + radius*Math.cos(current_angle+angle));
    vertices.push(center.y + radius*Math.sin(current_angle+angle));
    current_angle += angle;
  }

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 3*triangles);

  var object = {'color':[color[0]*255,color[1]*255,color[2]*255,color[3]], 'center':center, 'radius':radius};
  circles[name] = object;
}

module.exports = {
  rectangles,
  circles,
  drawRectangle,
  drawCircle,
}
