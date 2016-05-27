precision mediump float;

# define PI 3.14159265359

uniform sampler2D state;
uniform vec2 aspectRatio;
uniform float scale;
uniform vec3 foreColor;

varying vec2 uv;

vec3 coColor(float t) {
  // Rainbow
  // vec3 a = vec3(.5);
  // vec3 b = vec3(.5);
  // vec3 c = vec3(1.);
  // vec3 d = vec3(0., .33, .67);

  // Neon
  vec3 a = vec3(.5);
  vec3 b = vec3(.5);
  vec3 c = vec3(2., 1., 0.);
  vec3 d = vec3(.5, .2, .25);

  // Cross color
  // vec3 a = vec3(.8, .5, .4);
  // vec3 b = vec3(.2, .4, .2);
  // vec3 c = vec3(2., 1., 1.);
  // vec3 d = vec3(0., .25, .25);

  // Outline
  // vec3 a = vec3(1.);
  // vec3 b = vec3(1.);
  // vec3 c = vec3(1.);
  // vec3 d = vec3(0.);

  return a + b * cos( 2. * PI * c * t + d);
}

void main() {
  vec2 pos = uv - 0.5;
  pos = pos * aspectRatio;
  pos = pos / scale;
  pos = pos + 0.5;

  vec4 pix = texture2D( state, pos );

  // Flipped
  // gl_FragColor = vec4( foreColor * (1. - vec3(pix.r - pix.g)), 1. );

  // gl_FragColor = vec4( foreColor * vec3(pix.r - pix.g), 1. );

  // Cos color
  gl_FragColor = vec4( coColor(pix.r - pix.g), 1. );
}
