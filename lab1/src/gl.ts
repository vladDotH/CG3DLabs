export const GLAttributes = {
  vPosition: 0,
  vVertexColor: 0,
}

// Загрузка шейдеров в папке shaders
export async function loadShaders(gl: WebGLRenderingContext) {
  const shaderProgram = gl.createProgram()

  // Получаем файлы и проходимся
  const shaderFiles = import.meta.glob('./shaders/*')

  for (const fileName in shaderFiles) {
    // Загрузка файла
    const shaderFile = await import(/* @vite-ignore */ `${fileName}?raw`)
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
  activeAttributes: ${activeAttributes}
  activeUniforms: ${activeUniforms}
  `)

  for (const attr in GLAttributes) {
    GLAttributes[attr as keyof typeof GLAttributes] = gl.getAttribLocation(
      shaderProgram,
      attr,
    )
    gl.enableVertexAttribArray(GLAttributes[attr as keyof typeof GLAttributes])
  }
}

export function useWebGL(canvas: HTMLCanvasElement) {
  try {
    // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
    return (
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext)
    )
  } catch (e) {
    return null
  }
}
