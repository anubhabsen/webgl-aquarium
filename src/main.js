var { createProgramFromScripts } = require('./program')
var { drawModel, makeModel } = require('./models')

window.$ = require('jquery')
window.viewMatrix = []
window.models = {}

function makeYRotation(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
}

function Initialize() {
  window.canvas = document.getElementById("canvas");

  window.gl = canvas.getContext("experimental-webgl");
  gl.viewport(0, 0, canvas.width, canvas.height);

  // setup a GLSL program
  window.program = createProgramFromScripts(gl,"2d-vertex-shader", "2d-fragment-shader");
  gl.useProgram(program);

  viewMatrix = makeYRotation(0 * (3.14/180));
  makeModel('cube1', 0, 0, 0, 0.2, 0.2, 0.2, 'assets/cube.data')

  setInterval(drawScene, 50);
}
window.Initialize = Initialize

var temp = 0;
function drawScene(){
  for(var key in models){
    var model = models[key];
    // console.log(model);
    model['center'][0] += 0.01;
    viewMatrix = makeYRotation(temp);
    drawModel(model)
  }
  temp += .314
}
