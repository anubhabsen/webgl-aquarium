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

  makeModel('cube1', 'assets/cube.data', [0, 0, 0], [0.2, 0.2, 0.2])

  setInterval(drawScene, 50);
}
window.Initialize = Initialize

var temp = 0;
function drawScene(){
  for(var key in models){
    var model = models[key];
    // console.log(model);
    model['center'][0] += 0.1;
    viewMatrix = m.multiply(m.translate(model.center), m.scale(model.scale))
    let transform = m.multiply(m.rotateY(temp), m.rotateX(.5));
    viewMatrix = m.multiply(transform, viewMatrix)
    drawModel(model)
  }
  temp += .314
}
