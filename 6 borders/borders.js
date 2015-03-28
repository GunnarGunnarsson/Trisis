/*
*   Þegar ýtt er á takka; kubbur festist í stað og nýr kassa birtist
*
*   To do:
*
*   gera útlínur á kassann
*   útbúa coalition check
*/

var wut = 0;

var canvas;
var gl;

var NumVertices  = 36;
var lineCubeVertices = 58;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -4.0;

var matrixLoc;

var grayColor = [];
for(var i = 0; i<36; i++ ){
    grayColor.push([ 0.0, 0.0, 0.0, 0.9 ]);
}

// Stýringar fyrir kubb í þrívíðu rúmi
// var staða á x-ás
var xplacement = 0.025;
// var staða á y-ás
var yplacement = 0.475;
// var staða á z-ás
var zplacement = 0.025;
// var rotation á x
var xrot = 0.0;
// var rotation á y
var yrot = 0.0;
// var rotation á z
var zrot = 0.0;

// Línur fyrir botngrid
c1 = Math.random();
c2 = Math.random();
c3 = Math.random();

trioForm = Math.random();
trioFormstate = [];

var time = 0.0;

var staticxpos = [];
var staticypos = [];
var staticzpos = [];
var staticxrot = [];
var staticyrot = [];
var staticzrot = [];
var staticcolor1 = [];
var staticcolor2 = [];
var staticcolor3 = [];

var cBuffer;
var program;
var vColor;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();
    lineCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 0.8, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Stýringar
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 65:    // A
                // breytum stöðu kubbs á x-ás (mínus)
                if(xplacement > -0.125){
                    xplacement -= 0.05;
                }
                break;
            case 68:    // D
                // breytum stöðu kubbs á x-ás (plús)
                if(xplacement < 0.125){
                    xplacement += 0.05;
                }
                break;
            case 87:    // W
                // breytum stöðu kubbs á z-ás (plús)
                if(zplacement < 0.125){
                    zplacement += 0.05;
                }
                break;
            case 83:    // S
                // breytum stöðu kubbs á z-ás (mínus)
                if(zplacement > -0.125){
                    zplacement -= 0.05;
                }
                break;
            case 38:    // upp ör
                // breytum stöðu kubbs á y-ás (plús)
                if(yplacement < 0.475){
                    yplacement += 0.05;
                }
                break;
            case 32:    // space
                // breytum stöðu kubbs á y-ás (mínus)
                if(yplacement > -0.425){
                    yplacement -= 0.05;
                }
                break;
            case 90:    // Z
                // snúum um x ás
                xrot += 90.0;
                break;
            case 88:    // X
                // snúum um y ás
                yrot += 90.0;
                break;
            case 67:    // C
                // snúum um z ás
                zrot += 90.0;
                break;
            case 75:    // K
                // Vista staðsetningar og snúning hlutar
                staticxpos.push(xplacement);
                staticypos.push(yplacement);
                staticzpos.push(zplacement);
                staticxrot.push(xrot);
                staticyrot.push(yrot);
                staticzrot.push(zrot);
                trioFormstate.push(trioForm);
                staticcolor1.push(c1);
                staticcolor2.push(c2);
                staticcolor3.push(c3);
                // Endurstilla í upphafsstöðu
                xplacement = 0.025;
                yplacement = 0.475;
                zplacement = 0.025;
                xrot = 0.0;
                yrot = 0.0;
                zrot = 0.0;
                trioForm = Math.random();
                c1 = Math.random();
                c2 = Math.random();
                c3 = Math.random();
                colors = [];
                for ( var i = 0; i < 36; ++i ) {
                    colors.push([ c1, c2, c3, 1.0 ]);
                }
                break;
         }

     }  );

     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 0.1;
         } else {
             zDist -= 0.1;
         }
     }  );
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ c1, c2, c3, 1.0 ]
    ];

    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[0]);
        
    }
}

// Búum til irregular cube
function lineCube()
{
    cornerlines( 0, 1);
    cornerlines( 0, 2);
    cornerlines( 0, 3);
    cornerlines( 0, 4);
    cornerlines( 0, 5);
    cornerlines( 0, 6);
    cornerlines( 0, 7);
    cornerlines( 1, 2);
    cornerlines( 1, 3);
    cornerlines( 1, 4);
    cornerlines( 1, 5);
    cornerlines( 1, 6);
    cornerlines( 1, 7);
    cornerlines( 2, 3);
    cornerlines( 2, 4);
    cornerlines( 2, 5);
    cornerlines( 2, 6);
    cornerlines( 2, 7);
    cornerlines( 3, 7);
    cornerlines( 3, 4);
    cornerlines( 3, 5);
    cornerlines( 3, 6);
    cornerlines( 3, 7);
    cornerlines( 4, 5);
    cornerlines( 4, 6);
    cornerlines( 4, 7);
    cornerlines( 5, 6);
    cornerlines( 5, 7);
    cornerlines( 6, 7);
}

function cornerlines(a, b) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];
    
    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ]
    ];

    var indices = [ a, b ];

    

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[0]] );
    }
}

