// set up default precision to mediump
precision mediump float;

uniform sampler2D sampler;
uniform sampler2D uSpecular;

// input varying variables
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vSurface;
varying float vAttenuation;

// light source parameters
const vec3 source_ambient_color = vec3(1.0, 1.0, 1.0);
const vec3 source_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 source_specular_color = vec3(1.0, 1.0, 1.0);
const vec3 source_direction = vec3(0.7, 0.0, 0.8);

// material parameters
const vec3 mat_ambient_color = vec3(0.1, 0.1, 0.1);
const vec3 mat_diffuse_color = vec3(1.0, 1.0, 1.0);
const vec3 mat_specular_color = vec3(0.4, 0.4, 0.4);
const float mat_shininess = 15.0;
 
void main() {
	vec3 texture_color = vec3( texture2D( sampler, vUV ) );
	vec3 specular_color = vec3( texture2D( uSpecular, vUV ) );

	vec3 surface_to_light = normalize( vSurface );

	vec3 I_ambient = source_ambient_color * mat_ambient_color;
	vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0.0, dot(vNormal, surface_to_light));

	vec3 V = normalize( vView );
	vec3 R = reflect( surface_to_light, vNormal ); // compute reflection vector

	vec3 I_specular = source_specular_color * mat_specular_color;

	float specularExponent = 300.0 * texture2D(uSpecular, vUV).a + 50.0;
	I_specular *= pow( max( dot( R, V ), 0.0 ), specularExponent);

	vec3 I = I_ambient + vAttenuation * I_diffuse + vAttenuation * I_specular;

	gl_FragColor = vec4(I * texture_color, 1.0);
}