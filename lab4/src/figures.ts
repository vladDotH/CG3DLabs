import { mat3, mat4, vec3, vec4 } from 'gl-matrix'
import { times } from 'es-toolkit/compat'
import { chunk, flattenDeep } from 'es-toolkit'
import { GLAttributes, loadTexture } from './gl.ts'
import { matMult } from './utils.ts'

export class Figure {
  initialPoints: number[] = []
  indices: number[] = []
  texCoords: number[] = []

  position = vec3.fromValues(0, 0, 0)
  transformMat = mat4.create()
  size = 0.5

  colors: number[] = []
  tex?: WebGLTexture

  constructor(props: { position?: vec3; size?: number }) {
    this.position = props.position ?? this.position
    this.size = props.size ?? this.size
  }

  async loadTexture(gl: WebGLRenderingContext, url: string) {
    this.tex = await loadTexture(gl, url)
  }

  get points() {
    const pos = vec3.clone(this.position)
    vec3.transformMat4(pos, pos, this.transformMat)
    const mat = matMult(this.baseTransform, this.transformMat)
    return chunk(this.initialPoints, 3).flatMap((p) => {
      const v = p as vec3
      vec3.transformMat4(v, v, mat)
      return v as number[]
    })
  }

  get normals(): number[] {
    return []
  }

  get baseTransform() {
    const mat = mat4.create()
    mat4.translate(mat, mat, this.position)
    mat4.scale(mat, mat, times(3, () => this.size) as vec3)
    return mat
  }

  transform(mat: mat4) {
    this.transformMat = mat
  }

  render(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    const vertBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.points),
      gl.STATIC_DRAW,
    )

    const normBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normals),
      gl.STATIC_DRAW,
    )

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.colors),
      gl.STATIC_DRAW,
    )

    const indicesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      gl.STATIC_DRAW,
    )

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer)
    gl.vertexAttribPointer(GLAttributes.aPosition, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(GLAttributes.aVertexColor, 4, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer)
    gl.vertexAttribPointer(GLAttributes.aNormal, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)

    const normMat = mat3.normalFromMat4(
      mat3.create(),
      matMult(this.baseTransform, this.transformMat),
    )
    gl.uniformMatrix3fv(GLAttributes.uNormalMatrix, false, normMat)

    if (this.tex) {
      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.texCoords),
        gl.STATIC_DRAW,
      )

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.vertexAttribPointer(GLAttributes.aTexCoord, 2, gl.FLOAT, false, 0, 0)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.tex)
      gl.uniform1i(GLAttributes.uTexture, 0)
    }

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0)

    if (this.showArrows) {
      this.renderOrientationArrows(gl)
    }
  }

  showArrows = false
  arrowPoints: number[] = []
  arrowColors: number[] = []

  renderOrientationArrows(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    const arrowsPoints = chunk(this.arrowPoints, 3).flatMap((p) => {
      const v = p as vec3
      vec3.transformMat4(v, v, matMult(this.baseTransform, this.transformMat))
      return v as number[]
    })

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(arrowsPoints),
      gl.STATIC_DRAW,
    )

    const colorsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.arrowColors),
      gl.STATIC_DRAW,
    )

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(GLAttributes.aPosition, 3, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer)
    gl.vertexAttribPointer(GLAttributes.aVertexColor, 4, gl.FLOAT, false, 0, 0)

    gl.lineWidth(4)
    gl.drawArrays(gl.LINES, 0, arrowsPoints.length / 3)
  }
}

export class Cube extends Figure {
  initialPoints = [
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ]

