var { createProgramFromScripts } = require('./program')
var { drawModel, makeModel } = require('./models')
var m = require('./matrix')
var fishX=0.05,fishY=0,fishZ=0;
var isRotating = 0;
var fishInit = 0;
var fishRotationX = 0.5,fishRotationY = 1;
var posX = 1, posY = 1;
var nextAngleRotation = 3.14;

window.$ = require('jquery')
window.Matrices = {}
window.models = {}

function Initialize()
{
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
function drawScene()
{
  updateCamera();
  var { fish } = models;
  var transform;
  if(!isRotating)
  {
    if(posX==1)
    {
      if(fish['center'][0]<=6.0)
      {
        fish['center'][0] += posX * fishX;
        if(fish['center'][0]>=6.0)
        {
          isRotating = 1;
        }
      }
    }
    else
    {
      if(fish['center'][0]>=-6.0)
      {
        fish['center'][0] += posX * fishX;
        if(fish['center'][0] <=-6.0)
        {
          isRotating = 1;
        }
      }
    }
    if(posY==1)
    {
      // console.log(fishY);
      if(fish['center'][1]<=6.0)
      {
        fish['center'][1] += posY * fishY;
        if(fish['center'][1]>=6.0)
        {
          isRotating = 2;
        }
      }
    }
    else
    {
      if(fish['center'][1]>=-6.0)
      {
        fish['center'][1] += posY * fishY;
        if(fish['center'][1]<=-6.0)
        {
          isRotating = 2;
        }
      }
    }
  }
  else
  {
    if(isRotating==1)
    {
      fishX = 0.05;
      fishY = 0.08;
      fish['center'][0] += posX * fishX;
      fish['center'][1] += posY * fishY;
      fishRotationY += 0.05;
      if(fishRotationY>=nextAngleRotation)
      {
        isRotating = 0;
        fishX = 0;
        fishY = 0.05;
        fishRotationY= nextAngleRotation;
        nextAngleRotation += 1.57;
        posX *= -1;
      }
    }
    else if(isRotating == 2)
    {
      fishX = 0.08;
      fishY = 0.05;
      fish['center'][0] += posX * fishX;
      fish['center'][1] += posY * fishY;
      fishRotationY += 0.05;
      if(fishRotationY>=nextAngleRotation)
      {
        isRotating = 0;
        fishX = 0.05;
        fishY = 0;
        fishRotationY= nextAngleRotation;
        nextAngleRotation += 1.57;
        posY *= -1;
      }
    }
  }
  Matrices.model = m.multiply(m.translate(fish.center), m.scale(fish.scale))
  transform = m.multiply(m.rotateY(fishRotationY), m.rotateX(fishRotationX));
  Matrices.model = m.multiply(transform, Matrices.model)
  drawModel(fish)

  // viewMatrix = m.multiply(m.translate(aquarium.center), m.scale(aquarium.scale))
  // transform = m.multiply(m.rotateY(0.2), m.rotateX(.5));
  // viewMatrix = m.multiply(transform, viewMatrix)
  // drawModel(aquarium)

  temp += .314
}

function updateCamera() {
  var eye = [0, 0, -5];
  var target = [0, 0, 0];
  var up = [0, 1, 0];
  Matrices.view = m.lookAt(eye, target, up);
  Matrices.projection = m.perspective(Math.PI/2, 1, 0.1, 500);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, Matrices.view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, Matrices.projection);
  // return m.multiply(Matrices.projection, Matrices.view);
}
