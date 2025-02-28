<template>
  <div class="panel">
    <div class="item">
      <label style="font-size: 20px">Cube</label>
      <hr />

      <div v-for="prop in ['x', 'y', 'z'] as const" :key="prop">
        <label>
          <input v-model="state.cube[prop]" type="range" min="-100" max="100" />
          {{ prop.toUpperCase() }}: {{ state.cube[prop] }}
        </label>
      </div>
      <br />
      <div v-for="prop in ['xrot', 'yrot', 'zrot'] as const" :key="prop">
        <label>
          <input v-model="state.cube[prop]" type="range" min="0" max="360" />
          {{ prop }}: {{ state.cube[prop] }}
        </label>
      </div>

      <div>
        <label>
          Показать направление
          <input v-model="state.cube.arrows" type="checkbox" />
        </label>
      </div>
    </div>

    <div class="item">
      <label style="font-size: 20px">Tetrahedron</label>
      <hr />

      <div v-for="prop in ['x', 'y', 'z'] as const" :key="prop">
        <label>
          <input
            v-model="state.tetrahedron[prop]"
            type="range"
            min="-100"
            max="100"
          />
          {{ prop.toUpperCase() }}: {{ state.tetrahedron[prop] }}
        </label>
      </div>
      <br />
      <div v-for="prop in ['xrot', 'yrot', 'zrot'] as const" :key="prop">
        <label>
          <input
            v-model="state.tetrahedron[prop]"
            type="range"
            min="0"
            max="360"
          />
          {{ prop }}: {{ state.tetrahedron[prop] }}
        </label>
      </div>

      <br />

      <div>
        <label>
          Показать направление
          <input v-model="state.tetrahedron.arrows" type="checkbox" />
        </label>
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
