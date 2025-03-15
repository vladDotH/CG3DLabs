<template>
  <div class="panel">
    <div class="item">
      <label style="font-size: 20px">Camera</label>

      <div v-for="(_, key) in state.camera" :key="key">
        <div v-for="(_, i) in state.camera[key]" :key="i">
          <label>
            <input
              v-model.number="state.camera[key][i]"
              type="range"
              min="-1.5"
              max="1.5"
              step="0.01"
            />
            {{ key }}-{{ coordDict[i] }}:
            {{ Math.round(state.camera[key][i] * 100) / 100 }}
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
              min="-1.5"
              max="1.5"
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
              max="2"
              step="0.01"
            />
            Far: {{ state.projection.far }}
          </label>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from '../state.ts'

const state = useState()

const coordDict = 'xyz'.split('')
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
