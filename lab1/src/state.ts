import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useState = defineStore('state', () => {
  const xrot = ref(0),
    yrot = ref(0),
    zrot = ref(0),
    x = ref(0),
    y = ref(0),
    z = ref(0)

  return { xrot, yrot, zrot, z, x, y }
})
