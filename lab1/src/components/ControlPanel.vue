<template>
  <div class="panel">
    <div class="item">
      <label style="font-size: 20px">Cube</label>
      <hr />
      <div>
        <input
          id="x-slider"
          v-model="state.x"
          type="range"
          name="x-slider"
          min="-100"
          max="100"
        />
        <label for="x-slider">X: {{ state.x }}</label>
      </div>
      <div>
        <input
          id="y-slider"
          v-model="state.y"
          type="range"
          name="y-slider"
          min="-100"
          max="100"
        />
        <label for="y-slider">Y: {{ state.y }}</label>
      </div>
      <div>
        <input
          id="z-slider"
          v-model="state.z"
          type="range"
          name="z-slider"
          min="-100"
          max="100"
        />
        <label for="z-slider">Z: {{ state.z }}</label>
      </div>
      <br />
      <div>
        <input
          id="xrot-slider"
          v-model="state.xrot"
          type="range"
          name="xrot-slider"
          min="0"
          max="360"
        />
        <label for="xrot-slider">x-rot: {{ state.xrot }}</label>
      </div>
      <div>
        <input
          id="yrot-slider"
          v-model="state.yrot"
          type="range"
          name="yrot-slider"
          min="0"
          max="360"
        />
        <label for="yrot-slider">y-rot: {{ state.yrot }}</label>
      </div>
      <div>
        <input
          id="zrot-slider"
          v-model="state.zrot"
          type="range"
          name="zrot-slider"
          min="0"
          max="360"
        />
        <label for="zrot-slider">z-rot: {{ state.zrot }}</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from '../state.ts'

const state = useState()
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
