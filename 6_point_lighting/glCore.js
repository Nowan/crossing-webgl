
var gl;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];

var polygonTexture;

function initGL(canvas){

	gl = canvas.getContext("webgl") || 
		 canvas.getContext("experimental-webgl") || 
		 canvas.getContext("moz-webgl") || 
		 canvas.getContext("webkit-3d");

	if(gl){
        console.log("Canvas retrieving successful");

		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

        // load texture
        polygonTexture = getTexture("texture.png");

        // init shader program
        var vShaderSource = readFile("shader.vert");
        var vShader = compileShader( vShaderSource, gl.VERTEX_SHADER );
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
          console.log("ERROR IN VERTEX SHADER : " + gl.getShaderInfoLog(vShader));
          return false;
        }

        var fShaderSource = readFile("shader.frag");
        var fShader = compileShader( fShaderSource, gl.FRAGMENT_SHADER );
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
          console.log("ERROR IN VERTEX SHADER : " + gl.getShaderInfoLog(fShader));
          return false;
        }

        shaderProgram = createShaderProgram([vShader,fShader]);
        gl.useProgram(shaderProgram);
    
        // set viewport
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // set camera view point & perspective
        var fovy = glConfig.v_field_of_view ? glConfig.v_field_of_view : 45;
        mat4.perspective(fovy, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        var eye = glConfig.viewer_position ? glConfig.viewer_position : [0, 0, 3];
        var target = glConfig.target ? glConfig.target : [0, 0, 0];
        mat4.lookAt(eye, target, [0,1,0], mvMatrix);
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
	else
		console.log("Your browser doesn't support OpenGL");
}


function draw(vertexBuffer, facesBuffer, rotation){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // initialize new matrix state, so the rotation transition
    // would not affect next object
    mvPushMatrix();

    if(rotation)
        mat4.rotate(mvMatrix, rotation*Math.PI/180, [0, 1, 0]);

    // use texture sampler number 0 if texture is loaded
    if (polygonTexture.webglTexture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, polygonTexture.webglTexture);
    }

    // bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                           3, gl.FLOAT, false, 4 * ( 3 + 3 + 2 ), 0);

    gl.vertexAttribPointer(shaderProgram.normalVectorAttribute, 
                           3, gl.FLOAT, false, 4 * ( 3 + 3 + 2), 3 * 4) ;

    gl.vertexAttribPointer(shaderProgram.uvPositionAttribute, 
                           2, gl.FLOAT, false, 4 * ( 3 + 3 + 2 ), ( 3 + 3 ) * 4);

    // bind faces buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, facesBuffer);

    // bind matrix uniforms
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniform1f(shaderProgram.lightIntensityUniform, glConfig.light_intensity ? glConfig.light_intensity : 0.0);
    gl.uniform3fv(shaderProgram.lightPositionUniform, glConfig.light_position ? glConfig.light_position : [-2, 0, 0]);
    gl.uniform3fv(shaderProgram.lightAttenuationUniform, glConfig.light_attenuation ? glConfig.light_attenuation : [1, 0.2, 0.04]);

    gl.drawElements(gl.TRIANGLES, facesBuffer.size, gl.UNSIGNED_SHORT, 0);
    gl.flush();

    // return to the previous matrix state
    mvPopMatrix();
}


function createArrayBuffer(vertices, itemSize){
    if(!gl || !vertices) return;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    if(itemSize){
        buffer.itemSize = itemSize;
        buffer.numItems = Math.floor(vertices.length / itemSize);
    };

    return buffer;
}

function createElementArrayBuffer(elements){
    if(!gl || !vertices) return;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer); 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);
    buffer.size = elements.length;

    return buffer;
}


function createShaderProgram(shaders){
    var shaderProgram = gl.createProgram();

    shaders.forEach(function(shader){
        gl.attachShader(shaderProgram, shader);
    }); 

    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
        console.log("Could not initialise shaders");

    // get reference of vertex position attribute
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // get reference of uv position attribute
    shaderProgram.uvPositionAttribute = gl.getAttribLocation(shaderProgram, "aUvPosition");
    gl.enableVertexAttribArray(shaderProgram.uvPositionAttribute);

    // get reference of normal vector attribute
    shaderProgram.normalVectorAttribute = gl.getAttribLocation(shaderProgram, "aNormalVector");
    gl.enableVertexAttribArray(shaderProgram.normalVectorAttribute);

    // get reference to sampler
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "sampler");
    gl.uniform1i(shaderProgram.samplerUniform, 0); // set sampler to texture channel 0

    // get references of projection & model-view uniforms
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    // get references of light-related uniforms
    shaderProgram.lightIntensityUniform = gl.getUniformLocation(shaderProgram, "uLightIntensity");
    shaderProgram.lightPositionUniform = gl.getUniformLocation(shaderProgram, "uLightPosition");
    shaderProgram.lightAttenuationUniform = gl.getUniformLocation(shaderProgram, "uLightAttenuation");

    return shaderProgram;
}


function compileShader(shaderSource, shaderType) {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!success) 
    console.log("could not compile shader: " + gl.getShaderInfoLog(shader));
  
  return shader;
}


function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}


function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


function getTexture(image_url){
    var image = new Image();

    image.src = image_url;
    image.webglTexture = false;

    image.onload=function(e) {
      var texture = gl.createTexture();

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.bindTexture(gl.TEXTURE_2D, null);

      image.webglTexture = texture;
    };

    return image;
}


// synchronously read and return file contents
function readFile(file)
{
    var rawFile = new XMLHttpRequest();

    var fileContents;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
                fileContents = rawFile.responseText;
        }
    }
    rawFile.send(null);
    return fileContents;
}


var lastTime = 0;
function getDeltaTime() {
    var timeNow = new Date().getTime();
    var deltaTime = lastTime == 0 ? 0 : timeNow - lastTime;
    lastTime = timeNow;
    return deltaTime/1000.0;
}
