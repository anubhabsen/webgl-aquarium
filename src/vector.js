function dot([x, y, z], [p, q, r]) {
  return x*p + y*q + z*r
}

function cross([ux, uy, uz], [vx, vy, vz]) {
  var x = uy*vz - uz*vy;
  var y = uz*vx - ux*vz;
  var z = ux*vy - uy*vx;
  return [x, y, z];
}

function add([x, y, z], [p, q, r]) {
  return [x + p, y + q, z + r]
}

function subtract([x, y, z], [p, q, r]) {
  return [x - p, y - q, z - r]
}

function abs([x, y, z]) {
  return Math.sqrt(x*x + y*y + z*z)
}

function normalize([x, y, z]) {
  var t = abs([x, y, z])
  return [x/t, y/t, z/t]
}

function multiplyScalar([x, y, z], c) {
  return [x*c, y*c, z*c]
}

module.exports = {
  dot,
  cross,
  add,
  subtract,
  abs,
  normalize,
  multiplyScalar,
}
