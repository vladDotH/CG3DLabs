<template>
  <div class="panel">
    <div class="item">
      <label style="font-size: 20px">Camera</label>

      <div v-for="(_, key) in state.camera" :key="key">
        <div v-for="(_, i) in state.camera[key]" :key="i">
          <label>
            <input
              v-model.number="state.camera[key][i]"
              type="number"
              step="0.1"
            />
            {{ key }}-{{ coordDict[i] }}:
          </label>
        </div>
      </div>

      <div>
        <label>
          Перспективная проекция
          <input v-model="state.projection.perspective" type="checkbox" />
        </label>
      </div>

      <template v-if="state.projection.perspective">
        <div>
          <label>
            <input
              v-model.number="state.projection.fov"
              type="range"
              min="0"
              max="180"
            />
            FOV: {{ state.projection.fov }}
          </label>
        </div>

        <div>
          <label>
            <input
              v-model.number="state.projection.near"
              type="range"
              min="0.01"
              max="5"
              step="0.01"
            />
            Near: {{ state.projection.near }}
          </label>
        </div>

        <div>
          <label>
            <input
              v-model.number="state.projection.far"
              type="range"
              min="0"
              max="5"
              step="0.01"
            />
            Far: {{ state.projection.far }}
          </label>
        </div>
      </template>

      <button @click="emit('reset')">Сбросить</button>
    </div>

    <div class="item">
      <label>
        Phong
        <input v-model="state.light.phong" type="checkbox" />
      </label>

      <br />

      <button :disabled="state.light.count >= MaxLights" @click="addLight">
        Add light
      </button>
      <button :disabled="state.light.count < 0" @click="removeLight">
        Remove light
      </button>
      <div v-for="(_, i) in state.light.lights" :key="i">
        <label>
          Ambient
          <ColorInput v-model="state.light.lights[i].ambient" />
        </label>

        <label>
          Diffuse
          <ColorInput v-model="state.light.lights[i].diffuse" />
        </label>

        <label>
          Specular
          <ColorInput v-model="state.light.lights[i].specular" />
        </label>

        <br />

        <label>
          Position
          <div v-for="(_, j) in 3" :key="j">
            <label>
              <input
                v-model.number="state.light.lights[i].position[j]"
                type="number"
                step="0.05"
              />
              pos-{{ coordDict[j] }}:
            </label>
          </div>
        </label>

        <hr />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from '../state.ts'
import { MaxLights } from '../gl.ts'
import { vec4 } from 'gl-matrix'
import ColorInput from './ColorInput.vue'
import { onMounted } from 'vue'

const state = useState()

const coordDict = 'xyz'.split('')

const emit = defineEmits<{ (e: 'reset'): void }>()

function addLight() {
  state.light.count++
  state.light.lights.push({
    diffuse: [180, 180, 180, 255] as vec4,
    ambient: [220, 220, 220, 255] as vec4,
    specular: [240, 240, 240, 255] as vec4,
    position: [-0.8, 0, -0.9, 1] as vec4,
  })
}

function removeLight() {
  state.light.count--
  state.light.lights.splice(state.light.lights.length - 1, 1)
}

onMounted(() => {
  addLight()
})
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;

  .item {
    border: 1px solid #ccc;
    margin: 5px;
  }
}
</style>