  texCoords = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  ]

  get normals() {
    return flattenDeep(
      times(6, (i) => {
        const [p1, p2, p3] = chunk(
          this.initialPoints.slice(i * 12, i * 12 + 9),
          3,
        ) as vec3[]

        const v1 = vec3.sub(vec3.create(), p1, p2),
          v2 = vec3.sub(vec3.create(), p2, p3)
        const norm = vec3.cross(vec3.create(), v1, v2)
        vec3.normalize(norm, norm)
        return times(4, () => Array.from(norm))
      }),
    )
  }

  indices = [
    // Front
    0, 1, 2, 0, 2, 3,
    // Back
    4, 5, 6, 4, 6, 7,
    // Top
    8, 9, 10, 8, 10, 11,
    // Bottom
    12, 13, 14, 12, 14, 15,
    // Right
    16, 17, 18, 16, 18, 19,
    // Left
    20, 21, 22, 20, 22, 23,
  ]

  colors = [] as number[]

  position = vec3.fromValues(0, 0, 0)
  transformMat = mat4.create()

  constructor(props: { position?: vec3; size?: number; colors?: vec4[] }) {
    super(props)
    this.colors = (
      props.colors ?? times(6, () => [1.0, 1.0, 1.0, 1.0])
    ).flatMap((c) => [c, c, c, c].flat() as number[])
  }

  arrowPoints = [
    0, 0, 0, 0, 2, 0,

    0.2, 1.8, 0, 0, 2, 0, -0.2, 1.8, -0, 0, 2, 0,

    0, 0, 0, 2, 0, 0,

    1.8, 0.2, 0, 2, 0, 0, 1.8, -0.2, 0, 2, 0, 0,

    0, 0, 0, 0, 0, 2,

    0.2, 0, 1.8, 0, 0, 2, -0.2, 0, 1.8, 0, 0, 2,
  ]

  arrowColors = times(this.arrowPoints.length / 3, () => [
    0.7, 0.7, 0.7, 1,
  ]).flat()
}

export class Tetrahedron extends Figure {
  initialPoints = [
    // Вершина 1
    1, 1, 1,
    // Вершина 2
    -1, -1, 1,
    // Вершина 3
    -1, 1, -1,
    // Вершина 4
    1, -1, -1,
  ]

  texCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]

  get normals() {
    return [
      // Вершина 1
      1, 1, 1,
      // Вершина 2
      -1, -1, 1,
      // Вершина 3
      -1, 1, -1,
      // Вершина 4
      1, -1, -1,
    ]
  }

  indices = [
    // Грань 1
    0, 1, 2,
    // Грань 2
    0, 1, 3,
    // Грань 3
    0, 2, 3,
    // Грань 4
    1, 2, 3,
  ]

  colors = [] as number[]

  position = vec3.fromValues(0, 0, 0)
  transformMat = mat4.create()

  constructor(props: { position?: vec3; size?: number; colors?: vec4[] }) {
    super(props)
    this.colors = (
      props.colors ?? times(4, () => [1.0, 1.0, 1.0, 1.0])
    ).flatMap((c) => [c].flat() as number[])
  }

  arrowPoints = [
    0, 0, 0, 1.5, 1.5, 1.5,

    0, 0, 0, 1.5, -1.5, -1.5,

    0, 0, 0, -1.5, -1.5, 1.5,

    0, 0, 0, -1.5, 1.5, -1.5,
  ]

  arrowColors = times(this.arrowPoints.length / 3, () => [
    0.7, 0.7, 0.7, 1,
  ]).flat()
}

export class Plane extends Figure {
  initialPoints = [
    // Вершина 1
    1, 1, 0,
    // Вершина 2
    -1, -1, 0,
    // Вершина 3
    -1, 1, 0,
    // Вершина 4
    1, -1, 0,
  ]

  texCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]

  get normals() {
    return [
      // Вершина 1
      1, 1, 1,
      // Вершина 2
      -1, -1, 1,
      // Вершина 3
      -1, 1, -1,
      // Вершина 4
      1, -1, -1,
    ]
  }

  indices = [0, 1, 2, 0, 1, 3]

  colors = [] as number[]

  position = vec3.fromValues(0, 0, 0)
  transformMat = mat4.create()

  constructor(props: { position?: vec3; size?: number; colors?: vec4[] }) {
    super(props)
    this.colors = (
      props.colors ?? times(4, () => [1.0, 1.0, 1.0, 1.0])
    ).flatMap((c) => [c].flat() as number[])
  }

  arrowPoints = [
    0, 0, 0, 1.5, 1.5, 1.5,

    0, 0, 0, 1.5, -1.5, -1.5,

    0, 0, 0, -1.5, -1.5, 1.5,

    0, 0, 0, -1.5, 1.5, -1.5,
  ]

  arrowColors = times(this.arrowPoints.length / 3, () => [
    0.7, 0.7, 0.7, 1,
  ]).flat()
}
