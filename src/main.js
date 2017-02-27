var { createProgramFromScripts } = require('./program')
var { drawModel, makeModel } = require('./models')
var m = require('./matrix')
var fishX=0.05,fishY=0;
var isRotating = 0;
var fishRotationX = 0,fishRotationY = 0;
var posX = 1, posY = -1;
var nextAngleRotation = Math.PI/2;

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

  makeModel('fish', 'assets/fish', [0, 0, 0])
  makeModel('xaxis', 'assets/cube', [1, 0, 0], [1, 0.1, 0.1])
  makeModel('yaxis', 'assets/cube', [0, 1, 0], [0.1, 1, 0.1])
  makeModel('aquarium', 'assets/aquarium', [0, 0, 0], [10, 7, 10], 0.5)

  setInterval(drawScene, 50);
}
window.Initialize = Initialize

function drawScene()
{
  updateCamera();
  var { fish, aquarium } = models;
  var { xaxis, yaxis } = models;
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
      if(fish['center'][2]<=6.0)
      {
        fish['center'][2] += posY * fishY;
        if(fish['center'][2]>=6.0)
        {
          isRotating = 2;
        }
      }
    }
    else
    {
      if(fish['center'][2]>=-6.0)
      {
        fish['center'][2] += posY * fishY;
        if(fish['center'][2]<=-6.0)
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
      fish['center'][2] += posY * fishY;
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
      fish['center'][2] += posY * fishY;
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
  Matrices.model = m.scale(fish.scale)
  Matrices.model = m.multiply(Matrices.model, m.rotateY(Math.PI/2))
  transform = m.multiply(m.rotateY(fishRotationY), m.rotateX(fishRotationX));
  Matrices.model = m.multiply(transform, Matrices.model)
  Matrices.model = m.multiply(m.translate(fish.center), Matrices.model)
  drawModel(fish)

  Matrices.model = m.multiply(m.translate(xaxis.center), m.scale(xaxis.scale))
  drawModel(xaxis)
  Matrices.model = m.multiply(m.translate(yaxis.center), m.scale(yaxis.scale))
  drawModel(yaxis)

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.enable(gl.BLEND);
  Matrices.model = m.multiply(m.translate(aquarium.center), m.scale(aquarium.scale))
  drawModel(aquarium)
  gl.disable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
}

function updateCamera() {
  var eye = [12, 12, 12];
  var target = [0, 0, 0];
  var up = [0, 1, 0];
  Matrices.view = m.lookAt(eye, target, up);
  Matrices.projection = m.perspective(Math.PI/2, 1, 0.1, 500);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, Matrices.view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, Matrices.projection);
  // return m.multiply(Matrices.projection, Matrices.view);
}
