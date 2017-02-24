var { createProgramFromScripts } = require('./program')
var { drawModel, makeModel } = require('./models')
var m = require('./matrix')

window.$ = require('jquery')
window.viewMatrix = []
window.models = {}

function Initialize() {
  window.canvas = document.getElementById("canvas");

  window.gl = canvas.getContext("experimental-webgl");
  gl.viewport(0, 0, canvas.width, canvas.height);

  // setup a GLSL program
  window.program = createProgramFromScripts(gl,"2d-vertex-shader", "2d-fragment-shader");
  gl.useProgram(program);

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
    viewMatrix = m.multiply(m.rotateY(temp), m.rotateX(.5));
    drawModel(model)
  }
  temp += .314
}
