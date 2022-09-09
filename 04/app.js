// 步骤一
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// 步骤二
// 2.1 编写两个着色器（Shader）顶点着色器,片元着色器
const vertex = `
  attribute vec2 position;
  varying vec3 color;

  void main() {
    gl_PointSize = 1.0;
    color = vec3(0.5 + position * 0.5, 0.0);
    gl_Position = vec4(position * 0.5, 1.0, 1.0);
  }
`;

const fragment = `
  precision mediump float;
  varying vec3 color;

  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
`;

// 2.2 将定义的着色器代码片段创建成shader对象，分别使用的是createShader，shaderSource，compileShader
// 2.2.1 生成顶点着色器的shader对象
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

// 2.2.2 生成片元着色器的shader对象
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

// 2.3 创建 WebGLProgram 对象，并将这两个 shader 关联到这个 WebGL 程序上
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// 2.4 通过 useProgram 选择启用这个 WebGLProgram 对象
gl.useProgram(program);

// 自此就创建并完成了 WebGL 程序的配置

// 步骤三：将数据存入缓冲区
// 3.1 定义三角形的三个顶点，WebGL 使用的数据需要用类型数组定义，默认格式是 Float32Array
const points = new Float32Array([
    -1, -1,
    0, 1,
    1, -1,
]);

// 3.2 将定义好的数据写入 WebGL 的缓冲区，主要是利用 createBuffer、bindBuffer、bufferData 方法来实现的
const bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

// 步骤四：将缓冲区数据读取到 GPU
const vPosition = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // 给变量设置长度和类型
gl.enableVertexAttribArray(vPosition); // 激活这个变量

// 步骤五：执行着色器程序完成绘制
gl.clear(gl.COLOR_BUFFER_BIT);
// gl.drawArrays(gl.LINE_LOOP, 0, points.length / 2); // 空心三角形
gl.drawArrays(gl.TRIANGLES, 0, points.length / 2); // 实心心三角形
