attribute vec3 aPosition;
attribute vec4 aVertexColor;

varying mediump vec4 vColor;

void main(void) {
    gl_Position = vec4(aPosition, 1.0);
    vColor = aVertexColor;
}