import { Rectangle, Scene } from "pencil.js"

function el(id: string) {
    return document.getElementById(id)!
}

function createDrawingArea(
    rows: number | undefined = userSettings.rows,
    columns: number | undefined = userSettings.columns,
    backgroundColor: string | undefined = userSettings.gridBackgroundColor,
    gridLineColor: string | undefined = userSettings.gridLineColor,
) {
    let cellWidth = scene.width / rows!
    let cellHeight = scene.height / columns!
    for (let i = 0; i < rows!; i++) {
        for (let j = 0; j < columns!; j++) {
            let r = new Rectangle([cellWidth * i, cellHeight * j], cellWidth - 1, cellHeight - 1, { fill: backgroundColor })
            r.on("hover", () => { if (mouseIsDown) { r.options.fill = userSettings.penColor } })
            r.on("mousedown", () => { if (mouseIsDown) { r.options.fill = userSettings.penColor } })
            scene.add(r)
            cells.push(r)
        }
    }
}
type settings = {
    rows?: number,
    columns?: number,
    penColor?: string,
    gridLineColor?: string,
    gridBackgroundColor?: string,
    currentTool: string
}

function fillTool() {
    window.onclick = () => {}
}

function loadSettings(locallySavedSettings?: settings): settings {
    let defaultSettings = {
        rows: 30,
        columns: 30,
        penColor: penColorHEX,
        gridLineColor: "#000000",
        gridBackgroundColor: "darkslategray",
        currentTool: "Pen"
    }
    let settings = defaultSettings
    if (locallySavedSettings !== undefined) {
        Object.assign(settings, locallySavedSettings)
    }
    return settings
}
let penColorHEX = "#ffbfaa"
let userSettings = loadSettings()
let mouseIsDown
let cells: Rectangle[] = []
window.addEventListener("mousedown", () => { mouseIsDown = true })
window.addEventListener("mouseup", () => { mouseIsDown = false })
function createToolbarEventListeners() {
    // color input element for changing pen color
    let colin = el("color-input") as HTMLInputElement
    colin.value = penColorHEX
    colin.addEventListener("change", (e) => {
        userSettings.penColor = colin.value
    })
    // save button
    el("save-button")!.onclick = () => {
        let imageData = document.querySelector("canvas")!.toDataURL()
        let invLink = document.createElement('a');
        invLink.download = 'image.png';
        invLink.href = imageData;
        document.body.appendChild(invLink);
        invLink.click();
        document.body.removeChild(invLink);
    }
    // tool button
    el("current-tool-button")!.innerText = "Current tool: " + userSettings.currentTool
}
createToolbarEventListeners()
let scene = new Scene(el("pencilCanvas"), { fill: userSettings.gridLineColor })
scene.startLoop()
createDrawingArea()
