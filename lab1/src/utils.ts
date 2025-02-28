import { mat2, mat3, mat4, type vec2, type vec3, type vec4 } from 'gl-matrix'

export type MatrixModule = typeof mat2 | typeof mat3 | typeof mat4

export type Matrix = mat2 | mat3 | mat4
export type Vector = vec2 | vec3 | vec4

export function matMult(...args: mat2[]): mat2
export function matMult(...args: mat3[]): mat3
export function matMult(...args: mat4[]): mat4

export function matMult(...args: Matrix[]): Matrix {
  let matN: MatrixModule = mat2
  if (args[0].length === 9) {
    matN = mat3
  } else if (args[0].length === 16) {
    matN = mat4
  } else {
    throw new Error('Incorrect matrix')
  }

  const mat = matN.create()
  for (const m of args) {
    matN.multiply(mat as any, mat as any, m as any)
  }
  return mat
}

export function rotMat4(x: number = 0, y: number = 0, z: number = 0) {
  const rotMat = mat4.create()
  mat4.rotateX(rotMat, rotMat, x)
  mat4.rotateY(rotMat, rotMat, y)
  mat4.rotateZ(rotMat, rotMat, z)
  return rotMat
}
