
// input attributes 
attribute vec3 aVertexPosition;
attribute vec2 aUvPosition;

// input uniforms
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

// output varying variables
varying vec2 vUV;

void main(void) {
	// apply projection 
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    vUV = aUvPosition;
}