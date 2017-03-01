var shaders = require('./shaders')
var { drawModel, makeModel, drawLight } = require('./models')
var m = require('./matrix')
var vec = require('./vector')
var fishX=0.05,fishY=0;
var isRotating = 0;
var fishRotationX = 0,fishRotationY = 0;
var posX = 1, posY = -1;
var nextAngleRotation = Math.PI/2;

var mousetrap = require('mousetrap')

mousetrap.bind('c', function () {
  Camera.mouseUpdate = !Camera.mouseUpdate;
})

mousetrap.bind('f', function () {
  Camera.fishLens = !Camera.fishLens;
})

var aquariumSize = {
  x: 10,
  y: 7,
  z: 10,
}

var bubbles = {
  activeBubbles: [],
  num: 0
}

var Camera = {
  x: 12,
  y: 12,
  z: 12,
  lookx: 0,
  looky: 0,
  lookz: 0,
  mouseUpdate: true,
  fishLens: false,
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

window.$ = require('jquery')
window.Matrices = {}
window.models = {}

function Initialize()
{
  window.canvas = document.getElementById("canvas");

  window.canvas.oncontextmenu = function() {
    bubbles.num++
    bubbles.activeBubbles.push(bubbles.num)
    var x = Math.floor(Math.random() * (2*aquariumSize.x + 1) - aquariumSize.x)
    var z = Math.floor(Math.random() * (2*aquariumSize.z + 1) - aquariumSize.z)
    makeModel('bubble' + bubbles.num.toString(), 'assets/bubble', [x, -aquariumSize.y + 2, z], [0.3, 0.3, 0.3])

    return false
  }

  window.canvas.onmousemove = function(e) {
    if (!Camera.mouseUpdate) return;
    var rect = window.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top
    x = x - (window.canvas.width / 2.0), y = (window.canvas.height / 2.0) - y

    var theta = (-180.0 / window.canvas.height) * y + 90.0
    var phi = (360.0 / window.canvas.width) * x + 180.0

    var dx = 1 * Math.sin(toRadians(theta)) * Math.cos(toRadians(phi))
    var dy = 1 * Math.cos(toRadians(theta))
    var dz = 1 * Math.sin(toRadians(theta)) * Math.sin(toRadians(phi))

    Camera.lookx = Camera.x + dx
    Camera.looky = Camera.y + dy
    Camera.lookz = Camera.z + dz
  }

  window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == 87) {
      Camera.x += 0.8 * (Camera.lookx - Camera.x)
      Camera.y += 0.8 * (Camera.looky - Camera.y)
      Camera.z += 0.8 * (Camera.lookz - Camera.z)
    }
    else if (key == 83) {
      Camera.x -= 0.8 * (Camera.lookx - Camera.x)
      Camera.y -= 0.8 * (Camera.looky - Camera.y)
      Camera.z -= 0.8 * (Camera.lookz - Camera.z)
    }
  }

  window.gl = canvas.getContext("experimental-webgl");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // setup a GLSL program
  shaders.createShader('material')

  makeModel('fish', 'assets/fish', [0, 0, 0])

  makeModel('aquarium', 'assets/aquarium', [0, 0, 0], [aquariumSize.x, aquariumSize.y, aquariumSize.z])
  makeModel('weed', 'assets/weed', [- aquariumSize.x, - aquariumSize.y, 1], [0.05, 0.05, 0.05])

  makeModel('wall', 'assets/wall', [0, 0, 0], [30, 30, 30], true)

  makeModel('light', 'assets/cube', [28, 25, 0], [1, 1, 4])

  tick();
}
window.Initialize = Initialize

var lastTime = 0;
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime == 0) { lastTime = timeNow; return; }
  var d = (timeNow - lastTime) / 50;
  updateCamera();
  tickFish();
  updateBubbles();
  tickWeed();
  lastTime = timeNow;
}

