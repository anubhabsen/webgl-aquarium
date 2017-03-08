var m = require('./matrix')
var mousetrap = require('mousetrap')
var { makeModel, drawModel } = require('./models')

var aquariumSize = {
  x: 10 * 0.8,
  y: 7 * 0.7,
  z: 10 * 0.8,
}

var aquariumSizeOri = {
  x: 10,
  y: 7,
  z: 10,
}

function toRad(angle) {
  return angle * Math.PI / 180.0
}

function timeNow() {
  return new Date().getTime() / 1000.0
}

var fishes = []
var turnTime = 10
var currentViewFish = 0
var fishViewOn = false

mousetrap.bind('left',  () => currentViewFish = (fishes.length + currentViewFish + 1) % fishes.length)
mousetrap.bind('right', () => currentViewFish = (fishes.length + currentViewFish - 1) % fishes.length)

function fishFront() {
  var fish = fishes[currentViewFish]
  var x = fish.lookx - fish.x
  var y = fish.looky - fish.y
  var z = fish.lookz - fish.z
  var magnitude = Math.sqrt(x*x + y*y + z*z)
  fish.x += 0.05 * x / magnitude
  fish.y += 0.05 * y / magnitude
  fish.z += 0.05 * z / magnitude
  fish.lookx += 0.05 * x / magnitude
  fish.looky += 0.05 * y / magnitude
  fish.lookz += 0.05 * z / magnitude
}

function fishLeft() {
  var fish = fishes[currentViewFish]
  var r = (fish.x - fish.lookx)*(fish.x - fish.lookx) + (fish.z - fish.lookz)*(fish.z - fish.lookz)
  r = Math.sqrt(r)
  var theta = Math.atan2(fish.z - fish.lookz, fish.x - fish.lookx)
  theta -= 0.02
  fish.lookx = fish.x + r * Math.cos(theta)
  fish.lookz = fish.z + r * Math.sin(theta)
}

function fishRight() {
  var fish = fishes[currentViewFish]
  var r = (fish.x - fish.lookx)*(fish.x - fish.lookx) + (fish.z - fish.lookz)*(fish.z - fish.lookz)
  r = Math.sqrt(r)
  var theta = Math.atan2(fish.z - fish.lookz, fish.x - fish.lookx)
  theta += 0.02
  fish.lookx = fish.x + r * Math.cos(theta)
  fish.lookz = fish.z + r * Math.sin(theta)
}

function Fish(x, y, z, lookx, looky, lookz, alive, type, id, scale, lastTurnTime, triggerReverse, angley) {
  return {
    x,
    y,
    z,
    lookx,
    looky,
    lookz,
    alive,
    type,
    id,
    scale,
    lastTurnTime,
    triggerReverse,
    angley
    // tempLook,
    // isRotating,
  }
}

function cycleFish() {
  fishViewOn = true
  var temp = [fishes[currentViewFish].x, fishes[currentViewFish].y, fishes[currentViewFish].z]
  var ret = temp.concat([fishes[currentViewFish].lookx, fishes[currentViewFish].looky, fishes[currentViewFish].lookz])
  // currentViewFish = (currentViewFish + 1) % fishes.length
  return ret
}

function cancelFishView() {
  currentViewFish = 0
  fishViewOn = false
}

function initFish () {
  var fish1 = Fish(0, 0, 0, 1, 1, 1, true, 1, 1, [0.7, 0.7, 0.7], timeNow(), 0, 0)
  var fish2 = Fish(3, 3, 3, -1, -1, -1, true, 2, 2, [0.7, 0.7, 0.7], timeNow(), 0, 0)
  var fish3 = Fish(-2, -2, -2, 1, 0, 0, true, 3, 3, [0.7, 0.7, 0.7], timeNow(), 0, 0)
  var fish4 = Fish(-1, 2, -2, 0, 0, 1, true, 4, 4, [0.7, 0.7, 0.7], timeNow(), 0, 0)

  fishes = [fish1, fish2, fish3, fish4]

  fishes.map(function (fish) {
    makeModel('fish' + fish.type.toString(), 'assets/fish' + fish.type, [fish.x, fish.y, fish.z], fish.scale)
  })
  makeModel('egg', 'assets/food', [0, 0, 0], [0.3, 0.3, 0.3])
}

function fishMoveTowardsFood(foodx, foody, foodz) {
  fishes.map(function (fish) {
    fish.lookx = foodx
    fish.looky = foody
    fish.lookz = foodz
  })
}

mousetrap.bind('k', function () {
  fishes.splice(currentViewFish || 0, 1);
  currentViewFish = (currentViewFish + 1) % fishes.length
})

var eggData = {
  timeBeforeShrink: 3,
  startTime: 0,
  active: false,
}

mousetrap.bind('e', function () {
  if (!eggData.active) {
    models.egg['center'][0] = fishes[currentViewFish || 0].x
    models.egg['center'][1] = fishes[currentViewFish || 0].y
    models.egg['center'][2] = fishes[currentViewFish || 0].z
    eggData.active = true;
    eggData.startTime = new Date().getTime() / 1000.0
  }
  // console.log('eggs');
})

