/* globals rough */
const rc = rough.canvas(document.querySelector('canvas'));
const ctx = rc.ctx;
// ctx.save();

// 我们通过 translate 变换将 Canvas 画布的坐标原点，从左上角 (0, 0) 点移动至 (256, 256) 位置，即画布的底边上的中点位置。
// 接着，以移动了原点后新的坐标为参照，通过 scale(1, -1) 将 y 轴向下的部分，即 y>0 的部分沿 x 轴翻转 180 度，
// 这样坐标系就变成以画布底边中点为原点，x 轴向右，y 轴向上的坐标系了。
ctx.translate(256, 256);
ctx.scale(1, -1);

const hillOpts1 = {
    roughness: 2.8,
    strokeWidth: 2,
    fill: 'green',
    fillStyle: 'dashed'
};
const hillOpts2 = {
    roughness: 2.8,
    strokeWidth: 2,
    fill: 'blue'
};

rc.path('M -20 0 L 80 100 L 180 0 Z', hillOpts1);
rc.path('M 80 80 A 45 45, 0, 0, 0, 125 125 L 125 80 Z', { fill: 'green' });
rc.path('M -180 0 L -80 100 L 20 0 Z', { stroke: 'red', strokeWidth: 4, fill: 'green' });
// rc.path('M 180 0 L 100 100 L -20 0 Z', { fill: 'green' });

rc.circle(0, 150, 105, {
    stroke: 'red',
    strokeWidth: 4,
    fill: 'rgba(255,255, 0, 0.4)',
    fillStyle: 'solid',
});

// ctx.restore()
// rc.circle(150, 150, 50, {
//     stroke: 'red',
//     strokeWidth: 4,
//     fill: 'rgba(255,255, 0, 0.4)',
//     fillStyle: 'solid',
// });


// console.log(rc);

// rc.path('M76 256L176 156L276 256', hillOpts);
// rc.path('M236 256L336 156L436 256', hillOpts);

// rc.circle(256, 106, 105, {
//   stroke: 'red',
//   strokeWidth: 4,
//   fill: 'rgba(255,255,0,0.4)',
//   fillStyle: 'solid',
// });