function updateBubbles() {
  bubbles.activeBubbles.map(function (n, i) {
    var bubble = models['bubble' + n.toString()]
    var y = bubble['center'][1]

    if (y <= aquariumSize.y - 0.8) {
      bubble['center'][1] += 0.2
    }
    else {
      bubbles.activeBubbles.splice(i, 1)
    }
  })
}

function tickWeed() {
  var { weed } = models;
  weed.anglex = 0
  weed.angley = 0
  weed.anglez = 0
  var movepositivex = 1
  if(weed.anglex <= 30 && movepositivex == 1) {
    weed.anglex += 10
    if(weed.anglex > 30)
    {
      movepositivex = 0;
    }
  }
  if(weed.anglex >= -30 && movepositivex == 0) {
    weed.anglex -= 10
    if(weed.anglex < -30)
    {
      movepositivex = 1
    }
  }
}

function tickFish() {
  var { fish } = models;
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
}

function tickCube(d) {
  var { cube } = models;
  cube.rotation += 0.0314 * d;
}

function drawScene() {
  var { fish, aquarium } = models;
  var { weed, wall, light } = models;
  var transform;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaders.useShader('material')

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  Matrices.model = m.scale(fish.scale)
  Matrices.model = m.multiply(Matrices.model, m.rotateY(Math.PI/2))
  transform = m.multiply(m.rotateY(fishRotationY), m.rotateX(fishRotationX));
  Matrices.model = m.multiply(transform, Matrices.model)
  Matrices.model = m.multiply(m.translate(fish.center), Matrices.model)
  drawModel(fish)

  Matrices.model = m.multiply(m.rotateY(0), m.rotateX(weed.anglex * Math.PI / 180))
  Matrices.model = m.multiply(m.translate(weed.center), m.scale(weed.scale))
  drawModel(weed)

  bubbles.activeBubbles.map(function (n) {
    var bubble = models['bubble' + n.toString()]
    Matrices.model = m.multiply(m.translate(bubble.center), m.scale(bubble.scale))
    drawModel(bubble)
  })

  Matrices.model = m.multiply(m.translate(wall.center), m.scale(wall.scale))
  drawModel(wall)

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.enable(gl.CULL_FACE);
  Matrices.model = m.multiply(m.translate(aquarium.center), m.scale(aquarium.scale))
  drawModel(aquarium)
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);

  Matrices.model = m.multiply(m.translate(light.center), m.scale(light.scale))
  drawLight(light)
}

function updateCamera() {
  var up = [0, 1, 0];
  var eye = [Camera.x, Camera.y, Camera.z]
  var target = [Camera.lookx, Camera.looky, Camera.lookz]
  Matrices.view = m.lookAt(eye, target, up);
  Matrices.projection = m.perspective(Math.PI/2, 1, 0.1, 500);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, Matrices.view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, Matrices.projection);
  // return m.multiply(Matrices.projection, Matrices.view);

  var lightPos = models.light.center
  var lightPosLoc    = gl.getUniformLocation(program, "light.position");
  var viewPosLoc     = gl.getUniformLocation(program, "viewPos");
  gl.uniform3f(lightPosLoc, lightPos[0], lightPos[1], lightPos[2]);
  gl.uniform3f(viewPosLoc,  eye[0], eye[1], eye[2]);
  var lightColor = [];
  lightColor[0] = 1;
  lightColor[1] = 1;
  lightColor[2] = 1;
  var diffuseColor = vec.multiplyScalar(lightColor, 0.5); // Decrease the influence
  var ambientColor = vec.multiplyScalar(diffuseColor, 0.2); // Low influence
  gl.uniform3f(gl.getUniformLocation(program, "light.ambient"),  ambientColor[0], ambientColor[1], ambientColor[2]);
  gl.uniform3f(gl.getUniformLocation(program, "light.diffuse"),  diffuseColor[0], diffuseColor[1], diffuseColor[2]);
  gl.uniform3f(gl.getUniformLocation(program, "light.specular"), 1.0, 1.0, 1.0);
}

function tick() {
  window.requestAnimationFrame(tick);
  drawScene();
  animate();
}
