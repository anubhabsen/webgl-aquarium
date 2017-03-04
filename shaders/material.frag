precision mediump float;

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

struct Light {
  vec3 position;

  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};

varying vec3 FragPos, Normal;
varying vec2 TextureCoord;

uniform vec3 viewPos;
uniform Light light;
uniform Material material;
uniform bool isLight;
uniform sampler2D sampler;
uniform bool isTextured;

void main() {
  // Ambient
  vec3 ambientC = light.ambient * material.ambient;

  // Diffuse
  vec3 norm = normalize(Normal);
  vec3 lightDir = normalize(light.position - FragPos);
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuseC = light.diffuse * (diff * material.diffuse);

  // Specular
  vec3 viewDir = normalize(viewPos - FragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
  vec3 specularC = light.specular * (spec * material.specular);

  vec3 result = ambientC + diffuseC + specularC;

  vec4 fragmentColor;
  if (isTextured) {
      fragmentColor = texture2D(sampler, vec2(TextureCoord.s, TextureCoord.t));
  } else {
      fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  gl_FragColor = vec4(fragmentColor.rgb * result, fragmentColor.a);

  if (isLight) gl_FragColor = vec4(1.0);
}
