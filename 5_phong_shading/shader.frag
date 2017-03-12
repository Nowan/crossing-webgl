// set up default precision to mediump
precision mediump float;

uniform sampler2D sampler;

// input varying variables
varying vec2 vUV;
varying vec3 vNormal;

// light source parameters
const vec3 source_ambient_color = vec3(1.0, 1.0, 1.0);
const vec3 source_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 source_specular_color = vec3(1.0, 1.0, 1.0);
const vec3 source_direction = vec3(0.0, 0.0, 1.0);

// material parameters
const vec3 mat_ambient_color = vec3(0.3, 0.3, 0.3);
const vec3 mat_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 mat_specular_color = vec3(1.0, 1.0, 1.0);
const float mat_shininess = 10.0;
 
void main() {
	//gl_FragColor = texture2D(sampler, vUV);
	vec3 color = vec3( texture2D( sampler, vUV ) );

	vec3 I_ambient = source_ambient_color * mat_ambient_color;

	vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0.0, dot(vNormal, source_direction));

	vec3 I = I_ambient + I_diffuse;

	gl_FragColor = vec4(I * color, 1.0);
}