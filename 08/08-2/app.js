import {Vector2D} from '../../common/lib/vector2d.js';
import {earcut} from '../../common/lib/earcut.js';

const vertices = [
    [-0.7, 0.5],
    [-0.4, 0.3],
    [-0.25, 0.71],
    [-0.1, 0.56],
    [-0.1, 0.13],
    [0.4, 0.21],
    [0, -0.6],
    [-0.3, -0.3],
    [-0.6, -0.3],
    [-0.45, 0.0],
];

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const {width, height} = canvas
ctx.translate(0.5 * width, 0.5 * height)
ctx.scale(1, -1)

const poitions = vertices.map(([x, y]) => [x * 256, y * 256])

const points = poitions.flat();
const triangles = earcut(points);
console.log('triangles', triangles.length, triangles);
// const cells = new Uint16Array(triangles);

function draw(ctx, points, strokeStyle = 'black', fillStyle = null){
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(...points[i])
    }
    ctx.closePath();
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill()
    }
    ctx.stroke()
}

// // 只有一个图形时不存在bug
// draw(ctx, poitions, 'transparent', 'red');

// const {left, top} = canvas.getBoundingClientRect();

// canvas.addEventListener('mousemove', (evt) => {
//     const {x, y} = evt;
//     // 坐标转换
//     const offsetX = x - left;
//     const offsetY = y - top;

//     ctx.clearRect(-256, -256, 512, 512);

//     if(ctx.isPointInPath(offsetX, offsetY)) {
//         draw(ctx, poitions, 'transparent', 'green');
//     } else {
//         draw(ctx, poitions, 'transparent', 'red');
//     }
// });

// 但是存在多个图形时存在bug，只有当鼠标移动到小三角形内才会改变图形颜色
// 这就是因为，isPointInPath 仅能判断鼠标是否在最后一次绘制的小三角形内，
// 所以大多边形就没有被识别出来。
// draw(ctx, poitions, 'transparent', 'red');
// draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'blue');

// const {left, top} = canvas.getBoundingClientRect();

// canvas.addEventListener('mousemove', (evt) => {
//   const {x, y} = evt;
//   // 坐标转换
//   const offsetX = x - left;
//   const offsetY = y - top;
  
//   ctx.clearRect(-256, -256, 512, 512);
  
//   // 判断 offsetX、offsetY 的坐标是否在多边形内部
//   if(ctx.isPointInPath(offsetX, offsetY)) {
//     draw(ctx, poitions, 'transparent', 'green');
//     draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'orange');
//   } else {
//     draw(ctx, poitions, 'transparent', 'red');
//     draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'blue');
//   }
// });


// 如下这种isPointInPath方式性能消耗比较大的

// function isPointInPath(ctx, x, y) {
//     // 我们根据ctx重新clone一个新的canvas对象出来
//     const cloned = ctx.canvas.cloneNode().getContext('2d');
//     cloned.translate(0.5 * width, 0.5 * height);
//     cloned.scale(1, -1);
//     let ret = false;
//     // 绘制多边形c，然后判断点是否在图形内部
//     draw(cloned, poitions, 'transparent', 'red');
//     ret |= cloned.isPointInPath(x, y);
//     if(!ret) {
//         // 如果不在，在绘制小三角形，然后判断点是否在图形内部
//         draw(cloned, [[100, 100], [100, 200], [150, 200]], 'transparent', 'blue');
//         ret |= cloned.isPointInPath(x, y);
//     }
//     return ret;
// }

// 对以上函数进行修改


function inTriangle(p1, p2, p3, point) {
    const a = p2.copy().sub(p1);
    const b = p3.copy().sub(p2);
    const c = p1.copy().sub(p3);
  
    const u1 = point.copy().sub(p1);
    const u2 = point.copy().sub(p2);
    const u3 = point.copy().sub(p3);
  
    const s1 = Math.sign(a.cross(u1));
    let p = a.dot(u1) / a.length ** 2;
    if(s1 === 0 && p >= 0 && p <= 1) return true;
  
    const s2 = Math.sign(b.cross(u2));
    p = b.dot(u2) / b.length ** 2;
    if(s2 === 0 && p >= 0 && p <= 1) return true;
  
    const s3 = Math.sign(c.cross(u3));
    p = c.dot(u3) / c.length ** 2;
    if(s3 === 0 && p >= 0 && p <= 1) return true;
  
    return s1 === s2 && s2 === s3;
}


function isPointInPath({vertices, cells}, point) {
    console.log('123456');
    console.log('cells', cells);
    let ret = false;
    for(let i = 0; i < cells.length; i += 3) {
        const p1 = new Vector2D(...vertices[cells[i]]);
        const p2 = new Vector2D(...vertices[cells[i + 1]]);
        const p3 = new Vector2D(...vertices[cells[i + 2]]);
        if(inTriangle(p1, p2, p3, point)) {
            ret = true;
            break;
        }
    }
    return ret;
}

draw(ctx, poitions, 'transparent', 'red');
draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'blue');

const {left, top} = canvas.getBoundingClientRect();

canvas.addEventListener('mousemove', (evt) => {
    const {x, y} = evt;
    // 坐标转换
    const offsetX = x - left;
    const offsetY = y - top;

    ctx.clearRect(-256, -256, 512, 512);

    // if(isPointInPath(ctx, offsetX, offsetY)) {
    if(isPointInPath({vertices, triangles}, new Vector2D(offsetX, offsetY))) {
        draw(ctx, poitions, 'transparent', 'green');
        draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'orange');
    } else {
        draw(ctx, poitions, 'transparent', 'red');
        draw(ctx, [[100, 100], [100, 200], [150, 200]], 'transparent', 'blue');
    }
});