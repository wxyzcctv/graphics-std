window.onload = function () {
    const values = [30, 35, 45, 90, 160]
    const colors = ['#37c', '#3c7', 'orange', '#f73', '#ccc']
    const commonData = {
        data: prepare({ values, colors }),
        center: {
            x: 125,
            y: 125
        },
        radius: 125
    }
    drawCanvasPie(document.querySelector('#canvas'), commonData)
    drawSvgPie(document.querySelector('#svg'), commonData)
}

function prepare({ values, colors }) {
    const sum = values.reduce((x, y) => x + y)
    return values.map((x, i) => [(x / sum) * 2 * Math.PI, colors[i]])
}

function drawSvgPie(el, { data, center, radius }) {
    const paths = []
    let start = {
        x: center.x,
        y: center.y - radius
    }
    let deg = 0
    for (const [value, color] of data) {
        deg += value
        const end = {
            x: center.x + radius * Math.sin(deg),
            y: center.y - radius * Math.cos(deg)
        }
        const largeArc = value >= Math.PI ? 1 : 0
        const pathD =
            `M ${center.x} ${center.y}` +
            `L ${start.x} ${start.y}` +
            `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}` +
            'Z'
        paths.push(`<path d="${pathD}" fill="${color}" />`)
        start = end
    }
    const d = radius * 2
    el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" ' +
        `width="${d}px" height="${d}px" viewBox="0 0 ${d} ${d}">` +
        paths.join('') +
        '</svg>'
}

function drawCanvasPie(el, { data, center, radius }) {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', radius * 2)
    canvas.setAttribute('height', radius * 2)
    const ctx = canvas.getContext('2d')
    let start = -Math.PI / 2
    for (const [value, color] of data) {
        const end = start + value
        ctx.beginPath()
        ctx.arc(center.x, center.y, radius, start, end, false)
        ctx.lineTo(center.x, center.y)
        ctx.fillStyle = color
        ctx.fill()
        ctx.closePath()
        start = end
    }
    el.append(canvas)
}