const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const {width, height} = canvas;
ctx.translate(0.5 * width, 0.5 * height);
ctx.scale(1, -1);

function draw(points, strokeStyle = 'black', fillStyle = null) {
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for(let i = 1; i < points.length; i++) {
    ctx.lineTo(...points[i]);
  }
  ctx.closePath();
  if(fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  ctx.stroke();
}

// 圆
const TAU_SEGMENTS = 60;
const TAU = Math.PI * 2;
function arc(x0, y0, radius, startAng = 0, endAng = Math.PI * 2) {
  const ang = Math.min(TAU, endAng - startAng);
  const ret = ang === TAU ? [] : [[x0, y0]];
  const segments = Math.round(TAU_SEGMENTS * ang / TAU);
  for(let i = 0; i <= segments; i++) {
    const x = x0 + radius * Math.cos(startAng + ang * i / segments);
    const y = y0 + radius * Math.sin(startAng + ang * i / segments);
    ret.push([x, y]);
  }
  return ret;
}
// draw(arc(0, 0, 100));

// 椭圆
function ellipse(x0, y0, radiusX, radiusY, startAng = 0, endAng = Math.PI * 2) {
  const ang = Math.min(TAU, endAng - startAng);
  const ret = ang === TAU ? [] : [[x0, y0]];
  const segments = Math.round(TAU_SEGMENTS * ang / TAU);
  for(let i = 0; i <= segments; i++) {
    const x = x0 + radiusX * Math.cos(startAng + ang * i / segments);
    const y = y0 + radiusY * Math.sin(startAng + ang * i / segments);
    ret.push([x, y]);
  }
  return ret;
}
// draw(ellipse(0, 0, 100, 50));

// 抛物线
const LINE_SEGMENTS = 60;
function parabola(x0, y0, p, min, max) {
  const ret = [];
  for(let i = 0; i <= LINE_SEGMENTS; i++) {
    const s = i / 60;
    const t = min * (1 - s) + max * s;
    const x = x0 + 2 * p * t ** 2;
    const y = y0 + 2 * p * t;
    ret.push([x, y]);
  }
  return ret;
}
// draw(parabola(0, 0, 5.5, -10, 10));


// 根据点来绘制图形
function drawShape(points, context, {
    strokeStyle = 'black',
    fillStyle = null,
    close = false,
  } = {}) {
    context.strokeStyle = strokeStyle;
    context.beginPath();
    context.moveTo(...points[0]);
    for(let i = 1; i < points.length; i++) {
      context.lineTo(...points[i]);
    }
    if(close) context.closePath();
    if(fillStyle) {
      context.fillStyle = fillStyle;
      context.fill();
    }
    context.stroke();
}
  
export function parametric(xFunc, yFunc) {
    return function (start, end, seg = 100, ...args) {
        console.log('函数参数', {start, end, seg, ...args});
        const points = [];
        for(let i = 0; i <= seg; i++) {
            const p = i / seg;
            const t = start * (1 - p) + end * p;
            const x = xFunc(t, ...args); // 计算参数方程组的x
            const y = yFunc(t, ...args);  // 计算参数方程组的y
            points.push([x, y]);
        }
        return {
            draw: drawShape.bind(null, points),
            points,
        };
    };
}


// 抛物线参数方程
const para = parametric(
    t => 25 * t,
    t => 25 * t ** 2,
);  
// 绘制抛物线
para(-5.5, 5.5).draw(ctx);

// 圆形参数方程
const circle = parametric(
    (t, r, x) => x + r * Math.cos(t),
    (t, r, y) => y + r * Math.sin(t),
);
circle(0, Math.PI * 2, 60, 150, 0).draw(ctx, {strokeStyle: 'orange'});

// 阿基米德螺旋线
const helical = parametric(
    (t, l) => l * t * Math.cos(t),
    (t, l) => l * t * Math.sin(t),
);
helical(0, 50, 500, 5).draw(ctx, {strokeStyle: 'blue'});

// 星形线
const star = parametric(
    (t, l) => l * Math.cos(t) ** 3,
    (t, l) => l * Math.sin(t) ** 3,
);
star(0, Math.PI * 2, 50, 150).draw(ctx, {strokeStyle: 'red'});