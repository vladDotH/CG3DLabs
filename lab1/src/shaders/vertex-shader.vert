attribute vec3 vPosition;
attribute vec4 vVertexColor;

varying mediump vec4 vColor;

void main(void) {
    gl_Position = vec4(vPosition, 1.0);
    vColor = vVertexColor;
}