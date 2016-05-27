precision mediump float;

uniform sampler2D priorFrame;
uniform vec2 resolution;
uniform vec2 diffuse;
uniform float feed;
uniform float kill;
uniform mat3 laplaceMatrix;

varying vec2 uv;

vec2 laplace(vec2 center) {
  vec2 sum = vec2(0.);

  for(int i = -1; i <= 1; i++) {
    for(int j = -1; j <= 1; j++) {
      vec2 offset = vec2(i, j) / resolution;
      vec2 pos = center + offset;

      sum += laplaceMatrix[i+1][j+1] * texture2D( priorFrame, pos).rg;
    }
  }

  return sum;
}

void main() {
  vec4 prev = texture2D(priorFrame, uv);

  vec2 lap = laplace(uv);

  float a = prev.r;
  float b = prev.g;

  gl_FragColor = vec4(
    clamp(a + diffuse.r * lap.r - a * b * b + feed * ( 1. - a), 0., 1.),
    clamp(b + diffuse.g * lap.g + a * b * b - (kill + feed) * b, 0., 1.),
    0., 1.);
  // gl_FragColor = prev;
  // gl_FragColor = 1. - prev;
}
