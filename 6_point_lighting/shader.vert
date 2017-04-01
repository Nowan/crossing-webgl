
// input attributes 
attribute vec3 aVertexPosition;
attribute vec2 aUvPosition;
attribute vec3 aNormalVector;

// input uniforms
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uLightPosition;
uniform vec3 uLightAttenuation;

// output varying variables
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vView; // vector between camera position and current point
varying vec3 vSurface; // vector between surface and light point
varying float vAttenuation; // vector of the surface to the light

void main(void) {
	// apply projection 
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

	vUV = aUvPosition;
    vNormal = vec3(uMVMatrix * vec4 ( aNormalVector, 0 ) );
    vView = vec3(uMVMatrix * vec4( aVertexPosition, 1.0 ) );

    vec3 vertexViewspacePosition = (uMVMatrix * vec4(aVertexPosition, 1.0)).xyz;
    vSurface = uLightPosition - vertexViewspacePosition;

    vec3 lightVector = uLightPosition - vertexViewspacePosition;
    float distanceToLight = length(lightVector);
    vAttenuation = 1.0 / (uLightAttenuation[0] + distanceToLight * (uLightAttenuation[1] + distanceToLight * uLightAttenuation[2]));
}