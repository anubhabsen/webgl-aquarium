var shaders = require('./shaders')
var { drawModel, makeModel, drawLight } = require('./models')
var m = require('./matrix')
var vec = require('./vector')
var weedStart = 0;
var movepositivex = 1;
var pebblesN = 15;

var { initFish, drawFish, updateFish, aquariumSize } = require('./fish')


var mousetrap = require('mousetrap')

mousetrap.bind('c', function () {
  Camera.mouseUpdate = !Camera.mouseUpdate;
})

mousetrap.bind('f', function () {
  Camera.fishLens = !Camera.fishLens;
})

mousetrap.bind('s', function () {
  var xd = Camera.lookx - Camera.x
  var yd = Camera.looky - Camera.y
  var zd = Camera.lookz - Camera.z
  var magnitude = Math.sqrt(xd*xd + yd*yd + zd*zd)
  Camera.x -= 0.8 * xd / magnitude
  Camera.y -= 0.8 * yd / magnitude
  Camera.z -= 0.8 * zd / magnitude
  updateCameraTarget()
})

mousetrap.bind('w', function() {
  var xd = Camera.lookx - Camera.x
  var yd = Camera.looky - Camera.y
  var zd = Camera.lookz - Camera.z
  var magnitude = Math.sqrt(xd*xd + yd*yd + zd*zd)
  Camera.x += 0.8 * xd / magnitude
  Camera.y += 0.8 * yd / magnitude
  Camera.z += 0.8 * zd / magnitude
  updateCameraTarget()
})

function updateCameraTarget(e) {
  if (!Camera.mouseUpdate) return;
  var rect = window.canvas.getBoundingClientRect();
  if (e) {
    Camera.mouseX = e.clientX;
    Camera.mouseY = e.clientY;
  }
  var x = Camera.mouseX - rect.left, y = Camera.mouseY - rect.top
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

var bubbles = {
  activeBubbles: [],
  num: 0
}

var foodData = {
  timeBeforeShrink: 3,
  startTime: 0,
  active: false,
}

var Camera = {
  x: 19,
  y: 9,
  z: 12,
  lookx: 0,
  looky: 0,
  lookz: 0,
  mouseUpdate: true,
  fishLens: false,
  mouseX: 0,
  mouseY: 0,
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

window.$ = require('jquery')
window.Matrices = {}
window.models = {}

function resizeCanvas() {
  canvas.height = canvas.width = Math.min($(document).height(), $(document).width())
}

function Initialize()
{
  window.canvas = document.getElementById("canvas");
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas)

  window.canvas.oncontextmenu = function() {
    bubbles.num++
    bubbles.activeBubbles.push(bubbles.num)
    var x = Math.floor(Math.random() * (2*aquariumSize.x + 1) - aquariumSize.x)
    var z = Math.floor(Math.random() * (2*aquariumSize.z + 1) - aquariumSize.z)
    makeModel('bubble' + bubbles.num.toString(), 'assets/bubble', [x, -aquariumSize.y + 2, z], [0.3, 0.3, 0.3])

    return false
  }

  window.canvas.onmousemove = updateCameraTarget

  window.canvas.onclick = function () {
    if (!foodData.active) {
      models.food['center'][0] = Math.floor(Math.random() * (2*aquariumSize.x + 1 - 1.6) - aquariumSize.x)
      models.food['center'][2] = Math.floor(Math.random() * (2*aquariumSize.z + 1 - 1.6) - aquariumSize.z)
      foodData.active = true;
      foodData.startTime = new Date().getTime() / 1000.0
    }
  }

  window.gl = canvas.getContext("experimental-webgl");
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // setup a GLSL program
  shaders.createShader('material')

  // makeModel('table','assets/Table',[0, -aquariumSize.y*2.7, -2],[12,8,10])

  for (let i = 0; i < pebblesN; i++) {
    makeModel('pebble'+i, 'assets/pebble', [-aquariumSize.x*0.9+1.8*aquariumSize.x*Math.random(),-aquariumSize.y+0.1, -aquariumSize.z*0.9+1.8*aquariumSize.z*Math.random()], [0.4, 0.4, 0.4])
  }

  makeModel('rock', 'assets/rock',[6,-aquariumSize.y+1,6],[0.4,0.4,0.4])

  makeModel('wall', 'assets/wall', [0, 0, 0], [30, 30, 30])

  makeModel('light', 'assets/cube', [28, 25, 0], [1, 1, 4])

  makeModel('fish', 'assets/fish', [0, 0, 0])
  makeModel('xaxis', 'assets/cube', [1, 0, 0], [1, 0.1, 0.1])
  makeModel('yaxis', 'assets/cube', [0, 1, 0], [0.1, 1, 0.1])
  makeModel('aquarium', 'assets/aquarium', [0, 0, 0], [aquariumSize.x, aquariumSize.y, aquariumSize.z])
  makeModel('sand', 'assets/sand', [0, -aquariumSize.y-1, 0], [aquariumSize.x, -1, aquariumSize.z])
  makeModel('metal', 'assets/metal', [0, aquariumSize.y+0.2, 0], [aquariumSize.x, 0.2, aquariumSize.z])
  makeModel('table', 'assets/table', [0, -(26-aquariumSize.y), 0], [1.5*aquariumSize.x, (28-aquariumSize.y), 2.5*aquariumSize.z])
  makeModel('weed', 'assets/weed', [- aquariumSize.x+3.2, - aquariumSize.y, 1], [0.04, 0.04, 0.04])
  makeModel('ship', 'assets/ship', [1.5,-aquariumSize.y+0.3, -aquariumSize.z*0.7], [2, 2, 2])
  makeModel('food', 'assets/food', [0, 0, 0], [1, 1, 1])

  makeModel('cubetex', 'assets/cubetex', [15, 10, 5])

  initFish()

  tick();
}
window.Initialize = Initialize

window.Camera = Camera

var lastTime = 0;
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime == 0) { lastTime = timeNow; return; }
  // var d = (timeNow - lastTime) / 50;
  updateCamera();
  updateBubbles();
  tickWeed();
  updateFood();
  updateFish();
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

