var vec = require('./vector')

// 0 1 2 3        0 1 2 3
// 4 5 6 7        4 5 6 7
// 8 9 10 11      8 9 10 11
// 12 13 14 15    12 13 14 15
function matrixMultiply(mat2, mat1)
{
  return [
    mat1[0]*mat2[0]+mat1[1]*mat2[4]+mat1[2]*mat2[8]+mat1[3]*mat2[12],
    mat1[0]*mat2[1]+mat1[1]*mat2[5]+mat1[2]*mat2[9]+mat1[3]*mat2[13],
    mat1[0]*mat2[2]+mat1[1]*mat2[6]+mat1[2]*mat2[10]+mat1[3]*mat2[14],
    mat1[0]*mat2[3]+mat1[1]*mat2[7]+mat1[2]*mat2[11]+mat1[3]*mat2[15],
    mat1[4]*mat2[0]+mat1[5]*mat2[4]+mat1[6]*mat2[8]+mat1[7]*mat2[12],
    mat1[4]*mat2[1]+mat1[5]*mat2[5]+mat1[6]*mat2[9]+mat1[7]*mat2[13],
    mat1[4]*mat2[2]+mat1[5]*mat2[6]+mat1[6]*mat2[10]+mat1[7]*mat2[14],
    mat1[4]*mat2[3]+mat1[5]*mat2[7]+mat1[6]*mat2[11]+mat1[7]*mat2[15],
    mat1[8]*mat2[0]+mat1[9]*mat2[4]+mat1[10]*mat2[8]+mat1[11]*mat2[12],
    mat1[8]*mat2[1]+mat1[9]*mat2[5]+mat1[10]*mat2[9]+mat1[11]*mat2[13],
    mat1[8]*mat2[2]+mat1[9]*mat2[6]+mat1[10]*mat2[10]+mat1[11]*mat2[14],
    mat1[8]*mat2[3]+mat1[9]*mat2[7]+mat1[10]*mat2[11]+mat1[11]*mat2[15],
    mat1[12]*mat2[0]+mat1[13]*mat2[4]+mat1[14]*mat2[8]+mat1[15]*mat2[12],
    mat1[12]*mat2[1]+mat1[13]*mat2[5]+mat1[14]*mat2[9]+mat1[15]*mat2[13],
    mat1[12]*mat2[2]+mat1[13]*mat2[6]+mat1[14]*mat2[10]+mat1[15]*mat2[14],
    mat1[12]*mat2[3]+mat1[13]*mat2[7]+mat1[14]*mat2[11]+mat1[15]*mat2[15]
  ];
}

function matrixMultiply4x1(mat1, mat2)
{
  return [
    mat1[0]*mat2[0]+mat1[1]*mat2[1]+mat1[2]*mat2[2]+mat1[3]*mat1[3],
    mat1[4]*mat2[0]+mat1[5]*mat2[1]+mat1[6]*mat2[2]+mat1[7]*mat1[3],
    mat1[8]*mat2[0]+mat1[9]*mat2[1]+mat1[10]*mat2[2]+mat1[11]*mat1[3],
    mat1[12]*mat2[0]+mat1[13]*mat2[1]+mat1[14]*mat2[2]+mat1[15]*mat1[3]
  ];
}

function multiply(m1, m2)
{
  if (m2.length == 4) return matrixMultiply4x1(m1, m2)
  else return matrixMultiply(m1, m2)
}

