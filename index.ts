function Cell(x: number, y: number, element: unknown) {
    return { x, y, element }
}

function createDrawingArea(
    rows: number = userSettings.rows,
    columns: number = userSettings.columns,
    backgroundColor: string = userSettings.backgroundColor
) {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.style.backgroundColor = backgroundColor
    let c = canvas.getContext("2d")!
    c.fillStyle = userSettings.defaultPenColor
    c.strokeStyle = userSettings.defaultPenColor
    // c.fillRect(10, 10, 10, 10)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rows; j++) {
            c.lineTo(i*30, j*3)
            c.moveTo(3, 3)
            c.stroke()
        }
    }
}

let userSettings = {
    rows: 10,
    columns: 10,
    backgroundColor: "darkslategray",
    defaultPenColor: "orange",
}

createDrawingArea()
