import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { vec3 } from 'gl-matrix'

export const useState = defineStore('state', () => {
  const params = () => ({
    xrot: 0,
    yrot: 0,
    zrot: 0,
    x: 0,
    y: 0,
    z: 0,
    arrows: false,
    size: 0,
  })

  const cube = reactive(params()),
    tetrahedron = reactive(params())

  const projection = reactive({
    perspective: false,
    fov: 90,
    aspect: 1,
    near: 0,
    far: 100,
  })

  const camera = reactive({
    position: [0, 0, 0] as vec3,
    target: [0, 0, 0] as vec3,
    up: [0, 0, 0] as vec3,
  })

  return { cube, tetrahedron, projection, camera }
})
