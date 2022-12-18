import { Rectangle, Scene } from "https://unpkg.com/pencil.js/dist/pencil.esm.js";
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
    var ret;
    cells.forEach(function (cell) {
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
    var neighbors = [];
    cells.forEach(function (cell) {
        if (Math.sqrt(Math.pow(cell.x - centerCell.x, 2) + Math.pow(cell.y - centerCell.y, 2)) < maxDistance) {
            neighbors.push(cell);
        }
    });
    return neighbors;
}
var done = false;
var repeats = 0;
var ret = [];
/**
 * Finds the neighbors of a cell that are the exact same color. Opportunity for expansion: make it so that it can do the same general range of colors.
 */
function findSameColoredNeighborsOf(cell) {
    var x = cell.x;
    var y = cell.y;
    var c = cell.rectangle.options.fill;
    var up = getCellByCoords(x, y + 1);
    var left = getCellByCoords(x - 1, y);
    var right = getCellByCoords(x + 1, y);
    var down = getCellByCoords(x, y - 1);
    var near = [up, left, right, down];
    repeats++; // TODO: DONT FORGET TO CLEAR IT /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (repeats < 5) {
        near.forEach(function (dir) {
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
        var tool = userSettings.currentToolName;
        var penCol = userSettings.penColor;
        if (tool === "Fill") {
            findSameColoredNeighborsOf(cell).forEach(function (neighborCell) {
                neighborCell.rectangle.options.fill = penCol;
            });
            cell.rectangle.options.fill = penCol;
        }
        else if (tool === "Pen") {
            var neighbors = findNeighborsByDistanceOf(cell, userSettings.penRadius);
            neighbors.forEach(function (neighbor) {
                neighbor.rectangle.options.fill = penCol;
            });
        }
        else if (tool === "Erase") {
            var neighbors = findNeighborsByDistanceOf(cell, userSettings.penRadius);
            neighbors.forEach(function (neighbor) {
                neighbor.rectangle.options.fill = userSettings.gridBackgroundColor;
            });
        }
    }
    cell.rectangle.on("hover", function () {
        if (mouseIsDown)
            toolHandler();
    });
    cell.rectangle.on("mousedown", function () {
        toolHandler();
    });
}
/**
 * (Re)creates the drawing area, clearing the user's drawing.
 */
function createDrawingArea(rows, columns, backgroundColor, gridLineColor) {
    if (rows === void 0) { rows = userSettings.rows; }
    if (columns === void 0) { columns = userSettings.columns; }
    if (backgroundColor === void 0) { backgroundColor = userSettings.gridBackgroundColor; }
    if (gridLineColor === void 0) { gridLineColor = userSettings.gridLineColor; }
    var p = el("pencilCanvas");
    p.remove();
    // if (p.childNodes.length > 1)
    var a = document.createElement("div");
    a.id = "pencilCanvas";
    document.body.appendChild(a);
    scene = createScene();
    scene.startLoop();
    // scene.clear()
    // p.childNodes.forEach((node) => {node.remove()})
    var cellWidth = scene.width / rows;
    var cellHeight = scene.height / columns;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var r = new Rectangle([cellWidth * i, cellHeight * j], cellWidth - 1, cellHeight - 1, { fill: backgroundColor });
            scene.add(r);
            var cellObj = { rectangle: r, x: i, y: j };
            giveRectangleEventListener(cellObj);
            cells.push(cellObj);
        }
    }
}
el("about-section").onclick = function () {
    var e = el("about-section-2");
    e.style.display === "none" ? e.style.display = "block" : e.style.display = "none";
};
/**
 * The settings that the user has - essentially a Singleton. Includes colors.
 */
var Settings = /** @class */ (function () {
    function Settings(rows, // note that it does not output in pixels... Is there a way to change that??
    columns, penColor, gridLineColor, gridBackgroundColor, currentToolName, penRadius) {
        if (rows === void 0) { rows = 30; }
        if (columns === void 0) { columns = 30; }
        if (penColor === void 0) { penColor = "#aabbff"; }
        if (gridLineColor === void 0) { gridLineColor = "#000000"; }
        if (gridBackgroundColor === void 0) { gridBackgroundColor = "darkslategray"; }
        if (currentToolName === void 0) { currentToolName = "Pen"; }
        if (penRadius === void 0) { penRadius = 2; }
        this.rows = rows;
        this.columns = columns;
        this.penColor = penColor;
        this.gridLineColor = gridLineColor;
        this.gridBackgroundColor = gridBackgroundColor;
        this.currentToolName = currentToolName;
        this.penRadius = penRadius;
    }
    return Settings;
}());
/**
 * Loads the settings. If there are any saved locally, loads them.
*/
function loadSettings(locallySavedSettings) {
    var defaultSettings = new Settings();
    var settings = defaultSettings;
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
    var colin = el("color-input");
    colin.value = userSettings.penColor;
    colin.addEventListener("change", function (e) {
        userSettings.penColor = colin.value;
    });
    // save button
    el("save-button").onclick = function () {
        var imageData = document.querySelector("canvas").toDataURL();
        var invLink = document.createElement('a');
        invLink.download = 'image.png';
        invLink.href = imageData;
        document.body.appendChild(invLink);
        invLink.click();
        document.body.removeChild(invLink);
    };
    //clear button
    var tb = el("clear-screen-button");
    tb.onclick = function () {
        createDrawingArea();
    };
    // tool buttons
    function toolButton(toolButtonID, toolName, backgroundColor) {
        var tb = el(toolButtonID);
        tb.onclick = function () {
            toolButtons.forEach(function (button) { button.style.backgroundColor = "white"; });
            userSettings.currentToolName = toolName;
            tb.style.backgroundColor = backgroundColor;
            toolButtons.push(tb);
        };
    }
    var toolButtons = [];
    toolButton("fill-tool-button", "Fill", "orange");
    toolButton("pen-tool-button", "Pen", "orange");
    toolButton("erase-tool-button", "Erase", "orange");
    // sliders
    createSlider("row-slider", "row-slider-label", "rows", "Rows", createDrawingArea);
    createSlider("column-slider", "column-slider-label", "columns", "Columns", createDrawingArea);
    createSlider("pen-radius-slider", "pen-radius-slider-label", "penRadius", "Radius", function () { });
    function createSlider(sliderID, sliderLabelID, controlledUserSetting, visibleSettingName, also) {
        var sliderWidth = 100;
        var sliderEl = el(sliderID);
        var sliderLabel = el(sliderLabelID);
        // @ts-expect-error TODO: Why does it think it doesn't exist even though I used a "!"?
        sliderEl.value = userSettings[controlledUserSetting];
        sliderEl.style.width = sliderWidth + "px";
        function updateSlider() {
            // @ts-expect-error TODO: Why does it think it doesn't exist even though I used a "!"?
            var val = sliderEl.value;
            sliderLabel.innerText = visibleSettingName + ": " + val;
            userSettings[controlledUserSetting] = val;
        }
        updateSlider();
        also();
        sliderEl.onchange = function (e) { updateSlider(); also(); };
    }
}
/**
 * Creates the scene for the project using the already-established HTML div.
*/
function createScene() {
    var scene = new Scene(el("pencilCanvas"), { fill: userSettings.gridLineColor });
    return scene;
}
var userSettings = loadSettings();
var mouseIsDown;
var cells = [];
var scene = createScene();
createToolbarEventListeners();
window.addEventListener("mousedown", function () { mouseIsDown = true; });
window.addEventListener("mouseup", function () { mouseIsDown = false; });
scene.startLoop();
//# sourceMappingURL=index.js.map