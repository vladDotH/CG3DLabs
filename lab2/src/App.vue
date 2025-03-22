<template>
  <div v-if="error" class="alert">{{ error }}</div>
  <div v-else class="app">
    <ControlPanel class="control-panel" />
    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @wheel="onScroll"
    >
      Your browser doesn't appear to support the HTML5
      <code>&lt;canvas&gt;</code> element.
    </canvas>
    <CameraPanel class="control-panel" @reset="onReset" />
  </div>
</template>

<script setup lang="ts">
import ControlPanel from './components/ControlPanel.vue'
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { GLAttributes, loadShaders, useWebGL } from './gl.ts'
import { useState } from './state.ts'
import { Cube, Tetrahedron } from './figures.ts'
import { matMult, rotMat4 } from './utils.ts'
import { glMatrix, mat4, vec2, vec3 } from 'gl-matrix'
import CameraPanel from './components/CameraPanel.vue'
import { cloneDeep } from 'es-toolkit'

const canvas = useTemplateRef('canvas')

const error = ref<null | string>(null)
let gl: WebGLRenderingContext

const pressed = ref(false),
  startPos = ref(vec2.fromValues(0, 0)),
  startCameraTarget = ref(vec3.create()),
  cursor = ref('default')

function onMouseDown(ev: MouseEvent) {
  pressed.value = true
  startPos.value = vec2.fromValues(ev.x, ev.y)
  startCameraTarget.value = cloneDeep(state.camera.target)
  cursor.value = 'move'
}

function onMouseUp() {
  pressed.value = false
  startPos.value = vec2.fromValues(0, 0)
  cursor.value = 'default'
}

const W = 640,
  H = 480,
  cameraViewStep = 0.005

function onMouseMove(ev: MouseEvent) {
  if (pressed.value) {
    const pos = vec2.fromValues(ev.x, ev.y)
    const diff = vec2.subtract(vec2.create(), pos, startPos.value)
    vec2.scale(diff, diff, cameraViewStep)
    const diff3 = vec3.fromValues(diff[0], diff[1], 0)
    state.camera.target = Array.from(
      vec3.add(vec3.create(), startCameraTarget.value, diff3),
    ) as vec3
  }
}

const cameraMoveStep = 0.025
function onKeydown(ev: KeyboardEvent) {
  const dir = vec3.subtract(
      vec3.create(),
      state.camera.target,
      state.camera.position,
    ),
    up = vec3.subtract(vec3.create(), state.camera.up, state.camera.position)
  if (ev.key == 'w') {
    /**/
  } else if (ev.key == 's') {
    vec3.scale(dir, dir, -1)
  } else if (ev.key == 'a') {
    vec3.cross(dir, dir, up)
  } else if (ev.key == 'd') {
    vec3.cross(dir, dir, up)
    vec3.scale(dir, dir, -1)
  } else {
    return
  }

  vec3.normalize(dir, dir)
  vec3.scale(dir, dir, cameraMoveStep)
  state.camera.position = Array.from(
    vec3.add(vec3.create(), state.camera.position, dir),
  ) as vec3
}
function onScroll(ev: WheelEvent) {
  const sign = -Math.sign(ev.deltaY)
  const dir = vec3.subtract(
    vec3.create(),
    state.camera.target,
    state.camera.position,
  )
  vec3.normalize(dir, dir)
  vec3.scale(dir, dir, cameraMoveStep * sign)
  state.camera.position = Array.from(
    vec3.add(vec3.create(), state.camera.position, dir),
  ) as vec3
}

onMounted(async () => {
  await init()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

async function init() {
  if (!canvas.value) {
    error.value = 'Не удалось загрузить Canvas 😥'
    return
  }

  gl = useWebGL(canvas.value)!
  if (!canvas.value) {
    error.value = 'Не удалось загрузить WebGL 😥'
  }

  gl.viewport(0, 0, canvas.value.width, canvas.value.height)
  await loadShaders(gl)

  state.cube.xrot = 70
  state.cube.yrot = 30
  state.cube.x = 40
  state.cube.size = 30

  state.tetrahedron.xrot = 220
  state.tetrahedron.yrot = 70
  state.tetrahedron.x = -40
  state.tetrahedron.size = 30

  onReset()

  requestAnimationFrame(render)
}

function onReset() {
  state.projection.aspect = 640 / 480
  state.projection.fov = 90
  state.projection.near = 0.01
  state.projection.far = 100

  state.projection.perspective = true
  state.camera.position = [0, 0, -1]
  state.camera.target = [0, 0, 0]
  state.camera.up = [0, 1, 0]
}

const state = useState()

const cube = new Cube({
  colors: [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
    [1.0, 0.0, 1.0, 1.0], // Left face: purple
  ],
})

const tetrahedron = new Tetrahedron({
  colors: [
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 1.0, 1.0], // Bottom face: white
  ],
})

const PosScale = 1 / 100,
  SizeScale = 1 / 100

watch(
  () => state.cube,
  () => {
    const rot = rotMat4(
      glMatrix.toRadian(state.cube.xrot),
      glMatrix.toRadian(state.cube.yrot),
      glMatrix.toRadian(state.cube.zrot),
    )

    cube.position = vec3.fromValues(state.cube.x, state.cube.y, state.cube.z)
    vec3.scale(cube.position, cube.position, PosScale)

    cube.showArrows = state.cube.arrows
    cube.size = state.cube.size * SizeScale
    cube.transform(rot)
  },
  { deep: true },
)

watch(
  () => state.tetrahedron,
  () => {
    const rot = rotMat4(
      glMatrix.toRadian(state.tetrahedron.xrot),
      glMatrix.toRadian(state.tetrahedron.yrot),
      glMatrix.toRadian(state.tetrahedron.zrot),
    )

    tetrahedron.position = vec3.fromValues(
      state.tetrahedron.x,
      state.tetrahedron.y,
      state.tetrahedron.z,
    )

    vec3.scale(tetrahedron.position, tetrahedron.position, PosScale)

    tetrahedron.showArrows = state.tetrahedron.arrows
    tetrahedron.size = state.tetrahedron.size * SizeScale
    tetrahedron.transform(matMult(rot))
  },
  { deep: true },
)

watch(
  () => state.projection,
  () => {
    let mat = mat4.create()
    if (state.projection.perspective) {
      mat = mat4.perspective(
        mat,
        glMatrix.toRadian(state.projection.fov),
        state.projection.aspect,
        state.projection.near,
        state.projection.far,
      )
    }
    gl.uniformMatrix4fv(GLAttributes.uProjectionMatrix, false, mat)
  },
  { deep: true },
)

watch(
  () => state.camera,
  () => {
    const viewMatrix = mat4.create()
    mat4.lookAt(
      viewMatrix,
      state.camera.position.map((v) => v) as vec3,
      state.camera.target.map((v) => v) as vec3,
      state.camera.up.map((v) => v) as vec3,
    )

    gl.uniformMatrix4fv(GLAttributes.uViewMatrix, false, viewMatrix)
  },
  { deep: true },
)

function render() {
  gl.clearColor(0, 0, 0, 1) // Очистка экрана чёрным цветом
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST) // Включение теста глубины

  cube.render(gl)
  tetrahedron.render(gl)

  requestAnimationFrame(render)
}
</script>

<style scoped>
.app {
  display: flex;
  cursor: v-bind(cursor);
}

.alert {
  color: red;
  font-size: 48px;
  background: lightgrey;
}

.control-panel {
  width: 300px;
}
</style>
