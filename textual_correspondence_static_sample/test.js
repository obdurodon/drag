/*
 * Synopsis: Drag and drop support for plectograms
 * Developer: David J. Birnbaum, djbpitt@gmail.com http://www.obdurodon.org
 * Project: http://repertorium.obdurodon.org
 * Date: First version 2014-05-30
 *
 */
// drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
// see also http://www.codedread.com/dragtest2.svg
function startMove(evt) {
    //global variable, used by moveIt()
    mouseStartX = evt.clientX;
    /*
     * svg has no concept of z height, so replace with clone at end of element sequence to avoid
     *   losing focus by becoming hidden by later elements
     * global, so that it can be tracked even when the mouse races ahead
     */
    newG = this.parentNode.cloneNode(true);
    newG.oldX = parseInt(newG.getAttribute('transform').slice(10, -1));
    //target is <image> child of column, so need to move up two generations
    this.parentNode.parentNode.appendChild(newG);
    this.parentNode.parentNode.removeChild(this.parentNode);
    //objectX is global, records starting position of drag
    objectX = parseInt(newG.getAttribute('transform').slice(10, -1));
    newG.getElementsByTagName('image')[0].addEventListener('mousedown', startMove, false);
    window.addEventListener('mousemove', moveIt, false);
    window.addEventListener('mouseup', endMove, false);
    var lines = document.getElementsByTagName('line');
    for (var i = 0; i < lines.length; i++) {
        lines[i].style.stroke = 'lightgray';
    }
    var columns = document.getElementsByClassName('draggable');
    for (var i = 0; i < columns.length; i++) {
        if (columns[i] !== newG) {
            columns[i].style.opacity = '.5';
        }
    }
}
function endMove(evt) {
    evt.preventDefault();
    //console.log('ending');
    window.removeEventListener('mousemove', moveIt, false);
    window.removeEventListener('mouseup', endMove, false);
    var landingPos = parseInt(newG.getAttribute('transform').slice(10, -1));
    var columns = document.getElementsByClassName('draggable');
    var allNewColumnPositions =[];
    for (var i = 0; i < columns.length; i++) {
        allNewColumnPositions.push(parseInt(columns[i].getAttribute('transform').slice(10, -1)));
    }
    // numerical array sorting at http://www.w3schools.com/jsref/jsref_sort.asp
    for (var i = 0; i < allColumnPositions.length; i++) {
        if (allNewColumnPositions.indexOf(allColumnPositions[i]) == -1) {
            newG.setAttribute('transform', 'translate(' + allColumnPositions[i] + ')')
        }
    }
    eraseLines();
    drawLines();
    var lines = document.getElementsByTagName('line');
    for (var i = 0; i < lines.length; i++) {
        lines[i].style.stroke = 'black';
    }
    for (var i = 0; i < columns.length; i++) {
        columns[i].style.opacity = '1';
    }
    newG = null;
}
function moveIt(evt) {
    var oldObjectX = newG.getAttribute('transform').slice(10, -1);
    var newObjectX = parseInt(oldObjectX) + evt.clientX - mouseStartX;
    newG.setAttribute('transform', 'translate(' + newObjectX + ')');
    stretchLines();
    // global variable, initialized in startMove()
    mouseStartX = evt.clientX;
    if (newObjectX < objectX - spacing && newObjectX != '0') {
        swapColumns('left', evt.clientX);
    } else if (newObjectX > objectX + spacing && objectX != farRight) {
        swapColumns('right', evt.clientX);
    }
}
function swapColumns(side, mousePos) {
    eraseLines();
    /**
     * get properties of newG for drawing column and lines, and build object for lines
     */
    var columns = document.getElementsByClassName('draggable');
    var newObjectX = parseInt(newG.getAttribute('transform').slice(10, -1));
    var columnHeight = newG.getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('height');
    var columnMidHeight = columnHeight / 2;
    var columnWidth = newG.getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('width');
    var linesG = document.getElementById('lines');
    var newGItems = newG.getElementsByTagName('g');
    var newGObject = new Object();
    var columnCells = newG.getElementsByTagName('g');
    for (var l = 0; l < columnCells.length; l++) {
        var cellText = columnCells[l].getElementsByTagName('text')[0].textContent;
        var cellYPos = columnCells[l].getElementsByTagName('rect')[0].getAttribute('y');
        newGObject[cellText] = cellYPos;
    }
    /**/
    if (side == 'left') {
        // Swap newG with its old left neighbor
        newG.oldX = newG.oldX - spacing;
        //console.log('shifted newG left; newG.oldX = ' + newG.oldX);
        for (var i = 0;
        i < columns.length;
        i++) {
            var neighborPos = parseInt(columns[i].getAttribute('transform').slice(10, -1));
            if (neighborPos == objectX - spacing) {
                columns[i].setAttribute('transform', 'translate(' + objectX + ')');
                objectX = objectX - spacing;
                break;
            }
        }
        /**
         * Find right neighbor, position, and object with contents
         */
        var rightNeighbor = columns[i];
        var rightNeighborX = rightNeighbor.getAttribute('transform').slice(10, -1);
        var rightNeighborItems = rightNeighbor.getElementsByTagName('g');
        var rightNeighborObject = new Object();
        var columnCells = rightNeighbor.getElementsByTagName('g');
        for (var j = 0; j < columnCells.length; j++) {
            var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
            var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
            rightNeighborObject[cellText] = cellYPos;
        }
        /**
         * Use the right neighbor position to find the left
         * var columns holds all draggable objects, which won't have changed, but their order changes
         */
        var leftNeighborX = rightNeighborX - (2 * spacing);
        if (leftNeighborX == 0) {
            var leftNeighbor = null;
        } else { for (var i = 0; i < columns.length; i++) {
                temp = columns[i].getAttribute('transform').slice(10, -1);
                if (temp == leftNeighborX) {
                    var leftNeighbor = columns[i];
                    var leftNeighborObject = new Object();
                    var columnCells = leftNeighbor.getElementsByTagName('g');
                    for (var j = 0; j < columnCells.length; j++) {
                        var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
                        var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
                        leftNeighborObject[cellText] = cellYPos;
                    }
                }
            }
        }
        //console.log('leftNeighbor = ' + leftNeighbor + ' at ' + leftNeighborX);
        //console.log('rightNeighbor = ' + rightNeighbor + ' at ' + rightNeighborX);
        //console.log('newG.oldX = ' + newG.oldX);
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (var key in newGObject) {
                if (leftNeighborObject.hasOwnProperty(key)) {
                    var x2 = (parseInt(leftNeighborX) + parseInt(columnWidth));
                    var y2 = (parseInt(leftNeighborObject[key]) + columnMidHeight);
                    var x1 = (newObjectX);
                    var y1 = (parseInt(newGObject[key]) + columnMidHeight);
                    newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    newLine.setAttribute('x1', x1);
                    newLine.setAttribute('y1', y1);
                    newLine.setAttribute('x2', x2);
                    newLine.setAttribute('y2', y2);
                    newLine.setAttribute('stroke', 'darkgray');
                    newLine.setAttribute('stroke-width', 2);
                    linesG.appendChild(newLine);
                    //console.log('leftNeighbor: x1 = ' + x1 + '; x2 = ' + x2 + ' y1 = ' + y1 + ' y2 = ' + y2);
                }
            }
        }
        /**
         * If there is a rightNeighbor, draw lines
         */
        if (rightNeighbor) {
            for (var key in newGObject) {
                if (rightNeighborObject.hasOwnProperty(key)) {
                    //console.log('hit: rightNeighborObject[key] = ' + rightNeighborObject[key] + ' and newGObject[key] = ' + newGObject[key]);
                    var x1 = rightNeighborX;
                    var y1 = (parseInt(rightNeighborObject[key]) + columnMidHeight);
                    var x2 = (newObjectX - columnWidth);
                    var y2 = (parseInt(newGObject[key]) + columnMidHeight);
                    newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    newLine.setAttribute('x1', x1);
                    newLine.setAttribute('y1', y1);
                    newLine.setAttribute('x2', x2);
                    newLine.setAttribute('y2', y2);
                    newLine.setAttribute('stroke', 'darkgray');
                    newLine.setAttribute('stroke-width', 2);
                    linesG.appendChild(newLine);
                    //console.log('x1 = ' + x1 + '; x2 = ' + x2 + ' y1 = ' + y1 + ' y2 = ' + y2);
                }
            }
        }
    } else if (side == 'right') {
        // Swap newG with its old right neighbor
        newG.oldX = newG.oldX + spacing;
        // console.log('shifted newG right; newG.oldX = ' + newG.oldX);
        for (var i = 0;
        i < columns.length;
        i++) {
            var neighborPos = parseInt(columns[i].getAttribute('transform').slice(10, -1));
            if (neighborPos == objectX + spacing) {
                columns[i].setAttribute('transform', 'translate(' + objectX + ')');
                objectX = objectX + spacing;
                break;
            }
        }
        /**
         * Find left neighbor, position, and object with contents
         */
        var leftNeighbor = columns[i];
        var leftNeighborX = leftNeighbor.getAttribute('transform').slice(10, -1);
        var leftNeighborItems = leftNeighbor.getElementsByTagName('g');
        var leftNeighborObject = new Object();
        var columnCells = leftNeighbor.getElementsByTagName('g');
        for (var j = 0; j < columnCells.length; j++) {
            var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
            var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
            leftNeighborObject[cellText] = cellYPos;
        }
        //console.log('leftNeighbor = ' + leftNeighbor + ' at position ' + leftNeighborX);
        /**
         * Use the left neighbor position to find the right
         * var columns holds all draggable objects, which won't have changed, but their order changes
         */
        var rightNeighborX = parseInt(leftNeighborX) + (2 * spacing);
        if (rightNeighborX > farRight) {
            var rightNeighbor = null;
        } else { for (var i = 0; i < columns.length; i++) {
                temp = columns[i].getAttribute('transform').slice(10, -1);
                if (temp == rightNeighborX) {
                    var rightNeighbor = columns[i];
                    var rightNeighborObject = new Object();
                    var columnCells = rightNeighbor.getElementsByTagName('g');
                    for (var j = 0; j < columnCells.length; j++) {
                        var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
                        var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
                        rightNeighborObject[cellText] = cellYPos;
                    }
                }
            }
        }
        // console.log('leftNeighbor = ' + leftNeighbor + ' at ' + leftNeighborX + ' rightNeighbor = ' + rightNeighbor + ' at ' + rightNeighborX);
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (var key in newGObject) {
                if (leftNeighborObject.hasOwnProperty(key)) {
                    var x2 = (parseInt(leftNeighborX) + parseInt(columnWidth));
                    var y2 = (parseInt(leftNeighborObject[key]) + columnMidHeight);
                    var x1 = (newObjectX);
                    var y1 = (parseInt(newGObject[key]) + columnMidHeight);
                    newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    newLine.setAttribute('x1', x1);
                    newLine.setAttribute('y1', y1);
                    newLine.setAttribute('x2', x2);
                    newLine.setAttribute('y2', y2);
                    newLine.setAttribute('stroke', 'darkgray');
                    newLine.setAttribute('stroke-width', 2);
                    linesG.appendChild(newLine);
                    //console.log('leftNeighbor: x1 = ' + x1 + '; x2 = ' + x2 + ' y1 = ' + y1 + ' y2 = ' + y2);
                }
            }
        }
        if (rightNeighbor) {
            for (var key in newGObject) {
                if (rightNeighborObject.hasOwnProperty(key)) {
                    //console.log('hit: rightNeighborObject[key] = ' + rightNeighborObject[key] + ' and newGObject[key] = ' + newGObject[key]);
                    var x1 = rightNeighborX;
                    var y1 = (parseInt(rightNeighborObject[key]) + columnMidHeight);
                    var x2 = (newObjectX - columnWidth);
                    var y2 = (parseInt(newGObject[key]) + columnMidHeight);
                    newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    newLine.setAttribute('x1', x1);
                    newLine.setAttribute('y1', y1);
                    newLine.setAttribute('x2', x2);
                    newLine.setAttribute('y2', y2);
                    newLine.setAttribute('stroke', 'darkgray');
                    newLine.setAttribute('stroke-width', 2);
                    console.log('linesG: ' + linesG);
                    linesG.appendChild(newLine);
                    //console.log('x1 = ' + x1 + '; x2 = ' + x2 + ' y1 = ' + y1 + ' y2 = ' + y2);
                }
            }
        }
    }
    drawLines();
    // drawLines() only draws lines for non-moving colums, so do lines for newG separately (above)
}
function drawLines() {
    //columnsObject[columnXPos][title] returns cellYpos
    //SVG text objects have a .textContent property, but no .innerHTML
    var columns = document.getElementsByClassName('draggable');
    var columnHeight = columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('height');
    var columnMidHeight = columnHeight / 2;
    var columnWidth = columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('width');
    var columnsObject = new Object();
    for (var i = 0; i < columns.length; i++) {
        var columnXPos = columns[i].getAttribute('transform').slice(10, -1);
        columnsObject[columnXPos] = new Object();
        var columnCells = columns[i].getElementsByTagName('g');
        for (var j = 0; j < columnCells.length; j++) {
            var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
            var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
            columnsObject[columnXPos][cellText] = cellYPos;
        }
    }
    //draw lines right to left starting with second column (from i to i-1)
    //objects don't have length, but length of myObj is Object.keys(myObj).length
    var linesG = document.getElementById('lines');
    for (var i = 1; i < allColumnPositions.length; i++) {
        var currentCol = columnsObject[allColumnPositions[i]];
        var precedingCol = columnsObject[allColumnPositions[i - 1]];
        for (var key in currentCol) {
            if (undefined != precedingCol && precedingCol.hasOwnProperty(key)) {
                var x1 = allColumnPositions[i];
                var y1 = parseInt(currentCol[key]) + parseInt(columnMidHeight);
                var x2 = parseInt(allColumnPositions[i - 1]) + parseInt(columnWidth);
                var y2 = parseInt(precedingCol[key]) + parseInt(columnMidHeight);
                newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                newLine.setAttribute('x1', x1);
                newLine.setAttribute('y1', y1);
                newLine.setAttribute('x2', x2);
                newLine.setAttribute('y2', y2);
                newLine.setAttribute('stroke', 'darkgray');
                newLine.setAttribute('stroke-width', 2);
                linesG.appendChild(newLine);
            }
        }
    }
}
function stretchLines() {
    var wrapperTransform = document.getElementsByTagName('svg')[0].firstElementChild.getAttribute('transform').slice(10, -1);
    var columns = document.getElementsByClassName('draggable');
    var columnWidth = parseInt(columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('width'));
    var lines = document.getElementsByTagName('line');
    var newGX = parseInt(newG.getAttribute('transform').slice(10, -1));
    var lines = document.getElementsByTagName('line');
    for (var i = 0; i < lines.length; i++) {
        var x1 = lines[i].getAttribute('x1');
        var x2 = lines[i].getAttribute('x2');
        if (x1 == newG.oldX + spacing) {
            // attached on the right
            // console.log('right: ' + newG.oldX);
            lines[i].setAttribute('x2', newGX + columnWidth);
        } else if (x2 == (newG.oldX - spacing + columnWidth)) {
            // attached on the left
            // console.log('left:' + newG.oldX);
            lines[i].setAttribute('x1', newGX);
        }
    }
}
function eraseLines() {
    // someday this will be easier: http://red-team-design.com/removing-an-element-with-plain-javascript-remove-method/
    // must work backwards: http://stackoverflow.com/questions/1457544/javascript-loop-only-applying-to-every-other-element
    var lines = document.getElementsByTagName('line');
    for (var i = lines.length - 1;
    i >= 0;
    i--) {
        lines[i].parentNode.removeChild(lines[i]);
    }
}
function plectogram_init() {
    //http://stackoverflow.com/questions/1187518/javascript-array-difference
    // [1,2,3,4,5,6].diff( [3,4,5] );
    // returns: [1, 2, 6]
    Array.prototype.diff = function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) < 0;
        });
    };
    var images = document.getElementsByTagName('image');
    for (var i = 0;
    i < images.length;
    i++) {
        images[i].addEventListener('mousedown', startMove, false);
    }
    //Intercolumn distance (global variable "spacing") used to determine when columns have crossed
    //allColumnPositions is used find vacant column to position target at mouseup
    var columns = document.getElementsByClassName('draggable');
    spacing = parseInt(columns[1].getAttribute('transform').slice(10, -1)) - parseInt(columns[0].getAttribute('transform').slice(10, -1));
    allColumnPositions =[];
    for (var i = 0;
    i < columns.length;
    i++) {
        allColumnPositions.push((i + 1) * spacing);
    }
    farRight = spacing * parseInt(document.getElementsByClassName('draggable').length);
}
window.addEventListener('load', plectogram_init, false);