function updateFood () {
  if (foodData.active) {
    if (models.food['center'][1] >= (-aquariumSize.y + 1)) {
      models.food['center'][1] -= 0.2;
    }
    else {
      var time = new Date().getTime() / 1000.0
      if (time - foodData.startTime <= foodData.timeBeforeShrink) {
        for (var i = 0; i <= 2; i++) models.food['scale'][i] -= 0.008
      }
      else {
        for (var j = 0; j <= 2; j++) models.food['scale'][j] = 1
        foodData.active = false
      }
    }
  }
  else {
    models.food['center'][1] = aquariumSize.y - 1
  }
}

function tickWeed() {
  var { weed } = models;


  if(weed.anglex <= 10 && movepositivex == 1) {
    weed.anglex += 0.2;
    if(weed.anglex > 10)
    {
      movepositivex = 0;
    }
  }
  if(weed.anglex >= -10 && movepositivex == 0) {
    weed.anglex -= 0.2;
    if(weed.anglex < -10)
    {
      movepositivex = 1;
    }
  }
}

function drawScene() {
  var { aquarium, sand, metal, ship } = models;
  var { weed, wall, light, rock, food, table } = models;
  // var { cubetex } = models
  //console.log(fishRotationY, fishRotationX);
  if(!weedStart)
  {
    weed.anglex = 0
    weed.angley = 0
    weed.anglez = 0
    weedStart = 1;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  shaders.useShader('material')

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Matrices.model = m.multiply(m.translate(cubetex.center), m.scale(cubetex.scale))
  // drawModel(cubetex)

  Matrices.model = m.scale(weed.scale)
  Matrices.model = m.multiply(Matrices.model, m.rotateX(weed.anglex * Math.PI / 180));
  //console.log(weed.center);
  Matrices.model = m.multiply(m.translate(weed.center), Matrices.model);
  drawModel(weed);

  Matrices.model = m.multiply(m.translate(rock.center), m.scale(rock.scale))
  drawModel(rock)

  Matrices.model = m.multiply(m.translate(sand.center), m.scale(sand.scale))
  drawModel(sand)

  Matrices.model = m.multiply(m.translate(metal.center), m.scale(metal.scale))
  drawModel(metal)

  // Matrices.model = m.scale(table.scale)
  // //Matrices.model = m.multiply(Matrices.model, m.rotateZ(10*Math.PI/180))
  // //Matrices.model = m.multiply(Matrices.model, m.rotateX(1*Math.PI/180))
  // Matrices.model = m.multiply(m.translate(table.center), Matrices.model)
  // drawModel(table)

  for (let i = 0; i < pebblesN; i++) {
    let pebble = models['pebble'+i]
    Matrices.model = m.multiply(m.translate(pebble.center), m.scale(pebble.scale))
    drawModel(pebble)
  }

  bubbles.activeBubbles.map(function (n) {
    var bubble = models['bubble' + n.toString()]
    Matrices.model = m.multiply(m.translate(bubble.center), m.scale(bubble.scale))
    drawModel(bubble)
  })

  Matrices.model = m.multiply(m.translate(wall.center), m.scale(wall.scale))
  drawModel(wall)

  Matrices.model = m.rotateZ(Math.PI*15/180)
  Matrices.model = m.multiply(m.scale(ship.scale), Matrices.model)
  Matrices.model = m.multiply(m.translate(ship.center), Matrices.model)
  drawModel(ship)

  Matrices.model = m.multiply(m.translate(table.center), m.scale(table.scale))
  drawModel(table)

  Matrices.model = m.multiply(m.translate(light.center), m.scale(light.scale))
  drawLight(light)

  if (foodData.active) {
    Matrices.model = m.multiply(m.translate(food.center), m.scale(food.scale))
    drawModel(food)
  }

  drawFish()

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  if (Camera.x > aquariumSize.x || Camera.x < -aquariumSize.x ||
      Camera.y > aquariumSize.y || Camera.y < -aquariumSize.y ||
      Camera.z > aquariumSize.z || Camera.z < -aquariumSize.z) {
    gl.enable(gl.CULL_FACE);
  }
  Matrices.model = m.multiply(m.translate(aquarium.center), m.scale(aquarium.scale))
  drawModel(aquarium)
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
}

function updateCamera() {
  var up = [0, 1, 0];
  var eye = [Camera.x, Camera.y, Camera.z]
  var target = [Camera.lookx, Camera.looky, Camera.lookz]
  Matrices.view = m.lookAt(eye, target, up);
  Matrices.projection = m.perspective(Math.PI/2, canvas.width / canvas.height, 0.1, 500);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "view"), false, Matrices.view);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false, Matrices.projection);
  gl.uniform1i(gl.getUniformLocation(program, "isFishLens"), Camera.fishLens);
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
  var ambientColor = vec.multiplyScalar(diffuseColor, 1); // Low influence
  gl.uniform3f(gl.getUniformLocation(program, "light.ambient"),  ambientColor[0], ambientColor[1], ambientColor[2]);
  gl.uniform3f(gl.getUniformLocation(program, "light.diffuse"),  diffuseColor[0], diffuseColor[1], diffuseColor[2]);
  gl.uniform3f(gl.getUniformLocation(program, "light.specular"), 1.0, 1.0, 1.0);
}

function tick() {
  window.requestAnimationFrame(tick);
  if (!window.program) return;
  drawScene();
  animate();
}
