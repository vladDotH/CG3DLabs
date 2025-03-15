uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

varying mediump vec4 vColor;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
    vColor = aVertexColor;
}