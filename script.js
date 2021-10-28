var getTime = function() {
    return new Date().getTime() / 1000.0;
}

onload = function()
{
    const canvas = document.getElementById("canvas");
    canvas.width = 810;
    canvas.height = 540;
    var gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2");

    var aAttribLoc = [];
    var aBlockIndex = [];
    var aUBO = [];
    var aUniformLocation = [];

    var mat = new matIV();
    var a_bMatrix = [];// バインド行列
    var a_bMatrixInv = [];	
    var a_lMatrix = [];// ローカル行列	
    var a_wMatrix = [];// ワールド行列
    var vpMatrix;

    var vs = load_shader(gl.VERTEX_SHADER, "vs");
    var fs = load_shader(gl.FRAGMENT_SHADER, "fs");
    var prg = gl.createProgram();
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    aAttribLoc[0] = gl.getAttribLocation(prg, "position");
    aAttribLoc[1] = gl.getAttribLocation(prg, "color");

    var vs_skin = load_shader(gl.VERTEX_SHADER, "vs_skin");
    var prg_skin = gl.createProgram();
    gl.attachShader(prg_skin, vs_skin);
    gl.attachShader(prg_skin, fs);
    gl.linkProgram(prg_skin);
    aAttribLoc[2] = gl.getAttribLocation(prg_skin, "position");
    aAttribLoc[3] = gl.getAttribLocation(prg_skin, "color");
    aAttribLoc[4] = gl.getAttribLocation(prg_skin, "weight0");

    // シェーダ定数
    const SHADER_BINDING_SCENE = 0;
    const SHADER_BINDING_OBJECT = 1;
    const SHADER_BINDING_BONE_OBJECT = 2;
    aBlockIndex[0] = gl.getUniformBlockIndex(prg, 'scene');
    aBlockIndex[1] = gl.getUniformBlockIndex(prg, 'object');
    aBlockIndex[2] = gl.getUniformBlockIndex(prg_skin, 'bone');
    gl.uniformBlockBinding(prg, aBlockIndex[0], SHADER_BINDING_SCENE);
    gl.uniformBlockBinding(prg, aBlockIndex[1], SHADER_BINDING_OBJECT);
    gl.uniformBlockBinding(prg_skin, aBlockIndex[0], SHADER_BINDING_SCENE);
    gl.uniformBlockBinding(prg_skin, aBlockIndex[2], SHADER_BINDING_BONE_OBJECT);
    aUBO[0] = gl.createBuffer();
    aUBO[1] = gl.createBuffer();
    aUBO[2] = gl.createBuffer();
    gl.bindBufferBase(gl.UNIFORM_BUFFER, SHADER_BINDING_SCENE, aUBO[0]);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, SHADER_BINDING_OBJECT, aUBO[1]);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, SHADER_BINDING_BONE_OBJECT, aUBO[2]);
	
    // 円柱モデル生成
    var mesh_vbo = create_buffer_object(gl.ARRAY_BUFFER, new Float32Array([
    //    x,     y,     z,     R,   G,   B,   A,  weight
      +0.0000, 0.0, +0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.0, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.0, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.0, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.0, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0000, 0.0, -0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.0, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.0, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.0, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.0, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,

      +0.0000, 0.1, +0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.1, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.1, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.1, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.1, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0000, 0.1, -0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.1, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.1, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.1, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.1, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,

      +0.0000, 0.2, +0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.2, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.2, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0951, 0.2, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0588, 0.2, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      +0.0000, 0.2, -0.1000,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.2, -0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.2, -0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0951, 0.2, +0.0309,  0.0, 0.0, 1.0, 1.0,  1.0,
      -0.0588, 0.2, +0.0809,  0.0, 0.0, 1.0, 1.0,  1.0,

      +0.0000, 0.3, +0.1000,  0.1, 0.0, 0.9, 1.0,  0.9,
      +0.0588, 0.3, +0.0809,  0.1, 0.0, 0.9, 1.0,  0.9,
      +0.0951, 0.3, +0.0309,  0.1, 0.0, 0.9, 1.0,  0.9,
      +0.0951, 0.3, -0.0309,  0.1, 0.0, 0.9, 1.0,  0.9,
      +0.0588, 0.3, -0.0809,  0.1, 0.0, 0.9, 1.0,  0.9,
      +0.0000, 0.3, -0.1000,  0.1, 0.0, 0.9, 1.0,  0.9,
      -0.0588, 0.3, -0.0809,  0.1, 0.0, 0.9, 1.0,  0.9,
      -0.0951, 0.3, -0.0309,  0.1, 0.0, 0.9, 1.0,  0.9,
      -0.0951, 0.3, +0.0309,  0.1, 0.0, 0.9, 1.0,  0.9,
      -0.0588, 0.3, +0.0809,  0.1, 0.0, 0.9, 1.0,  0.9,

      +0.0000, 0.4, +0.1000,  0.4, 0.0, 0.6, 1.0,  0.6,
      +0.0588, 0.4, +0.0809,  0.4, 0.0, 0.6, 1.0,  0.6,
      +0.0951, 0.4, +0.0309,  0.4, 0.0, 0.6, 1.0,  0.6,
      +0.0951, 0.4, -0.0309,  0.4, 0.0, 0.6, 1.0,  0.6,
      +0.0588, 0.4, -0.0809,  0.4, 0.0, 0.6, 1.0,  0.6,
      +0.0000, 0.4, -0.1000,  0.4, 0.0, 0.6, 1.0,  0.6,
      -0.0588, 0.4, -0.0809,  0.4, 0.0, 0.6, 1.0,  0.6,
      -0.0951, 0.4, -0.0309,  0.4, 0.0, 0.6, 1.0,  0.6,
      -0.0951, 0.4, +0.0309,  0.4, 0.0, 0.6, 1.0,  0.6,
      -0.0588, 0.4, +0.0809,  0.4, 0.0, 0.6, 1.0,  0.6,

      +0.0000, 0.5, +0.1000,  0.5, 0.0, 0.5, 1.0,  0.5,
      +0.0588, 0.5, +0.0809,  0.5, 0.0, 0.5, 1.0,  0.5,
      +0.0951, 0.5, +0.0309,  0.5, 0.0, 0.5, 1.0,  0.5,
      +0.0951, 0.5, -0.0309,  0.5, 0.0, 0.5, 1.0,  0.5,
      +0.0588, 0.5, -0.0809,  0.5, 0.0, 0.5, 1.0,  0.5,
      +0.0000, 0.5, -0.1000,  0.5, 0.0, 0.5, 1.0,  0.5,
      -0.0588, 0.5, -0.0809,  0.5, 0.0, 0.5, 1.0,  0.5,
      -0.0951, 0.5, -0.0309,  0.5, 0.0, 0.5, 1.0,  0.5,
      -0.0951, 0.5, +0.0309,  0.5, 0.0, 0.5, 1.0,  0.5,
      -0.0588, 0.5, +0.0809,  0.5, 0.0, 0.5, 1.0,  0.5,

      +0.0000, 0.6, +0.1000,  0.6, 0.0, 0.4, 1.0,  0.4,
      +0.0588, 0.6, +0.0809,  0.6, 0.0, 0.4, 1.0,  0.4,
      +0.0951, 0.6, +0.0309,  0.6, 0.0, 0.4, 1.0,  0.4,
      +0.0951, 0.6, -0.0309,  0.6, 0.0, 0.4, 1.0,  0.4,
      +0.0588, 0.6, -0.0809,  0.6, 0.0, 0.4, 1.0,  0.4,
      +0.0000, 0.6, -0.1000,  0.6, 0.0, 0.4, 1.0,  0.4,
      -0.0588, 0.6, -0.0809,  0.6, 0.0, 0.4, 1.0,  0.4,
      -0.0951, 0.6, -0.0309,  0.6, 0.0, 0.4, 1.0,  0.4,
      -0.0951, 0.6, +0.0309,  0.6, 0.0, 0.4, 1.0,  0.4,
      -0.0588, 0.6, +0.0809,  0.6, 0.0, 0.4, 1.0,  0.4,

      +0.0000, 0.7, +0.1000,  0.9, 0.0, 0.1, 1.0,  0.1,
      +0.0588, 0.7, +0.0809,  0.9, 0.0, 0.1, 1.0,  0.1,
      +0.0951, 0.7, +0.0309,  0.9, 0.0, 0.1, 1.0,  0.1,
      +0.0951, 0.7, -0.0309,  0.9, 0.0, 0.1, 1.0,  0.1,
      +0.0588, 0.7, -0.0809,  0.9, 0.0, 0.1, 1.0,  0.1,
      +0.0000, 0.7, -0.1000,  0.9, 0.0, 0.1, 1.0,  0.1,
      -0.0588, 0.7, -0.0809,  0.9, 0.0, 0.1, 1.0,  0.1,
      -0.0951, 0.7, -0.0309,  0.9, 0.0, 0.1, 1.0,  0.1,
      -0.0951, 0.7, +0.0309,  0.9, 0.0, 0.1, 1.0,  0.1,
      -0.0588, 0.7, +0.0809,  0.9, 0.0, 0.1, 1.0,  0.1,

      +0.0000, 0.8, +0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 0.8, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 0.8, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 0.8, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 0.8, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0000, 0.8, -0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 0.8, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 0.8, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 0.8, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 0.8, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,

      +0.0000, 0.9, +0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 0.9, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 0.9, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 0.9, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 0.9, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0000, 0.9, -0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 0.9, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 0.9, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 0.9, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 0.9, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,

      +0.0000, 1.0, +0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 1.0, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 1.0, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0951, 1.0, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0588, 1.0, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      +0.0000, 1.0, -0.1000,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 1.0, -0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 1.0, -0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0951, 1.0, +0.0309,  1.0, 0.0, 0.0, 1.0,  0.0,
      -0.0588, 1.0, +0.0809,  1.0, 0.0, 0.0, 1.0,  0.0,

    ]));
    var mesh_ibo = create_buffer_object(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([
      // 円
       0, 1,  1, 2,  2, 3,  3, 4,  4, 5,  5, 6,  6, 7,  7, 8,  8, 9,  9, 0,
      10,11, 11,12, 12,13, 13,14, 14,15, 15,16, 16,17, 17,18, 18,19, 19,10,
      20,21, 21,22, 22,23, 23,24, 24,25, 25,26, 26,27, 27,28, 28,29, 29,20,
      30,31, 31,32, 32,33, 33,34, 34,35, 35,36, 36,37, 37,38, 38,39, 39,30,
      40,41, 41,42, 42,43, 43,44, 44,45, 45,46, 46,47, 47,48, 48,49, 49,40,
      50,51, 51,52, 52,53, 53,54, 54,55, 55,56, 56,57, 57,58, 58,59, 59,50,
      60,61, 61,62, 62,63, 63,64, 64,65, 65,66, 66,67, 67,68, 68,69, 69,60,
      70,71, 71,72, 72,73, 73,74, 74,75, 75,76, 76,77, 77,78, 78,79, 79,70,
      80,81, 81,82, 82,83, 83,84, 84,85, 85,86, 86,87, 87,88, 88,89, 89,80,
      90,91, 91,92, 92,93, 93,94, 94,95, 95,96, 96,97, 97,98, 98,99, 99,90,
      100,101, 101,102, 102,103, 103,104, 104,105, 105,106, 106,107, 107,108, 108,109, 109,100,
      // 縦線
      0,10, 10,20, 20,30, 30,40, 40,50, 50,60, 60,70, 70,80, 80,90, 90,100,
      1,11, 11,21, 21,31, 31,41, 41,51, 51,61, 61,71, 71,81, 81,91, 91,101,
      2,12, 12,22, 22,32, 32,42, 42,52, 52,62, 62,72, 72,82, 82,92, 92,102,
      3,13, 13,23, 23,33, 33,43, 43,53, 53,63, 63,73, 73,83, 83,93, 93,103,
      4,14, 14,24, 24,34, 34,44, 44,54, 54,64, 64,74, 74,84, 84,94, 94,104,
      5,15, 15,25, 25,35, 35,45, 45,55, 55,65, 65,75, 75,85, 85,95, 95,105,
      6,16, 16,26, 26,36, 36,46, 46,56, 56,66, 66,76, 76,86, 86,96, 96,106,
      7,17, 17,27, 27,37, 37,47, 47,57, 57,67, 67,77, 77,87, 87,97, 97,107,
      8,18, 18,28, 28,38, 38,48, 48,58, 58,68, 68,78, 78,88, 88,98, 98,108,
      9,19, 19,29, 29,39, 39,49, 49,59, 59,69, 69,79, 79,89, 89,99, 99,109,
    ]));

    // 座標系表示メッシュ
    var axis_vbo = create_buffer_object(gl.ARRAY_BUFFER, new Float32Array([
    // x,    y,   z,    R,   G,   B,   A
      0.0,  0.0, 0.0,  1.0, 0.0, 0.0, 1.0,
      0.1,  0.0, 0.0,  1.0, 0.0, 0.0, 1.0,
      0.0,  0.0, 0.0,  0.0, 1.0, 0.0, 1.0,
      0.0,  0.1, 0.0,  0.0, 1.0, 0.0, 1.0,
      0.0,  0.0, 0.0,  0.0, 0.0, 1.0, 1.0,
      0.0,  0.0, 0.1,  0.0, 0.0, 1.0, 1.0,
    ]));
    var axis_ibo = create_buffer_object(gl.ELEMENT_ARRAY_BUFFER, new Int16Array([0,1, 2,3, 4,5]));

    // カメラ, 射影行列
    var from = [0.0, 0.1, 2.0];
    var lookat = [0.0, 0.0, 0.0];
    var up = [0.0, 1.0, 0.0];
    var vMatrix = mat.create();
    mat.lookAt(from, lookat, up, vMatrix);
    var pMatrix = mat.create();
    mat.perspective(40, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
    var vpMatrix = mat.create();
    mat.multiply(pMatrix, vMatrix, vpMatrix);

    // シーンの定数の設定
    gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[0]);
    gl.bufferData(gl.UNIFORM_BUFFER, vpMatrix, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    // メッシュの行列の初期化
    a_bMatrix[0]  = mat.identity(mat.create());
    a_bMatrix[1]  = mat.identity(mat.create());
    a_bMatrixInv[0]  = mat.identity(mat.create());
    a_bMatrixInv[1]  = mat.identity(mat.create());
    a_lMatrix[0]  = mat.identity(mat.create());
    a_lMatrix[1]  = mat.identity(mat.create());
    a_wMatrix[0]  = mat.identity(mat.create());
    a_wMatrix[1]  = mat.identity(mat.create());
    mat.translate(a_lMatrix[0], [0.0, -0.5, 0.0], a_lMatrix[0]);// 少し下に下げる
    mat.translate(a_bMatrix[1], [0.0, +0.5, 0.0], a_bMatrix[1]);// 骨はu方向に0.5
	
    //mat.inverse(a_bMatrixInv[1],[0.0, +0.5, 0.0],a_bMatrixInv[1]);
	
    gl.enable(gl.DEPTH_TEST);
    
    var frames = 0;
    var lastTime = getTime();
    
    var bend = 0.0;
    
    (function update(){
      requestAnimationFrame(update);
      
      var currentTime = getTime();
      var elapsedTime = currentTime - lastTime;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // モデルのローカル行列の更新
      mat.rotate(a_lMatrix[0], 10.0 * elapsedTime * Math.PI / 180, [0.0, 1.0, 0.0], a_lMatrix[0]);// src angle axis dest
      
      // 関節で曲げる
      bend += 0.1 * elapsedTime;
      if(1.0 < bend) bend -= 1.0;
      var angle = 0.0;
      if(bend < 0.25) {angle = bend * 2.0 * Math.PI;}
      else if(bend < 0.50) {angle = (0.5 - bend) * 2.0 * Math.PI;}
      mat.rotate(a_bMatrix[1], angle, [1.0, 0.0, 0.0], a_lMatrix[1]);// src angle axis dest

      // モデルのワールド行列の生成【ここをなんとかする】
      a_wMatrix[0] = a_lMatrix[0];
      a_wMatrix[1] = a_wMatrix[0];
      //a_wMatrix[1] = a_wMatrix[0]  * a_lMatrix[0] * a_bMatrixInv[0]-1;
	    
          
      // モデル描画
      gl.useProgram(prg_skin);

      // 描画用行列の設定
      gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[2]);
      gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
	// 関節 0
        a_wMatrix[0][0], a_wMatrix[0][1], a_wMatrix[0][2], a_wMatrix[0][3],
        a_wMatrix[0][4], a_wMatrix[0][5], a_wMatrix[0][6], a_wMatrix[0][7],
        a_wMatrix[0][8], a_wMatrix[0][9], a_wMatrix[0][10], a_wMatrix[0][11],
        a_wMatrix[0][12], a_wMatrix[0][13], a_wMatrix[0][14], a_wMatrix[0][15],
	// 関節 1
        a_wMatrix[1][0], a_wMatrix[1][1], a_wMatrix[1][2], a_wMatrix[1][3],
        a_wMatrix[1][4], a_wMatrix[1][5], a_wMatrix[1][6], a_wMatrix[1][7],
        a_wMatrix[1][8], a_wMatrix[1][9], a_wMatrix[1][10], a_wMatrix[1][11],
        a_wMatrix[1][12], a_wMatrix[1][13], a_wMatrix[1][14], a_wMatrix[1][15],
      ]), gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh_vbo);
      gl.enableVertexAttribArray(aAttribLoc[2]);
      gl.enableVertexAttribArray(aAttribLoc[3]);
      gl.enableVertexAttribArray(aAttribLoc[4]);
      var byteStride = 4*(3+4+1);
      gl.vertexAttribPointer(aAttribLoc[2], 3, gl.FLOAT, false, byteStride, 0);
      gl.vertexAttribPointer(aAttribLoc[3], 4, gl.FLOAT, false, byteStride, 4*3);
      gl.vertexAttribPointer(aAttribLoc[4], 1, gl.FLOAT, false, byteStride, 4*7);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh_ibo);
      
      gl.drawElements(gl.LINES, 420, gl.UNSIGNED_SHORT, 0);
      
      draw_axis();// 座標系の表示
      draw_bone();// ボーンの表示
      
      // 後片付け
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.flush();

      lastTime = currentTime;
      frames++;
    })();
	
    // 座標系の表示
    function draw_axis()
    {
      gl.useProgram(prg);
      gl.bindBuffer(gl.ARRAY_BUFFER, axis_vbo);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axis_ibo);
      gl.enableVertexAttribArray(aAttribLoc[0]);
      gl.enableVertexAttribArray(aAttribLoc[1]);
      gl.vertexAttribPointer(aAttribLoc[0], 3, gl.FLOAT, false, 4*(3+4), 0);
      gl.vertexAttribPointer(aAttribLoc[1], 4, gl.FLOAT, false, 4*(3+4), 4*3);

      // 根元の座標系
      gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[1]);
      gl.bufferData(gl.UNIFORM_BUFFER, a_lMatrix[0], gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      gl.drawElements(gl.LINES, 6, gl.UNSIGNED_SHORT, 0);
      // 次の座標系
      var m = mat.create();
      mat.multiply(a_lMatrix[0], a_lMatrix[1], m );
      gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[1]);
      gl.bufferData(gl.UNIFORM_BUFFER, m, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      gl.drawElements(gl.LINES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // ボーンの表示
    function draw_bone()
    {
      const vertexBuffer = gl.createBuffer();
      const colorBuffer = gl.createBuffer();
      var m = mat.create();
      mat.multiply(a_lMatrix[0], a_lMatrix[1], m );
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        a_lMatrix[0][12], a_lMatrix[0][13], a_lMatrix[0][14],
        m[12], m[13], m[14],
      ]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(aAttribLoc[0], 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0,
        ]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(aAttribLoc[1], 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.UNIFORM_BUFFER, aUBO[1]);
      gl.bufferData(gl.UNIFORM_BUFFER, mat.identity(mat.create()), gl.STATIC_DRAW);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
      gl.drawArrays(gl.LINES, 0, 2);
    }

    // バッファオブジェクトを生成する関数
    function create_buffer_object(type, data){
      var vbo = gl.createBuffer();
      gl.bindBuffer(type, vbo);
      gl.bufferData(type, data, gl.STATIC_DRAW);
      gl.bindBuffer(type, null);
      return vbo;
    }
	
    function load_shader(type, id){
      var out = gl.createShader(type);
      gl.shaderSource(out, document.getElementById(id).textContent);
      gl.compileShader(out);
      console.log(gl.getShaderInfoLog(out));
      return out;
    }
}
