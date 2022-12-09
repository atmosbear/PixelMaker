import { Rectangle, Scene } from "pencil.js"

function createDrawingArea(
    rows: number = userSettings.rows,
    columns: number = userSettings.columns,
    backgroundColor: string | undefined = userSettings.gridBackgroundColor,
    gridLineColor: string | undefined = userSettings.gridLineColor,
) {
    let cellWidth = scene.width / rows
    let cellHeight = scene.height / columns
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let r = new Rectangle([cellWidth * i, cellHeight * j], cellWidth - 1, cellHeight - 1, { fill: backgroundColor })
            r.on("hover", () => { if (mouseIsDown) { r.options.fill = userSettings.penColor } })
            r.on("mousedown", () => { if (mouseIsDown) { r.options.fill = userSettings.penColor } })
            scene.add(r)
        }
    }
}
type settings = {
    rows: number,
    columns: number,
    penColor: string,
    gridLineColor: string,
    gridBackgroundColor: string
}

let mouseIsDown
window.addEventListener("mousedown", () => { mouseIsDown = true })
window.addEventListener("mouseup", () => { mouseIsDown = false })
function loadSettings(locallySavedSettings?: settings): settings {
    let defaultSettings = {
        rows: 30,
        columns: 30,
        penColor: "blue",
        gridLineColor: "black",
        gridBackgroundColor: "darkslategray",
    }
    let settings = defaultSettings
    if (locallySavedSettings !== undefined) {
        Object.assign(settings, locallySavedSettings)
    }
    return settings
}

let userSettings = loadSettings()
let colin = document.getElementById("color-input")! //@ts-expect-error value does actually exist here.
colin.addEventListener("change", (e) => { userSettings.penColor = e.target!.value })
let scene = new Scene(document.getElementById("pencilCanvas"), { fill: userSettings.gridLineColor })
scene.startLoop()
createDrawingArea()