"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pencil_js_1 = require("pencil.js");
/**
 * Returns an element - assumes you know what you're calling exists!
 */
function el(id) {
    return document.getElementById(id);
}
/**
 * Gets the cell object within the cells global array from its coordinates.
 */
function getCellByCoords(x, y) {
    let ret;
    cells.forEach((cell) => {
        if (cell.x === x && cell.y === y) {
            ret = cell;
        }
    });
    return ret;
}
/**
 * Returns a cell's neighbors given a distance - useful for making circles/radii.
 */
function findNeighborsByDistanceOf(centerCell, maxDistance) {
    let neighbors = [];
    cells.forEach((cell) => {
        if (Math.sqrt(Math.pow(cell.x - centerCell.x, 2) + Math.pow(cell.y - centerCell.y, 2)) < maxDistance) {
            neighbors.push(cell);
        }
    });
    return neighbors;
}
let done = false;
let repeats = 0;
let ret = [];
/**
 * Finds the neighbors of a cell that are the exact same color. Opportunity for expansion: make it so that it can do the same general range of colors.
 */
function findSameColoredNeighborsOf(cell) {
    let x = cell.x;
    let y = cell.y;
    let c = cell.rectangle.options.fill;
    let up = getCellByCoords(x, y + 1);
    let left = getCellByCoords(x - 1, y);
    let right = getCellByCoords(x + 1, y);
    let down = getCellByCoords(x, y - 1);
    let near = [up, left, right, down];
    repeats++; // TODO: DONT FORGET TO CLEAR IT /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (repeats < 5) {
        near.forEach((dir) => {
            if (dir && dir.rectangle.options.fill === c && !ret.includes(dir)) {
                console.log("pushing", dir);
                ret.push(dir);
                findSameColoredNeighborsOf(dir);
            }
            else {
            }
        });
    }
    // near.forEach((dir) => {if (dir) {findSameColoredNeighborsOf(dir)}})
    repeats = 0;
    return ret;
}
/**
 * Gives a PencilJS rectangle element the tool event listeners needed for the user to draw.
 */
function giveRectangleEventListener(cell) {
    function toolHandler() {
        let tool = userSettings.currentToolName;
        let penCol = userSettings.penColor;
        if (tool === "Fill") {
            findSameColoredNeighborsOf(cell).forEach((neighborCell) => {
                neighborCell.rectangle.options.fill = penCol;
            });
            cell.rectangle.options.fill = penCol;
        }
        else if (tool === "Pen") {
            let neighbors = findNeighborsByDistanceOf(cell, userSettings.penRadius);
            neighbors.forEach((neighbor) => {
                neighbor.rectangle.options.fill = penCol;
            });
        }
        else if (tool === "Erase") {
            let neighbors = findNeighborsByDistanceOf(cell, userSettings.penRadius);
            neighbors.forEach((neighbor) => {
                neighbor.rectangle.options.fill = userSettings.gridBackgroundColor;
            });
        }
    }
    cell.rectangle.on("hover", () => {
        if (mouseIsDown)
            toolHandler();
    });
    cell.rectangle.on("mousedown", () => {
        toolHandler();
    });
}
/**
 * (Re)creates the drawing area, clearing the user's drawing.
 */
function createDrawingArea(rows = userSettings.rows, columns = userSettings.columns, backgroundColor = userSettings.gridBackgroundColor, gridLineColor = userSettings.gridLineColor) {
    let p = el("pencilCanvas");
    p.remove();
    // if (p.childNodes.length > 1)
    let a = document.createElement("div");
    a.id = "pencilCanvas";
    document.body.appendChild(a);
    scene = createScene();
    scene.startLoop();
    // scene.clear()
    // p.childNodes.forEach((node) => {node.remove()})
    let cellWidth = scene.width / rows;
    let cellHeight = scene.height / columns;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let r = new pencil_js_1.Rectangle([cellWidth * i, cellHeight * j], cellWidth - 1, cellHeight - 1, { fill: backgroundColor });
            scene.add(r);
            let cellObj = { rectangle: r, x: i, y: j };
            giveRectangleEventListener(cellObj);
            cells.push(cellObj);
        }
    }
}
el("about-section").onclick = () => {
    let e = el("about-section-2");
    e.style.display === "none" ? e.style.display = "block" : e.style.display = "none";
};
/**
 * The settings that the user has - essentially a Singleton. Includes colors.
 */
