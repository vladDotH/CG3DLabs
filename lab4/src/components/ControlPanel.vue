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
          <input v-model="state.cube.size" type="range" min="0" max="100" />
          Размер: {{ state.cube.size }}
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
          <input
            v-model="state.tetrahedron.size"
            type="range"
            min="0"
            max="100"
          />
          Размер: {{ state.tetrahedron.size }}
        </label>
      </div>

      <div>
        <label>
          Показать направление
          <input v-model="state.tetrahedron.arrows" type="checkbox" />
        </label>
      </div>
    </div>

    <div class="item">
      <label style="font-size: 20px">Material</label>
      <hr />

      <label>
        Ambient
        <ColorInput v-model="state.material.ambient" />
      </label>

      <label>
        Diffuse
        <ColorInput v-model="state.material.diffuse" />
      </label>

      <label>
        Specular
        <ColorInput v-model="state.material.specular" />
      </label>

      <label>
        Shiness
        <input
          v-model.number="state.material.shininess"
          type="number"
          min="0.1"
          max="10"
          step="0.01"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from '../state.ts'
import ColorInput from './ColorInput.vue'

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
