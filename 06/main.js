const $ = el => document.querySelector(el)
const $$ = el => document.querySelectorAll(el)

class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    get length() {
        return Math.hypot(this.x, this.y)
    }
    get dir() {
        return Math.atan2(this.y, this.x)
    }
    scale(n) {
        return new Vector(this.x * n, this.y * n)
    }
    normalise() {
        return this.scale(1 / this.length)
    }
    reverse() {
        return this.scale(-1)
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y)
    }
    minus(v) {
        return this.add(v.reverse())
    }
    dot(v) {
        return this.x * v.x + this.y * v.y
    }
    cross(v) {
        return this.x * v.y - this.y * v.x
    }
}

class Canvas {
    constructor(canvas, { axis = true, size, dash = 8, color = 'black' } = {}) {
        const ctx = this.ctx = canvas.getContext('2d')
        if (!size) size = 512
        this.size = size
        this.dash = dash
        this.color = color
        const scale = this.scale = canvas.width / size
        ctx.scale(scale, -scale)
        ctx.translate(size / 2, -size / 2)
        ctx.strokeStyle = color
        if (axis) this.drawAxis()
        if (!window.mouseBinded) canvas.addEventListener('mousemove', e => {
            window.mouseBinded = true
            const rect = canvas.getBoundingClientRect()
            const x = (e.clientX - rect.left) * (canvas.width / rect.width) / scale - size / 2
            const y = size / 2 - (e.clientY - rect.top) * (canvas.height / rect.height) / scale
            ctx.clearRect(-size / 2, -size / 2, size, size)
            const point = [...$$('[name=point]')].find(x => x.checked).value
            if (point === 'P') {
                coordinates[0] = x
                coordinates[1] = y
            } else if (point === 'Q') {
                coordinates[2] = x
                coordinates[3] = y
            } else {
                coordinates[4] = x
                coordinates[5] = y
            }
            if (axis) this.drawAxis()
            $('#dist1').innerHTML = dist(...coordinates, true)
            $('#dist2').innerHTML = dist(...coordinates)
            $('#P').innerHTML = coordinates.slice(0, 2)
            $('#Q').innerHTML = coordinates.slice(2, 4)
            $('#R').innerHTML = coordinates.slice(4)
        })
    }
    drawAxis() {
        const { ctx, size, dash } = this
        const O = { x: 0, y: 0 }
        const X = { x: 1, y: 0 }
        const Y = { x: 0, y: 1 }
        this.line(O, X, true)
        this.line(O, Y, true)
        this.point(O, 'O')
    }
    text(x, y, text, filled = false) {
        const { ctx } = this
        ctx.scale(1, -1)
        ctx.font = `16px serif`
        filled ? ctx.fillText(text, x, -y) : ctx.strokeText(text, x, -y)
        ctx.scale(1, -1)
    }
    line(A, B, dashed = false, color) {
        if (A.x === B.x && A.y === B.y) return
        const p = this.size / 2
        const ends = [
            {
                x: A.x + (p - A.y) / (B.y - A.y) * (B.x - A.x),
                y: p
            },
            {
                x: A.x + (-p - A.y) / (B.y - A.y) * (B.x - A.x),
                y: -p
            },
            {
                x: p,
                y: A.y + (p - A.x) / (B.x - A.x) * (B.y - A.y)
            },
            {
                x: -p,
                y: A.y + (-p - A.x) / (B.x - A.x) * (B.y - A.y)
            }
        ]
        ends.forEach(P => this.lineSeg(A, P, dashed, color))
    }
    lineSeg({ x: x1, y: y1 }, { x: x2, y: y2 }, dashed = false, color) {
        const { ctx, dash } = this
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        if (dashed) ctx.setLineDash([dash, dash])
        if (color) ctx.strokeStyle = color
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = this.color
    }
    circle(x, y, r, filled = false) {
        const { ctx } = this
        ctx.beginPath()
        ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2)
        filled ? ctx.fill() : ctx.stroke()
    }
    point({ x, y }, name) {
        this.circle(x, y, 2, true)
        if (name) this.text(x, y, name, true)
    }
}
const coordinates = [0, 0, -100, 0, 100, 0]
const canvas = new Canvas($('canvas'), { axis: false })
dist(0, 0, -100, 0, 100, 0)

function dist(x0, y0, x1, y1, x2, y2, seg = false) {
    const P = new Vector(x0, y0)
    const Q = new Vector(x1, y1)
    const R = new Vector(x2, y2)
    const QR = R.minus(Q)
    const QP = P.minus(Q)
    const RP = P.minus(R)
    const PN = new Vector(QR.y, -QR.x)
    const N = QR.length === 0 ? Q.scale(1) : new Vector(
        P.x * QR.x ** 2 + Q.x * QR.y ** 2 + QR.x * QR.y * (P.y - Q.y),
        P.y * QR.y ** 2 + Q.y * QR.x ** 2 + QR.x * QR.y * (P.x - Q.x)
    ).scale(1 / QR.length ** 2)
    if (!seg) return QP.cross(QR) / QR.length
    canvas.point(P, 'P')
    canvas.point(Q, 'Q')
    canvas.point(R, 'R ')
    canvas.line(Q, R)
    canvas.lineSeg(Q, R, false, 'blue')
    if (QR.length === 0) {
        canvas.lineSeg(N, P)
        return QP.length
    }
    if (PN.length > 0) canvas.point(N, 'N')
    const dotProduct = QR.dot(QP) / QR.length
    if (dotProduct < 0) {
        canvas.lineSeg(N, P, true, 'green')
        canvas.lineSeg(P, Q, false, 'red')
        return QP.length
    }
    if (dotProduct > QR.length) {
        canvas.lineSeg(N, P, true, 'green')
        canvas.lineSeg(P, R, false, 'red')
        return RP.length
    }
    canvas.lineSeg(P, N, false, 'red')
    return QP.cross(QR) / QR.length
}