import { Vector2D } from '../common/lib/vector2d.js'

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vertex = `
    attribute vec2 position;

    uniform float u_rotation;
    uniform float u_time;
    uniform float u_duration;
    uniform float u_scale;
    uniform float u_orgX;
    uniform float u_orgY;
    uniform vec2 u_dir;
    uniform vec2 u_base;

    varying float vP;

    void main() {
        float p = min(1.0, u_time / u_duration);
        float rad = u_rotation + 3.14 * 10.0 * p;
        float scale = u_scale * p * (2.0 - p);
        float xposition = u_orgX;
        float yposition = u_orgY;
        // vec2 offset = u_dir;
        vec2 offset = 2.0 * u_dir * p * p + u_base * p;
        mat3 translateMatrix1 = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            xposition, -1.1, 1.0
        );
        mat3 translateMatrix2 = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, offset.y, 1.0
        );
        mat3 rotateMatrix = mat3(
            cos(rad), sin(rad), 0.0,
            -sin(rad), cos(rad), 0.0,
            0.0, 0.0, 1.0
        );
        mat3 scaleMatrix = mat3(
            scale, 0.0, 0.0,
            0.0, scale, 0.0,
            0.0, 0.0, 1.0
        );
        gl_PointSize = 1.0;
        vec3 pos = translateMatrix1 * translateMatrix2 * vec3(position * 0.1, 1.0);
        gl_Position = vec4(pos, 1.0);
        vP = p;
    }
`;

// vec3 pos = translateMatrix * rotateMatrix * scaleMatrix * vec3(position, 1.0);

const fragment = `
    precision mediump float;
    uniform vec4 u_color;

    varying float vP;

    void main() {
        // gl_FragColor = u_color;
        gl_FragColor.xyz = u_color.xyz;
        gl_FragColor.a = (1.0 - vP) * u_color.a;
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const position = new Float32Array([
    -1, -1,
    0, 1,
    1, -1,
]);

// 圆（在第一象限的1 / 4 圆）
const quarterCircle = [new Vector2D(100, 0)]
for (let angle = 0; angle < 90; angle  += 10) {
    const t = angle / 180 * Math.PI
    quarterCircle.push(quarterCircle[0].rotate(t))
}

// 圆（由第一象限的 1 / 4 圆旋转得到）
const circle = [...quarterCircle]
for (let i = 1; i <= 3; i++) {
    const rotated = quarterCircle.map(x => x.rotate(i * Math.PI * 0.5))
    circle.push(...rotated)
}

const bufferId = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);


const vPosition = gl.getAttribLocation(program, 'position');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

function randomTriangles() {
    const u_color = [Math.random(), Math.random(), Math.random(), 1.0]; // 随机颜色
    const u_rotation = Math.random() * Math.PI; // 初始旋转角度
    const u_scale = Math.random() * 0.05 + 0.03;    // 初始大小
    const u_orgX = Math.sin(Math.random() * Math.PI * 2);    // 初始大小
    const u_orgY = Math.random();    // 初始大小
    const u_time = 0;
    const u_duration = 5.0; // 持续时间3秒

    const rad = Math.random() * Math.PI;
    // const u_dir = [Math.cos(rad), Math.sin(rad)];   // 运动方向
    const u_dir = [Math.cos(rad), 1];   // 运动方向
    const startTime = performance.now();
    const stopLab = 1;

    return {u_color, u_rotation, u_scale, u_orgX, u_orgY, u_time, u_duration, u_dir, startTime, stopLab}
}

function setUniforms(gl, {u_color, u_rotation, u_scale, u_orgX, u_orgY, u_time, u_duration, u_dir}) {
    let loc = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(loc, u_color);

    loc = gl.getUniformLocation(program, 'u_rotation');
    gl.uniform1f(loc, u_rotation);

    loc = gl.getUniformLocation(program, 'u_scale');
    gl.uniform1f(loc, u_scale);

    loc = gl.getUniformLocation(program, 'u_orgX');
    gl.uniform1f(loc, u_orgX);

    loc = gl.getUniformLocation(program, 'u_orgY');
    gl.uniform1f(loc, u_orgY);

    loc = gl.getUniformLocation(program, 'u_time');
    gl.uniform1f(loc, u_time);

    loc = gl.getUniformLocation(program, 'u_duration');
    gl.uniform1f(loc, u_duration);

    loc = gl.getUniformLocation(program, 'u_dir');
    gl.uniform2fv(loc, u_dir);

    loc = gl.getUniformLocation(program, 'u_base');
    gl.uniform2fv(loc, [1,1]);    
}

let triangles = [];
let num = 0;
function update() {
    for (let i = 0; i < 5 * Math.random(); i++) {
    }
    triangles.push(randomTriangles());
    gl.clear(gl.COLOR_BUFFER_BIT);
    triangles.forEach((triangle) => {
        triangle.u_time = (performance.now() - triangle.startTime) / 1000;

        let p = Math.min(1.0, triangle.u_time / triangle.u_duration)
        // let offsetY = triangle.stopLab
        triangle.stopLab = 2.0 * triangle.stopLab * p * p;

        setUniforms(gl, triangle);
        gl.drawArrays(gl.TRIANGLES, 0, position.length / 2)
    });
    
    triangles = triangles.filter((triangle) => {
        // return triangle.stopLab < 0.5;
        return triangle.u_time <= triangle.u_duration;
    })
    requestAnimationFrame(update)
}

requestAnimationFrame(update)
