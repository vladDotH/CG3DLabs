import type { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix'

interface Array<T> {
  flat(): (T extends vec2 ? number : T)[]
  flat(): (T extends vec3 ? number : T)[]
  flat(): (T extends vec4 ? number : T)[]

  flat(): (T extends mat2 ? number : T)[]
  flat(): (T extends mat3 ? number : T)[]
  flat(): (T extends mat4 ? number : T)[]
}
