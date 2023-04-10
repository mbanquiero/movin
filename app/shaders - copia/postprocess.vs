#version 300 es
in vec3 aVertexPosition;
out vec2 vTextureCoord;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vTextureCoord = vec2(aVertexPosition.x/2.0 + 0.5 , 0.5+aVertexPosition.y/2.0);
}
