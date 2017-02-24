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

  makeModel('fish', 'assets/fish.obj', [0, 0, 0], [0.1, 0.1, 0.1])
  // makeModel('aquarium', 'assets/cube.data', [0, 0, 0], [1, 1, 1], 0.0001)

  setInterval(drawScene, 50);
}
window.Initialize = Initialize

var temp = 0;
function drawScene(){
  var { fish } = models;
  var transform;

  fish['center'][0] += 0.1;
  viewMatrix = m.multiply(m.translate(fish.center), m.scale(fish.scale))
  transform = m.multiply(m.rotateY(temp), m.rotateX(.5));
  viewMatrix = m.multiply(transform, viewMatrix)
  drawModel(fish)

  // viewMatrix = m.multiply(m.translate(aquarium.center), m.scale(aquarium.scale))
  // transform = m.multiply(m.rotateY(0.2), m.rotateX(.5));
  // viewMatrix = m.multiply(transform, viewMatrix)
  // drawModel(aquarium)

  temp += .314
}
