
var gl;
var shaderProgram;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];

function initGL(canvas){

	gl = canvas.getContext("webgl") || 
		 canvas.getContext("experimental-webgl") || 
		 canvas.getContext("moz-webgl") || 
		 canvas.getContext("webkit-3d");

	if(gl){
        console.log("Canvas retrieving successful");

		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

        // init shader program
        var vShaderSource = readFile("shader.vert");
        var vShader = compileShader( vShaderSource, gl.VERTEX_SHADER );

        var fShaderSource = readFile("shader.frag");
        var fShader = compileShader( fShaderSource, gl.FRAGMENT_SHADER );

        shaderProgram = createShaderProgram([vShader,fShader]);
        gl.useProgram(shaderProgram);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
    
        // set viewport
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

        // set perspective
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
	else
		console.log("Your browser doesn't support OpenGL");
}


function draw(positionBuffer, colorBuffer, translationXYZ, rotation){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(mvMatrix);

    if(translationXYZ)
        mat4.translate(mvMatrix, translationXYZ);

    // initialize new matrix state, so the rotation transition
    // would not affect next object
    mvPushMatrix();

    if(rotation)
        mat4.rotate(mvMatrix, rotation*Math.PI/180, [0, 1, 0]);

    // bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                           positionBuffer.itemSize, 
                           gl.FLOAT, 
                           false, 0, 0);

    // bind color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                           colorBuffer.itemSize, 
                           gl.FLOAT, 
                           false, 0, 0);

    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, positionBuffer.numItems);

    // return to the previous matrix state
    mvPopMatrix();
}


function createBuffer(vertices, itemSize){
    if(!gl || !vertices || !itemSize) return;

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = vertices.length/itemSize;

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

    // get reference of vertex color attribute
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // get references of projection & model-view uniforms
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

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


function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
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
