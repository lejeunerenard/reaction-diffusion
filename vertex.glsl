precision mediump float;

varying vec2 uv;
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  uv = 0.5 * (position + 1.0);
}
