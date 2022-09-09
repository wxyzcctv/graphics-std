const dataSource = 'https://s5.ssl.qhres2.com/static/b0695e2dd30daa64.json';

/* globals d3 */
(async function () {
    const data = await (await fetch(dataSource)).json();
    //  d3.hierarchy(data).sum(…).sort(…) 将省份数据按照包含城市的数量，从多到少排序
    const regions = d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value);
    // 将它们展现在一个画布宽高为 1600 * 1600 的 Canvas 中，那可以通过 d3.pack() 将数据映射为一组 1600 宽高范围内的圆形。
    // 为了展示得美观一些，在每个相邻的圆之间还保留 3 个像素的 padding
    const pack = d3.pack()
        .size([1600, 1600])
        .padding(3);

    const root = pack(regions);
    
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const TAU = 2 * Math.PI;
    const hasVisited = {}

    function draw(ctx, node, visited, { fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white' } = {}) {
        visited[node.data.name] = 1
        const children = node.children;
        const { x, y, r } = node;
        
        // 画最外层的圆
        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();

        // 遍历下一层圆
        if (children) {
            for (let i = 0; i < children.length; i++) {
                // 减少重复遍历
                if (visited[children[i].data.name]) {
                    continue
                }
                draw(context, children[i], visited);
            }
        } else {
            // 如果当前层没有children就表明是最里层的圆了，将该层的文字添加到圆上
            const name = node.data.name;
            ctx.fillStyle = textColor;
            ctx.font = '1.5rem Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name, x, y);
        }
    }
    CanvasRenderingContext2D.prototype.clearCircle = function (x, y,r) {
        context.save();
        context.fillStyle = "rgba(255,255,255,255)";
        context.beginPath();
        context.arc(x, y, r, 0, TAU);
        context.fill();
        context.restore();
    };
    // 鼠标检测移动到小圆就变色
    function isInCircle(ctx, mx, my, node) {
        const children = node.children;
        if (children) {
            for (let i = 0; i < children.length; i++) {
                isInCircle(ctx, mx, my, children[i]);
            }
        } else {
            const { x, y, r } = node;
            if ((my - y) * (my - y) + (mx - x) * (mx - x) < r * r) {
                console.log(x, y);
                // ctx.clearCircle(x, y, r);
                ctx.fillStyle = "rgba(255,0,0,0.2)";
                ctx.beginPath();
                ctx.arc(x, y, r, 0, TAU);
                ctx.fill();
                const name = node.data.name;
                ctx.fillStyle = "white";
                ctx.font = "1.5rem Arial";
                ctx.textAlign = "center";
                ctx.fillText(name, x, y);
            }
        }
    }

    canvas.addEventListener("mousemove", (e) => {
        const x = e.clientX * 2;
        const y = e.clientY * 2;
        isInCircle(context, x, y, root);
    });

    draw(context, root, hasVisited);
}());