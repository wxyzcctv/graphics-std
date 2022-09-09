const canvas = document.querySelector('canvas')
canvas.width = 500
canvas.height = 500
const context = canvas.getContext('2d')

const rectSize = [100, 100];
// 为了将图形居中将画布进行偏移
context.save()
context.translate(-0.5*rectSize[0], -0.5*rectSize[1])
context.fillStyle = 'red';
context.beginPath();
context.rect(0.5 * canvas.width, 0.5 * canvas.height, ...rectSize);
// 方式三：在绘图时计算好定位的位置
// context.rect(0.5 * (canvas.width - rectSize[0]), 0.5 * (canvas.height - rectSize[1]), ...rectSize);
context.fill();
// 将画布偏移的位置偏移回去
// 方式一: 使用反向偏移
// context.translate(0.5*rectSize[0], 0.5*rectSize[1])
// 方式二：使用save和restore两个api配合保存状态和回复状态
context.restore()