class Settings {
    constructor(rows = 30, // note that it does not output in pixels... Is there a way to change that??
    columns = 30, penColor = "#aabbff", gridLineColor = "#000000", gridBackgroundColor = "darkslategray", currentToolName = "Pen", penRadius = 2) {
        this.rows = rows;
        this.columns = columns;
        this.penColor = penColor;
        this.gridLineColor = gridLineColor;
        this.gridBackgroundColor = gridBackgroundColor;
        this.currentToolName = currentToolName;
        this.penRadius = penRadius;
    }
}
/**
 * Loads the settings. If there are any saved locally, loads them.
*/
function loadSettings(locallySavedSettings) {
    let defaultSettings = new Settings();
    let settings = defaultSettings;
    if (locallySavedSettings !== undefined) {
        Object.assign(settings, locallySavedSettings);
    }
    return settings;
}
/**
 *
 */
function createToolbarEventListeners() {
    // color input element for changing pen color
    let colin = el("color-input");
    colin.value = userSettings.penColor;
    colin.addEventListener("change", (e) => {
        userSettings.penColor = colin.value;
    });
    // save button
    el("save-button").onclick = () => {
        let imageData = document.querySelector("canvas").toDataURL();
        let invLink = document.createElement('a');
        invLink.download = 'image.png';
        invLink.href = imageData;
        document.body.appendChild(invLink);
        invLink.click();
        document.body.removeChild(invLink);
    };
    //clear button
    let tb = el("clear-screen-button");
    tb.onclick = () => {
        createDrawingArea();
    };
    // tool buttons
    function toolButton(toolButtonID, toolName, backgroundColor) {
        let tb = el(toolButtonID);
        tb.onclick = () => {
            toolButtons.forEach((button) => { button.style.backgroundColor = "white"; });
            userSettings.currentToolName = toolName;
            tb.style.backgroundColor = backgroundColor;
            toolButtons.push(tb);
        };
    }
    let toolButtons = [];
    toolButton("fill-tool-button", "Fill", "orange");
    toolButton("pen-tool-button", "Pen", "orange");
    toolButton("erase-tool-button", "Erase", "orange");
    // sliders
    createSlider("row-slider", "row-slider-label", "rows", "Rows", createDrawingArea);
    createSlider("column-slider", "column-slider-label", "columns", "Columns", createDrawingArea);
    createSlider("pen-radius-slider", "pen-radius-slider-label", "penRadius", "Radius", () => { });
    function createSlider(sliderID, sliderLabelID, controlledUserSetting, visibleSettingName, also) {
        let sliderWidth = 100;
        let sliderEl = el(sliderID);
        let sliderLabel = el(sliderLabelID);
        // @ts-expect-error TODO: Why does it think it doesn't exist even though I used a "!"?
        sliderEl.value = userSettings[controlledUserSetting];
        sliderEl.style.width = sliderWidth + "px";
        function updateSlider() {
            // @ts-expect-error TODO: Why does it think it doesn't exist even though I used a "!"?
            let val = sliderEl.value;
            sliderLabel.innerText = visibleSettingName + ": " + val;
            userSettings[controlledUserSetting] = val;
        }
        updateSlider();
        also();
        sliderEl.onchange = (e) => { updateSlider(); also(); };
    }
}
/**
 * Creates the scene for the project using the already-established HTML div.
*/
function createScene() {
    let scene = new pencil_js_1.Scene(el("pencilCanvas"), { fill: userSettings.gridLineColor });
    return scene;
}
let userSettings = loadSettings();
let mouseIsDown;
let cells = [];
let scene = createScene();
createToolbarEventListeners();
window.addEventListener("mousedown", () => { mouseIsDown = true; });
window.addEventListener("mouseup", () => { mouseIsDown = false; });
scene.startLoop();
//# sourceMappingURL=index.js.map