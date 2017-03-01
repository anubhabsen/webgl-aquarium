struct Light {
  lowp vec3 position;

  lowp vec3 ambient;
  lowp vec3 diffuse;
  lowp vec3 specular;
};

varying lowp vec3 FragPos, Normal;

varying lowp vec3 diffusion, spectral, ambient;
varying lowp float shininess;

uniform lowp vec3 viewPos;
uniform Light light;
uniform bool isLight;

void main() {
  // Ambient
  lowp vec3 ambientC = light.ambient * ambient;

  // Diffuse
  lowp vec3 norm = normalize(Normal);
  lowp vec3 lightDir = normalize(light.position - FragPos);
  lowp float diff = max(dot(norm, lightDir), 0.0);
  lowp vec3 diffuseC = light.diffuse * (diff * diffusion);

  // Specular
  lowp vec3 viewDir = normalize(viewPos - FragPos);
  lowp vec3 reflectDir = reflect(-lightDir, norm);
  lowp float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
  lowp vec3 specularC = light.specular * (spec * spectral);

  lowp vec3 result = ambientC + diffuseC + specularC;
  gl_FragColor = vec4(result, 1.0);
  if (isLight) gl_FragColor = vec4(1.0);
}
