precision lowp float;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_diffusion;
attribute vec3 a_spectral;
attribute vec3 a_ambient;
attribute float a_shininess;

uniform mat4 projection, view, model, modelInv;
uniform bool isFishLens;

varying lowp vec3 FragPos, Normal;

varying lowp vec3 diffusion, spectral, ambient;
varying lowp float shininess;

void main() {
  gl_Position = projection * view * model * vec4(a_position, 1);
  if (isFishLens) {
    float R = gl_Position.x * gl_Position.x + gl_Position.y * gl_Position.y;
    R = sqrt(R);
    float theta = atan(gl_Position.y, gl_Position.x);
    float cornerScale = min(abs(1.0/sin(theta)),abs(1.0/cos(theta)));
    if (cornerScale < 1.0) cornerScale = 1.0;
    R = cornerScale * pow(R, 3.0);
    gl_Position.x = R * cos(theta);
    gl_Position.y = R * sin(theta);
  }
  FragPos = vec3(model * vec4(a_position, 1.0));
  mat3 tm;
  tm[0] = vec3(modelInv[0].x, modelInv[1].x, modelInv[2].x);
  tm[1] = vec3(modelInv[0].y, modelInv[1].y, modelInv[2].y);
  tm[2] = vec3(modelInv[0].z, modelInv[1].z, modelInv[2].z);
  Normal = tm * vec3(a_normal);

  diffusion = a_diffusion;
  spectral = a_spectral;
  ambient = a_ambient;
  shininess = a_shininess;
}
