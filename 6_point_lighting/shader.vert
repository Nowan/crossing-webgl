
// input attributes 
attribute vec3 aVertexPosition;
attribute vec2 aUvPosition;
attribute vec3 aNormalVector;

// input uniforms
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uLightPosition;

// output varying variables
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vView; // vector between camera position and current point
varying vec3 vSurface; // vector of the surface to the light

void main(void) {
	// apply projection 
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

	vUV = aUvPosition;
    vNormal = vec3(uMVMatrix * vec4 ( aNormalVector, 0 ) );
    vView = vec3(uMVMatrix * vec4( aVertexPosition, 1.0 ) );
    vSurface = uLightPosition - (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
}