//----------------------------------------------------------------------------
// Define the transformation scale here (two scale functions in MV.js)
function scale4( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    time += 0.01;

    var ctm = mat4();
    ctm = mult( ctm, rotate( parseFloat(spinX), [1, 0, 0] ) );
    ctm = mult( ctm, rotate( parseFloat(spinY), [0, 1, 0] ) ) ;
    ctm = mult( ctm, rotate( -30, 1.0, 0.0, 0.0) );
    ctm = mult( ctm, rotate( 30, 0.0, 1.0, 0.0) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // Kubburinn skilgreindur
    triCube = mult( ctm, translate( xplacement, yplacement, zplacement ) ); // Kassanum hliðrað
    //triCube = mult( triCube, scale4( 0.05, 0.05, 0.05 ) ); // Kassinn skalaður í rétt hlutföll
    triCube = mult( triCube, scale4( 0.05, 0.05, 0.05 ) ); // Kassinn skalaður í rétt hlutföll
    triCube = mult( triCube, rotate( xrot, 1.0, 0.0, 0.0 ) );
    triCube = mult( triCube, rotate( yrot, 0.0, 1.0, 0.0 ) );
    triCube = mult( triCube, rotate( zrot, 0.0, 0.0, 1.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(triCube));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    sideCube = mult( triCube, translate( -1.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(sideCube));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    if(trioForm < 0.5)
    {
        offCube = mult( triCube, translate( 1.0, 0.0, 0.0) );
    } else {
        offCube = mult( triCube, translate( 0.0, 0.0, 1.0) );
    }
    gl.uniformMatrix4fv(matrixLoc, false, flatten(offCube));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    if(staticxpos.length != 0){
        for(n = 0; n <= staticxpos.length; n++){
            console.log(staticxpos.length);

            var subcolors = [];
            for(var i = 0; i<36; i++ ){
                subcolors.push([ staticcolor1[n], staticcolor2[n], staticcolor3[n], 1.0 ]);
            }

            gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, flatten(subcolors), gl.STATIC_DRAW );

            gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( vColor );
            // Kubburinn skilgreindur
            triCube = mult( ctm, translate( staticxpos[n], staticypos[n], staticzpos[n] ) ); // Kassanum hliðrað
            triCube = mult( triCube, scale4( 0.05, 0.05, 0.05 ) ); // Kassinn skalaður í rétt hlutföll
            triCube = mult( triCube, rotate( staticxrot[n], 1.0, 0.0, 0.0 ) );
            triCube = mult( triCube, rotate( staticyrot[n], 0.0, 1.0, 0.0 ) );
            triCube = mult( triCube, rotate( staticzrot[n], 0.0, 0.0, 1.0 ) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(triCube));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

            sideCube = mult( triCube, translate( -1.0, 0.0, 0.0 ) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(sideCube));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

            if(trioFormstate[n] < 0.5)
            {
                offCube = mult( triCube, translate( 1.0, 0.0, 0.0) );
            } else {
                offCube = mult( triCube, translate( 0.0, 0.0, 1.0) );
            }
            gl.uniformMatrix4fv(matrixLoc, false, flatten(offCube));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
        }
    }
    

    // Línur á kubbinn
    /*gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(grayColor), gl.STATIC_DRAW );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(triCube));
    gl.drawArrays( gl.LINES, 0, NumVertices );    

    gl.uniformMatrix4fv(matrixLoc, false, flatten(triCube));
    gl.drawArrays( gl.LINES, NumVertices, lineCubeVertices );
*/
    // Grid
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(grayColor), gl.STATIC_DRAW );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    for(i = 0; i < 7; i++){
        bottomlines = mult( ctm, translate( -0.15+(i*0.05), -0.5, 0.0 ) );
        bottomlines = mult( bottomlines, scale4( 0.001, 0.001, 0.3) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(bottomlines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        bottomlines = mult( ctm, translate( 0.0, -0.5, -0.15+(i*0.05) ) );
        bottomlines = mult( bottomlines, scale4( 0.3, 0.001, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(bottomlines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        toplines = mult( ctm, translate( -0.15+(i*0.05), 0.5, 0.0 ) );
        toplines = mult( toplines, scale4( 0.001, 0.001, 0.3) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(toplines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        toplines = mult( ctm, translate( 0.0, 0.5, -0.15+(i*0.05) ) );
        toplines = mult( toplines, scale4( 0.3, 0.001, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(toplines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        side1lines = mult( ctm, translate( -0.15+(i*0.05), 0.0, -0.15 ) );
        side1lines = mult( side1lines, scale4( 0.001, 1.0, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(side1lines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        side2lines = mult( ctm, translate( -0.15+(i*0.05), 0.0, 0.15 ) );
        side2lines = mult( side2lines, scale4( 0.001, 1.0, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(side2lines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        side3lines = mult( ctm, translate( 0.15, 0.0, -0.15+(i*0.05) ) );
        side3lines = mult( side3lines, scale4( 0.001, 1.0, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(side3lines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        side4lines = mult( ctm, translate( -0.15, 0.0, -0.15+(i*0.05) ) );
        side4lines = mult( side4lines, scale4( 0.001, 1.0, 0.001) );
        gl.uniformMatrix4fv(matrixLoc, false, flatten(side4lines));
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

        for(j = 0; j < 20; j++){
            side1lines = mult( ctm, translate( 0.0, -0.45+(j*0.05), -0.15) );
            side1lines = mult( side1lines, scale4( 0.3, 0.001, 0.001) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(side1lines));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

            side2lines = mult( ctm, translate( 0.0, -0.45+(j*0.05), 0.15) );
            side2lines = mult( side2lines, scale4( 0.3, 0.001, 0.001) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(side2lines));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

            side3lines = mult( ctm, translate( 0.15, -0.45+(j*0.05), 0.0) );
            side3lines = mult( side3lines, scale4( 0.001, 0.001, 0.3) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(side3lines));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

            side4lines = mult( ctm, translate( -0.15, -0.45+(j*0.05), 0.0) );
            side4lines = mult( side4lines, scale4( 0.001, 0.001, 0.3) );
            gl.uniformMatrix4fv(matrixLoc, false, flatten(side4lines));
            gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
        }
    }

    requestAnimFrame( render );
}

