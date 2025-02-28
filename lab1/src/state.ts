import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useState = defineStore('state', () => {
  const params = () => ({
    xrot: 0,
    yrot: 0,
    zrot: 0,
    x: 0,
    y: 0,
    z: 0,
    arrows: false,
  })

  const cube = reactive(params()),
    tetrahedron = reactive(params())

  return { cube, tetrahedron }
})
