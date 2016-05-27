import glsl from 'glslify'
import drawTriangle from 'a-big-triangle'
import Shell from 'gl-now'
import createShader from 'gl-shader'
import createFBO from 'gl-fbo'
import ndarray from 'ndarray'
import fill from 'ndarray-fill'
import now from 'right-now'

import CCapture from 'ccapture.js'

const shell = Shell()
shell.preventDefaults = false

const vert = glsl('vertex.glsl')
const updateFrag = glsl('update.glsl')
const drawFrag = glsl('draw.glsl')

const fboSize = [512, 512]
const scale = 1
const updateTicks = 8
const manualTick = false
const capture = false

// Karl Sim
const feed = 0.0235
const kill = 0.052
// Moving spots
// const feed = 0.014
// const kill = 0.054

// Karl sims
const diffuse = [1, 0.5]
// pmneila
// const diffuse = [0.2097, 0.105]

// const foreColor = [255 / 255, 174 / 255, 48 / 255] // Orange
const foreColor = [1, 1, 1]
const brushSize = 10

let updateShader
let drawShader

let aspectRatio
let state

let current = 0

function getAspect (width, height) {
  if (width > height) {
    aspectRatio = [1, height / width]
  } else {
    aspectRatio = [width / height, 1]
  }
}

let capturer
let startTime
let captureLength = 20 * 1000

shell.on('gl-init', () => {
  let gl = shell.gl
  shell.scale = 0.5

  getAspect(shell.width, shell.height)

  gl.disable(gl.DEPTH_TEST)

  updateShader = createShader(gl, vert, updateFrag)
  drawShader = createShader(gl, vert, drawFrag)

  state = [
    createFBO(gl, fboSize, { depth: false, float: true }),
    createFBO(gl, fboSize, { depth: false, float: true }) ]

  // Set filters
  state[0].color[0].magFilter = gl.LINEAR
  state[0].color[0].minFilter = gl.LINEAR
  state[1].color[0].magFilter = gl.LINEAR
  state[1].color[0].minFilter = gl.LINEAR

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

  if (capture) {
    capturer = new CCapture({ format: 'jpg', verbose: true, name: 'alien-disco' })
    capturer.start()
    startTime = now()
  }
})

shell.on('tick', () => {
  let gl = shell.gl

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

    drawTriangle(gl)
  }

  if (manualTick) {
    console.log('tick')
    shell.paused = true
  }
})
shell.on('resize', getAspect)
shell.on('gl-render', () => {
  drawShader.bind()

  drawShader.uniforms.scale = scale

  drawShader.uniforms.state = state[current].color[0].bind()
  drawShader.uniforms.aspectRatio = aspectRatio
  drawShader.uniforms.foreColor = foreColor

  drawTriangle(shell.gl)
  if (capture) {
    if (now() - startTime < captureLength) {
      capturer.capture(shell.canvas)
    } else {
      shell.paused = true
      capturer.stop()
      capturer.save()
    }
  }
})
window.shell = shell
