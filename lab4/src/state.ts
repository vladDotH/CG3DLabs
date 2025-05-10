import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { type vec3, vec4 } from 'gl-matrix'

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
    tetrahedron = reactive(params()),
    carpet = reactive(params())

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

  const material = reactive({
    diffuse: [200, 200, 200, 255] as vec4,
    ambient: [255, 255, 255, 255] as vec4,
    specular: [200, 200, 200, 255] as vec4,
    shininess: 0.3,
    textures: true,
  })

  const light = reactive({
    phong: true,
    count: 0,
    lights: [] as {
      diffuse: vec4
      ambient: vec4
      specular: vec4
      position: vec4
    }[],
  })

  return { cube, tetrahedron, carpet, projection, camera, material, light }
})