function inverse(a)
{
  var s0 = a[0] * a[5] - a[4] * a[1];
  var s1 = a[0] * a[6] - a[4] * a[2];
  var s2 = a[0] * a[7] - a[4] * a[3];
  var s3 = a[1] * a[6] - a[5] * a[2];
  var s4 = a[1] * a[7] - a[5] * a[3];
  var s5 = a[2] * a[7] - a[6] * a[3];

  var c5 = a[10] * a[15] - a[14] * a[11];
  var c4 = a[9] * a[15] - a[13] * a[11];
  var c3 = a[9] * a[14] - a[13] * a[10];
  var c2 = a[8] * a[15] - a[12] * a[11];
  var c1 = a[8] * a[14] - a[12] * a[10];
  var c0 = a[8] * a[13] - a[12] * a[9];

  //console.log(c5,s5,s4);

  // Should check for 0 determinant
  var invdet = 1.0 / (s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0);

  var b = [[],[],[],[]];

  b[0] = ( a[5] * c5 - a[6] * c4 + a[7] * c3) * invdet;
  b[1] = (-a[1] * c5 + a[2] * c4 - a[3] * c3) * invdet;
  b[2] = ( a[13] * s5 - a[14] * s4 + a[15] * s3) * invdet;
  b[3] = (-a[9] * s5 + a[10] * s4 - a[11] * s3) * invdet;

  b[4] = (-a[4] * c5 + a[6] * c2 - a[7] * c1) * invdet;
  b[5] = ( a[0] * c5 - a[2] * c2 + a[3] * c1) * invdet;
  b[6] = (-a[12] * s5 + a[14] * s2 - a[15] * s1) * invdet;
  b[7] = ( a[8] * s5 - a[10] * s2 + a[11] * s1) * invdet;

  b[8] = ( a[4] * c4 - a[5] * c2 + a[7] * c0) * invdet;
  b[9] = (-a[0] * c4 + a[1] * c2 - a[3] * c0) * invdet;
  b[10] = ( a[12] * s4 - a[13] * s2 + a[15] * s0) * invdet;
  b[11] = (-a[8] * s4 + a[9] * s2 - a[11] * s0) * invdet;

  b[12] = (-a[4] * c3 + a[5] * c1 - a[6] * c0) * invdet;
  b[13] = ( a[0] * c3 - a[1] * c1 + a[2] * c0) * invdet;
  b[14] = (-a[12] * s3 + a[13] * s1 - a[14] * s0) * invdet;
  b[15] = ( a[8] * s3 - a[9] * s1 + a[10] * s0) * invdet;

  return b;
}

function perspective(fieldOfViewInRadians, aspect, near, far)
{
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);

  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ];
}

function makeZToWMatrix(fudgeFactor)
{
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, fudgeFactor,
    0, 0, 0, 1,
  ];
}

function translate(tx, ty, tz)
{
  if (typeof tx != 'number')
  {
    let old = tx
    tx = old[0]
    ty = old[1]
    tz = old[2]
  }
  return [
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1
  ];
}

function rotateX(angleInRadians)
{
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ];
}

function rotateY(angleInRadians)
{
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
}

function rotateZ(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

function scale(sx, sy, sz) {
  if (typeof sx != 'number') {
    let old = sx
    sx = old[0]
    sy = old[1]
    sz = old[2]
  }
  return [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
}

function lookAt(eye, target, up){
  var f = vec.normalize(vec.subtract(target, eye));
  var s = vec.normalize(vec.cross(f, up));
  var u = vec.cross(s, f);

  var result = identity();
  result[4*0 + 0] = s[0];
  result[4*1 + 0] = s[1];
  result[4*2 + 0] = s[2];
  result[4*0 + 1] = u[0];
  result[4*1 + 1] = u[1];
  result[4*2 + 1] = u[2];
  result[4*0 + 2] =-f[0];
  result[4*1 + 2] =-f[1];
  result[4*2 + 2] =-f[2];
  result[4*3 + 0] =-vec.dot(s, eye);
  result[4*3 + 1] =-vec.dot(u, eye);
  result[4*3 + 2] = vec.dot(f, eye);
  return result;
}

function identity() {
  return scale(1, 1, 1)
}

module.exports = {
  multiply,
  inverse,
  identity,

  perspective,
  makeZToWMatrix,
  lookAt,

  translate,
  rotateX, rotateY, rotateZ,
  scale,
}
