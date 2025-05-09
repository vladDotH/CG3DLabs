import { keys, times } from 'es-toolkit/compat'

export const MaxLights = 2

export const GLAttributes = {
  aPosition: 0,
  aVertexColor: 0,
  aNormal: 0,
  aTexCoord: 0,

  uProjectionMatrix: WebGLUniformLocation,
  uViewMatrix: WebGLUniformLocation,
  uLightsCount: WebGLUniformLocation,
  uPhong: WebGLUniformLocation,
  uNormalMatrix: WebGLUniformLocation,
  uUseTexture: WebGLUniformLocation,
  uTexture: WebGLUniformLocation,

  Lights: times(MaxLights, () => ({
    diffuse: WebGLUniformLocation,
    ambient: WebGLUniformLocation,
    specular: WebGLUniformLocation,
    position: WebGLUniformLocation,
  })),

  Material: {
    diffuse: WebGLUniformLocation,
    ambient: WebGLUniformLocation,
    specular: WebGLUniformLocation,
    shininess: WebGLUniformLocation,
  },
}

// Загрузка шейдеров в папке shaders
export async function loadShaders(gl: WebGLRenderingContext) {
  const shaderProgram = gl.createProgram()

  // Получаем файлы и проходимся
  const shaderFiles = import.meta.glob('./shaders/*')

  for (const fileName in shaderFiles) {
    // Загрузка файла
    const shaderFile = (await shaderFiles[fileName]()) as any
    // Извлечение кода шейдера
    const shaderSrc = shaderFile.default
    let shader: WebGLShader | null = null

    // Создание объекта шейдера
    if (fileName.includes('frag')) {
      shader = gl.createShader(gl.FRAGMENT_SHADER)
    } else if (fileName.includes('vert')) {
      shader = gl.createShader(gl.VERTEX_SHADER)
    }

    if (!shader) {
      console.error(`Unable to load shader: ${fileName}`)
    } else {
      // Компиляция шейдера
      gl.shaderSource(shader, shaderSrc)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Unable to compile shader: ${fileName}`)
      }

      gl.attachShader(shaderProgram, shader)
    }
  }

  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program.')
  }

  gl.useProgram(shaderProgram)

  gl.validateProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    console.error('Unable to initialize the shader program.')
  }

  const attachedShaders = gl.getProgramParameter(
      shaderProgram,
      gl.ATTACHED_SHADERS,
    ),
    activeAttributes = gl.getProgramParameter(
      shaderProgram,
      gl.ACTIVE_ATTRIBUTES,
    ),
    activeUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS)

  console.info(`
  Attached shaders: ${attachedShaders}
  ActiveAttributes: ${activeAttributes}
  ActiveUniforms: ${activeUniforms}
  `)

  keys(GLAttributes)
    .filter((key) => key.startsWith('a'))
    .forEach((key) => {
      ;(GLAttributes[key as keyof typeof GLAttributes] as any) =
        gl.getAttribLocation(shaderProgram, key)
      gl.enableVertexAttribArray(
        GLAttributes[key as keyof typeof GLAttributes] as any,
      )
    })

  keys(GLAttributes)
    .filter((key) => key.startsWith('u'))
    .forEach((key) => {
      ;(GLAttributes[key as keyof typeof GLAttributes] as any) =
        gl.getUniformLocation(shaderProgram, key)!
    })

  loadUniformStructs(shaderProgram, gl)
}

export function useWebGL(canvas: HTMLCanvasElement) {
  try {
    // Попытаться получить контекст WebGL2, если не получается - WebGL, если и это не получится, попробовать получить экспериментальный.
    return (
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext)
    )
  } catch (e) {
    return null
  }
}

export function loadUniformStructs(
  shader: WebGLShader,
  gl: WebGLRenderingContext,
) {
  for (const key in GLAttributes.Material) {
    ;(GLAttributes.Material as any)[key] = gl.getUniformLocation(
      shader,
      `uMaterial.${key}`,
    )
  }
  for (let i = 0; i < GLAttributes.Lights.length; i++) {
    for (const key in GLAttributes.Lights[i]) {
      ;(GLAttributes.Lights as any)[i][key] = gl.getUniformLocation(
        shader,
        `uLights[${i}].${key}`,
      )
    }
  }
}

export function setMaterial(gl: WebGLRenderingContext, obj: any) {
  gl.uniform4fv(GLAttributes.Material.ambient, obj.ambient)
  gl.uniform4fv(GLAttributes.Material.diffuse, obj.diffuse)
  gl.uniform4fv(GLAttributes.Material.specular, obj.specular)
  gl.uniform1f(GLAttributes.Material.shininess, obj.shininess)
}

export function setLight(gl: WebGLRenderingContext, index: number, obj: any) {
  gl.uniform4fv(GLAttributes.Lights[index].ambient, obj.ambient)
  gl.uniform4fv(GLAttributes.Lights[index].diffuse, obj.diffuse)
  gl.uniform4fv(GLAttributes.Lights[index].specular, obj.specular)
  gl.uniform4fv(GLAttributes.Lights[index].position, obj.position)
}

export async function loadTexture(
  gl: WebGLRenderingContext,
  url: string,
): Promise<WebGLTexture> {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const level = 0
  const internalFormat = gl.RGBA
  const width = 1
  const height = 1
  const border = 0
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  const pixel = new Uint8Array([0, 0, 255, 255]) // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel,
  )

  const image = new Image()
  image.src = url

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image,
      )

      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }

      resolve()
    }

    image.onerror = reject
  })

  return texture
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0
}
