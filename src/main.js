var { createProgramFromScripts } = require('./program')
var { drawRectangle, drawCircle, rectangles, circles } = require('./shapes')

function Initialize() {
  window.canvas = document.getElementById("canvas");

  window.gl = canvas.getContext("experimental-webgl");
  gl.viewport(0, 0, canvas.width, canvas.height);

  // setup a GLSL program
  window.program = createProgramFromScripts(gl,"2d-vertex-shader", "2d-fragment-shader");
  gl.useProgram(program);

  var color = [
    254,  240,  195,  1.0
  ];
  drawRectangle('boardbase', {'x':0, 'y':0}, 2, 2, color);

  var color2 = [
    125, 125, 78, 1.0
  ];
  drawCircle('striker', {'x':0, 'y':0}, 0.1, color2, 50);
  setInterval(drawScene, 50);
}
window.Initialize = Initialize

function drawScene(){
  for(let key in rectangles) {
    var rectangle = rectangles[key];
    drawRectangle(key, {'x':rectangle['center']['x'], 'y':rectangle['center']['y']}, rectangle['height'], rectangle['width'], rectangle['color']);
  }
  for(let key in circles) {
    circles[key].center['x'] += 0.01;
    var circle = circles[key];
    drawCircle(key, {'x':circle['center']['x'], 'y':circle['center']['y']}, circle['radius'], circle['color'], 50);
  }
}
