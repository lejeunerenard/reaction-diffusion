import Shell from 'gl-now'
import createContext from 'gl-context'

import App from './app'

import CCapture from 'ccapture.js'

const manualTick = false
const capture = true

// Karl Sim
const presets = {
  'alien-disco': {
    feed: 0.0235,
    kill: 0.052
  },
  'mitosis': {
    feed: 0.0367,
    kill: 0.0649
  },
  'my-mitosis': {
    feed: 0.0390,
    kill: 0.06515
  },
  'chaos-holes': {
    feed: 0.0340,
    kill: 0.0560
  },
  'maze': {
    feed: 0.0410,
    kill: 0.0600
  },
  'ripples': {
    feed: 0.017,
    kill: 0.051
  }
}
const { feed, kill } = presets['ripples']

// Moving spots
// const feed = 0.014
// const kill = 0.054

// Karl sims
const diffuse = [1, 0.5]
// pmneila
// const diffuse = [0.2097, 0.105]
//mrob
// const diffuse = [0.2, 0.1]

let app

function getAspect (width, height) {
  if (width > height) {
    app.aspectRatio = [1, height / width]
  } else {
    app.aspectRatio = [width / height, 1]
  }
}

let capturer
let captureLength = 25

const brushSize = 10
if (capture) {
  let canvas = document.createElement('canvas')

  let scale = 0.5

  let [ width, height ] = [ 1024, 1024 ]
  canvas.width = width / scale
  canvas.height = height / scale
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  let gl = createContext(canvas)

  app = new App(gl, feed, kill, diffuse, {
    brushSize
  })
  getAspect(width, height)

  let fr = 60
  capturer = new CCapture({
    format: 'jpg',
    verbose: true,
    name: 'reaction-diffusion',
    framerate: fr })

  capturer.start()

  let frames = 0

  function render () {
    if (frames >= captureLength * fr) {
      capturer.stop()
      capturer.save()
      return
    }

    app.update()

    // Bind default framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // Set viewport
    gl.viewport(0, 0, (width / scale) | 0, (height / scale) | 0)

    app.render()

    capturer.capture(canvas)
    frames++

    requestAnimationFrame(render)
  }
  render()
} else {
  const shell = Shell()
  shell.preventDefaults = false

  shell.on('gl-init', () => {
    let gl = shell.gl
    shell.scale = 1

    gl.disable(gl.DEPTH_TEST)

    app = new App(gl, feed, kill, diffuse, {
      brushSize
    })

    getAspect(shell.width, shell.height)
  })

  shell.on('tick', () => {
    app.update()

    if (manualTick) {
      console.log('tick')
      shell.paused = true
    }
  })
  shell.on('resize', getAspect)
  shell.on('gl-render', () => {
    app.render()
  })
}
