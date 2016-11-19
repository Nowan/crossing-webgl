// input attributes 
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

// input uniforms
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

// output varying variables
varying vec4 vColor;

void main(void) {
	// apply projection 
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    // set color varying variable
    vColor = aVertexColor;
}