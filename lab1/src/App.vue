<template>
  <div v-if="error" class="alert">{{ error }}</div>
  <div v-else class="app">
    <ControlPanel class="control-panel" />
    <canvas ref="canvas" width="640" height="480">
      Your browser doesn't appear to support the HTML5
      <code>&lt;canvas&gt;</code> element.
    </canvas>
  </div>
</template>

<script setup lang="ts">
import ControlPanel from './components/ControlPanel.vue'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { loadShaders, useWebGL } from './gl.ts'
import { useState } from './state.ts'
import { Cube, Tetrahedron } from './figures.ts'
import { matMult, rotMat4 } from './utils.ts'
import { glMatrix, mat4, vec3 } from 'gl-matrix'

const canvas = useTemplateRef('canvas')

const error = ref<null | string>(null)
let gl: WebGLRenderingContext

onMounted(init)

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

  state.xrot = 70
  state.yrot = 30

  requestAnimationFrame(render)
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
  size: 0.3,
})

const tetrahedron = new Tetrahedron({
  colors: [
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
  ],
  size: 0.3,
})

tetrahedron.transform(
  matMult(
    mat4.fromTranslation(mat4.create(), vec3.fromValues(0.5, 0.5, 0.5)),
    rotMat4(0.5, 0.1, 0.1),
  ),
)

watch(
  () => [state.xrot, state.yrot, state.zrot, state.x, state.y, state.z],
  () => {
    const rot = rotMat4(
      glMatrix.toRadian(state.xrot),
      glMatrix.toRadian(state.yrot),
      glMatrix.toRadian(state.zrot),
    )

    const tr = mat4.fromTranslation(
      mat4.create(),
      vec3.fromValues(state.x / 20, state.y / 20, state.z / 20),
    )

    cube.transform(matMult(rot, tr))
  },
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