function drawFish() {
  fishes.map(function (fish, idx) {
    if ((!fishViewOn) || (fishViewOn && (idx != currentViewFish))) {
      var mfish = models['fish' + fish.type.toString()]
      var eggs = models['egg']
      // var x = fish.lookx - fish.x
      // var y = fish.looky - fish.y
      // var z = fish.lookz - fish.z
      //
      // var theta = Math.atan2(z, x)
      // var phi = Math.atan2(y, Math.sqrt(x*x + z*z))
      // console.log("HIIII", theta, phi)
      Matrices.model = m.scale(fish.scale)
      Matrices.model = m.multiply(m.rotateY(fish.angley * Math.PI/180), Matrices.model)
      Matrices.model = m.multiply(m.inverse(m.lookAt([fish.x, fish.y, fish.z], [-fish.lookx, -fish.looky, -fish.lookz], [0, 1, 0])), Matrices.model)
      drawModel(mfish);
    }

    if (eggData.active) {
      Matrices.model = m.multiply(m.translate(eggs.center), m.scale(eggs.scale))
      drawModel(eggs)
    }
  })
}

function updateFish() {

  fishes.map(function (fish) {
    // if(fish.isRotating){
    //   if(fish.isRotating==1){
    //     fish.lookx -= fish.tempLook /10
    //   }
    //   else if(fish.isRotating == 2){
    //     fish.looky -= fish.tempLook/10
    //   }
    //   else if(fish.isRotating == 3){
    //     fish.lookz -= fish.tempLook/10
    //   }
    //   if(fish.lookx == -1 * fish.templook || fish.looky == -1 * fish.templook || fish.lookz == -1 * fish.templook){
    //     fish.isRotating = 0
    //     fish.tempLook = 0
    //   }
    // }
    // if(!fish.isRotating) {

      //Wiggling
      // console.log(fish.angley, fish.triggerReverse)
      if(fish.angley.toFixed(1) <= 10 && fish.triggerReverse == 1) {
          fish.angley += 1;
          fish.angley += Math.random()/2;
          if(fish.angley.toFixed(1) >= 10)
          {
            fish.angley = 10;
            fish.triggerReverse = 0;
          }
        }
      if(fish.angley.toFixed(1) >= -10 && fish.triggerReverse == 0) {
        fish.angley -= 1;
        fish.angley -= Math.random()/2;
        if(fish.angley.toFixed(1) <= -10)
        {
          fish.angley = -10
          fish.triggerReverse = 1;
        }
      }


      if (fish.x >= aquariumSize.x - 1.2 || fish.x <= -aquariumSize.x + 1.2) {
        fish.lookx = -1 * fish.lookx
        // fish.isRotating = 1
        // fish.tempLook = fish.lookx
      }
      if (fish.y >= aquariumSize.y - 1.2 || fish.y <= -aquariumSize.y + 1.2) {
        fish.looky = -1 * fish.looky
        // fish.isRotating = 2
        // fish.tempLook = fish.looky
      }
      if (fish.z >= aquariumSize.z - 1.2 || fish.z <= -aquariumSize.z + 1.2) {
        fish.lookz = -1 * fish.lookz
        // fish.isRotating = 3
        // fish.tempLook = fish.lookz
      }
      if (timeNow() - fish.lastTurnTime <= turnTime) {
        var x = fish.lookx - fish.x
        var y = fish.looky - fish.y
        var z = fish.lookz - fish.z
        var magnitude = Math.sqrt(x*x + y*y + z*z)
        fish.x += 0.07 * x / magnitude
        fish.y += 0.07 * y / magnitude
        fish.z += 0.07 * z / magnitude
        fish.lookx += 0.07 * x / magnitude
        fish.looky += 0.07 * y / magnitude
        fish.lookz += 0.07 * z / magnitude
      }
      else {
        fish.lookx = fish.x + 3 * (Math.random() - 0.5)
        fish.looky = fish.y + 3 * (Math.random() - 0.5)
        fish.lookz = fish.z + 3 * (Math.random() - 0.5)
        fish.lastTurnTime = timeNow()
      }

      if (fish.scale[0] < 0.7) fish.scale[0] = fish.scale[1] = fish.scale[2] = fish.scale[0] + 0.001
    // }
  })

}

function updateEgg () {
  if (eggData.active) {
    if (models.egg['center'][1] >= (-aquariumSize.y + 1)) {
      models.egg['center'][1] -= 0.2;
    }
    else {
      var time = new Date().getTime() / 1000.0
      if (time - eggData.startTime <= eggData.timeBeforeShrink) {
        for (var i = 0; i <= 2; i++) models.egg['scale'][i] -= 0.008
      }
      else {
        for (var j = 0; j <= 2; j++) models.egg['scale'][j] = 1
        eggData.active = false
        var fish5 = Fish(models.egg['center'][0], models.egg['center'][1] - 1, models.egg['center'][2], -1, -1, -1, true, 2, 2, [0.1, 0.1, 0.1], timeNow(), 0, 0);
        fishes.push(fish5);
      }
    }
  }
  else {
    models.egg['center'][1] = aquariumSize.y - 1
  }
}

module.exports = {
  initFish,
  drawFish,
  updateFish,
  cycleFish,
  cancelFishView,
  fishMoveTowardsFood,
  aquariumSize: aquariumSizeOri,
  updateEgg,
  fishFront,
  fishLeft,
  fishRight,
}
