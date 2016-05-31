import glsl from 'glslify'
import drawTriangle from 'a-big-triangle'
import createShader from 'gl-shader'
import createFBO from 'gl-fbo'
import ndarray from 'ndarray'
import fill from 'ndarray-fill'

import assign from 'object-assign'
import defined from 'defined'

const vert = glsl('vertex.glsl')
const updateFrag = glsl('update.glsl')
const drawFrag = glsl('draw.glsl')

const foreColor = [1, 1, 1]
// const foreColor = [255 / 255, 174 / 255, 48 / 255] // Orange

export default class App {
  constructor (gl, feed, kill, diffuse, opt = {}) {
    let fboSize = defined(opt.fboSize, [512, 512])
    let scale = defined(opt.scale, 1)
    let updateTicks = defined(opt.updateTicks, 12)
    let brushSize = defined(opt.brushSize, 10)
    let aspectRatio = defined(opt.aspectRatio, [1, 1])

    let updateShader = createShader(gl, vert, updateFrag)
    let drawShader = createShader(gl, vert, drawFrag)

    let state = [
      createFBO(gl, fboSize, { depth: false, float: true }),
      createFBO(gl, fboSize, { depth: false, float: true }) ]

    // Set filters
    state[0].color[0].magFilter = gl.LINEAR
    state[0].color[0].minFilter = gl.LINEAR
    state[1].color[0].magFilter = gl.LINEAR
    state[1].color[0].minFilter = gl.LINEAR

    let current = 0

    // Initialize cells
    let initFrameData = ndarray(new Uint8Array(fboSize[0] * fboSize[1] * 4), [...fboSize, 4])
    fill(initFrameData, function (x, y, c) {
      if (c === 3) {
        return 255
      }
      if (c === 0) {
        return 255
      }

      return 0
    })

    let centerWidth = brushSize
    let center = initFrameData.hi(
      Math.floor(fboSize[0] / 2 + centerWidth / 2),
      Math.floor(fboSize[0] / 2 + centerWidth / 2))
      .lo(
        Math.floor(fboSize[0] / 2 - centerWidth / 2),
        Math.floor(fboSize[0] / 2 - centerWidth / 2))

    for (let i = 0; i < center.shape[0]; ++i) {
      for (let j = 0; j < center.shape[1]; ++j) {
        center.set(i, j, 1, 230)
      }
    }

    state[0].color[0].setPixels(initFrameData)

    // Positioning
    drawShader.attributes.position.location =
      updateShader.attributes.position.location = 0

    assign(this, {
      gl,
      feed,
      kill,
      diffuse,

      // FBOs
      state,
      current,
      fboSize,

      // Shaders
      updateShader,
      drawShader,

      // Rendering parameters
      aspectRatio,
      scale,
      updateTicks
    })
  }

  update () {
    let {
      gl,
      updateTicks,
      state,
      current,
      updateShader,
      diffuse,
      feed,
      kill
    } = this

    for (let i = 0; i < updateTicks; i++) {
      let prevState = state[current]
      let curState = state[current ^= 1]

      curState.bind()

      updateShader.bind()
      updateShader.uniforms.priorFrame = prevState.color[0].bind()
      updateShader.uniforms.resolution = prevState.shape
      updateShader.uniforms.diffuse = diffuse
      updateShader.uniforms.feed = feed
      updateShader.uniforms.kill = kill

      updateShader.uniforms.laplaceMatrix =
      [
        0.05, 0.20, 0.05,
        0.20, -1.0, 0.20,
        0.05, 0.20, 0.05
      ]

      drawTriangle(gl)
    }
  }

  render () {
    let { gl, drawShader, scale, aspectRatio, state, current } = this

    drawShader.bind()

    drawShader.uniforms.scale = scale

    drawShader.uniforms.state = state[current].color[0].bind()
    drawShader.uniforms.aspectRatio = aspectRatio
    drawShader.uniforms.foreColor = foreColor
    drawShader.uniforms.resolution = state[current].shape

    drawTriangle(gl)
  }
}
