const dataSource = 'https://s5.ssl.qhres2.com/static/b0695e2dd30daa64.json'
const $ = el => document.querySelector(el)
let currentCity = null
let cities

+async function() {
    const data = await (await fetch(dataSource)).json()
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
    
    const regions = d3.hierarchy(copyData)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value)
    const pack = d3.pack().size([1600, 1600]).padding(3)
    const root = pack(regions)
    cities = root.children.map(x => x.children).flat()
    // 底层canvas用来画关系图
    const ctxUnder = $('#under').getContext('2d')
    const hasVisited = {}
    draw(ctxUnder, root, hasVisited)
    // 上层canvas用来实现浮动改变颜色
    $('#over').addEventListener('mousemove', highlightCity)
}()


function highlightCity(e) {
    const canvas = e.target
    const ctx = canvas.getContext('2d')
    // 每次鼠标移动都会清空画布
    const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 获取鼠标所在位置
    const cursor = getCanvasPos(canvas, e)
    let overVisited = {}

    const inOntherCity = cities.some(city => {
        const dx = cursor.x - city.x
        const dy = cursor.y - city.y
        const dist = dx ** 2 + dy ** 2 - city.r ** 2
        // 判断是否有一个城市的中心点的距离与鼠标坐标点的距离
        // 如果有且距离小于0表示鼠标在城市内,该城市小圆改变颜色
        if (dist <= 0) {
            // 如果鼠标还在当前城市,不做操作
            if (currentCity !== city) {
                // 如果鼠标不在当前城市而是另一个城市,先清除画布,然后对新城市添加颜色
                clearCanvas()
                currentCity = city
                draw(ctx, city, overVisited, { fillStyle: 'rgba(255, 0, 0, 0.2)' })                
            }
            return true
        }
        return false
    })
    
    if (!inOntherCity) {
        // 如果鼠标坐标点与所有城市中心点的距离均大于城市半径，表明鼠标不在城市中，清空画布
        clearCanvas()
        currentCity = null
        overVisited = {}
    }
}

function getCanvasPos(canvas, e) {
    // 获取鼠标的位置
    const rect = canvas.getBoundingClientRect()
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }
}

function draw(ctx, node, visited, { fillStyle = 'rgba(0, 0, 0, 0.2)', textColor = 'white' } = {}) {    
    visited[node.data.name] = 1
    const children = node.children
    const { x, y, r } = node
    ctx.fillStyle = fillStyle
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()    
    if (children) {
        for (let i = 0; i < children.length; i++) {
            // 减少重复遍历
            if (visited[children[i].data.name]) {
                continue
            }
            draw(ctx, children[i], visited);
        }
    } else {
        const name = node.data.name
        ctx.fillStyle = textColor
        ctx.font = '1.5rem Arial'
        ctx.textAlign = 'center'
        ctx.fillText(name, x, y)
    }
}