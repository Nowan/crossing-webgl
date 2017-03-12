// set up default precision to mediump
precision mediump float;

uniform sampler2D sampler;

// input varying variables
varying vec2 vUV;
 
void main() {
	gl_FragColor = texture2D(sampler, vUV);
}