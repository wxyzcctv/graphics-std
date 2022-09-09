const dataSource = 'https://s5.ssl.qhres2.com/static/b0695e2dd30daa64.json';

/* globals d3 */
(async function () {
    const data = await (await fetch(dataSource)).json();
    // 对加载的数据进行去重
    const copyData = {
        name: '',
        children: []
    }
    copyData.name = data.name
    hasChild = {}
    for (let i = 0; i < data.children.length; i++) {
        const child = data.children[i];
        if (hasChild[child.name]) {
            continue
        } else {
            copyData.children.push(child)
        }
        hasChild[child.name] = 1
    }

    // 生成结构化数据
    const regions = d3.hierarchy(copyData)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value);

    const pack = d3.pack()
        .size([1600, 1600])
        .padding(3);

    const root = pack(regions);
    
    // 获取svg标签
    const svgroot = document.querySelector('svg');
    // 绘制基本的层级关系图
    function draw(parent, node, { fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white' } = {}) {
        const children = node.children;
        const { x, y, r } = node;
        // document.createElement 方法创建普通的 HTML 元素，
        // document.createElementNS 方法来创建 SVG 元素。
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', fillStyle);
        circle.setAttribute('data-name', node.data.name);
        // 将生成的圆添加到父元素下
        parent.appendChild(circle);
        
        // 如果子元素存在需要进行遍历
        if (children) {
            // SVG 的 g 元素表示一个分组，可以用它来对 SVG 元素建立起层级结构。
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (let i = 0; i < children.length; i++) {
                draw(group, children[i], {
                    fillStyle,
                    textColor
                });
            }
            group.setAttribute('data-name', node.data.name);
            parent.appendChild(group);
        } else {
            // 如果下一级没有数据了，那我们还是需要给它添加文字。在 SVG 中添加文字，只需要创建 text 元素
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('fill', textColor);
            text.setAttribute('font-family', 'Arial');
            text.setAttribute('font-size', '1.5rem');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.textContent = node.data.name;
            parent.appendChild(text);
        }
    }

    draw(svgroot, root);

    // 下面这段代码是实现鼠标交互效果
    // 添加标题
    const titleEl = document.getElementById('title');

    function getTitle(target) {
        const name = target.getAttribute('data-name');
        if (target.parentNode && target.parentNode.nodeName === 'g') {
            const parentName = target.parentNode.getAttribute('data-name');
            return `${parentName}-${name}`;
        }
        return name;
    }

    let activeTarget = null;
    svgroot.addEventListener('mousemove', (evt) => {
        let target = evt.target;
        if (target.nodeName === 'text') {
            // 文本节点的父节点是g，不对其进行操作，而是对其上一个兄弟节点circle进行操作
            target = target.previousSibling;
        }
        // 如果当前高亮节点与当前鼠标指定节点不为同一节点时
        if (activeTarget !== target) {
            // 如果高亮节点存在，高亮节点变灰
            if (activeTarget) activeTarget.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
            // 高亮节点不存在，高亮节点不进行操作，鼠标当前节点高亮，并指定高亮节点为当前节点，获取当前节点的标题
            target.setAttribute('fill', 'rgba(0, 128, 0, 0.1)');
            titleEl.textContent = getTitle(target);
            activeTarget = target;
        }
    });
}());