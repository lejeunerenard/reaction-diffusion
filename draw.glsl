precision mediump float;

# define PI 3.14159265359

uniform sampler2D state;
uniform vec2 aspectRatio;
uniform float scale;
uniform vec3 foreColor;
uniform vec2 resolution;

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

vec3 surface3D(vec2 pos) {
  vec4 pix = texture2D( state, pos );
  float z = pix.r - pix.g;

  return vec3(pos, z);
}
vec3 surfaceNormal(vec2 pos) {
  vec2 texel = vec2(1.) / resolution;

  vec3 left = surface3D(pos - texel * vec2(1.,0.));
  vec3 right = surface3D(pos + texel * vec2(1.,0.));

  vec3 up = surface3D(pos - texel * vec2(0.,1.));
  vec3 down = surface3D(pos + texel * vec2(0.,1.));

  vec3 horz = right - left;
  vec3 vert = down - up;

  return normalize(cross(horz, vert));
}

const vec3 light = normalize(vec3(-1., -1., 1.));

void main() {
  vec2 pos = uv - 0.5;
  pos = pos * aspectRatio;
  pos = pos / scale;
  pos = pos + 0.5;

  vec4 pix = texture2D( state, pos );

  float amount = pix.r - pix.g;
  // vec3 norm = surfaceNormal(pos);
  // float amount = dot(norm, light);

  // Flipped
  // gl_FragColor = vec4( foreColor * (1. - vec3(amount)), 1. );

  // gl_FragColor = vec4( foreColor * vec3(amount), 1. );
  // gl_FragColor = vec4( coColor(amount), 1. );

  // gl_FragColor = vec4( foreColor * vec3(amount), 1. );

  // Cos color
  gl_FragColor = vec4( coColor(amount), 1. );
}
