"use strict";
/*
 * Synopsis: Drag and drop support for plectograms
 * Developer: David J. Birnbaum, djbpitt@gmail.com http://www.obdurodon.org
 * Project: http://repertorium.obdurodon.org
 * Date: First version 2014-05-30
 * Last revised: 2014-06-22
 *
 * To do:
 * Wrap initialization in self-executing anonymous function (SEAF) to
 *   bypass addressing the window 'load' event explicitly:
 *   http://code.tutsplus.com/tutorials/key-principles-of-maintainable-javascript--net-25536
 *
 * drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
 * see also http://www.codedread.com/dragtest2.svg
 */
window.addEventListener('load', plectogram_init, false);
var djb = djb || function () {
    return {
        adjustLinesAndColumns: function (how) {
            // only values should be 'fade' and 'restore'
            var lines = document.getElementsByTagName('line');
            var lineColor = how == 'fade' ? 'lightgray' : 'black';
            var columnOpacity = how == 'fade' ? .5 : 1;
            for (var i = 0; i < lines.length; i++) {
                lines[i].style.stroke = lineColor;
            }
            var columns = document.getElementsByClassName('draggable');
            for (i = 0; i < djb.columnCount; i++) {
                if (columns[i] !== djb.newG) {
                    columns[i].style.opacity = columnOpacity;
                }
            }
        },
        assignEventListeners: function (g) {
            // other listeners are on window, so that they can be trapped when the mouse races ahead
            g.getElementsByTagName('image')[0].addEventListener('mousedown', djb.startMove, false);
            window.addEventListener('mousemove', djb.moveIt, false);
            window.addEventListener('mouseup', djb.endMove, false);
        },
        buildDict: function (g) {
            // attach a dictionary to each <g> with text as key and vertical position as value
            g.contents = {};
            var columnCells = g.getElementsByTagName('g');
            for (var i = 0; i < columnCells.length; i++) {
                var cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
                var cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
                g.contents[cellText] = cellYPos;
            }
        },
        createNewG: function (image) {
            djb.newG = image.parentNode.cloneNode(true);
            djb.newG.oldX = djb.getXpos(djb.newG);
            djb.buildDict(djb.newG);
            image.parentNode.parentNode.appendChild(djb.newG);
            image.parentNode.parentNode.removeChild(image.parentNode);
        },
        drawLines: function () {
            var columns, key, x1, y1, x2, y2, linesG, newLine, i;
            columns = djb.htmlToArray(document.getElementsByClassName('draggable'));
            columns.sort(function (a, b) {
                return djb.getXpos(a) - djb.getXpos(b)
            }); // sort by Xpos of column
            linesG = document.getElementById('lines');
            for (i = 1; i < djb.columnCount; i++) {
                for (key in columns[i].contents) {
                    if (columns[i].contents.hasOwnProperty(key)) {
                        if (columns[i - 1].contents.hasOwnProperty(key)) {
                            x1 = djb.getXpos(columns[i]);
                            y1 = parseInt(columns[i].contents[key]) + djb.columnMidHeight;
                            x2 = djb.getXpos(columns[i - 1]) + djb.columnWidth;
                            y2 = parseInt(columns[i - 1].contents[key]) + djb.columnMidHeight;
                            newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            newLine.setAttribute('x1', x1);
                            newLine.setAttribute('y1', y1);
                            newLine.setAttribute('x2', x2);
                            newLine.setAttribute('y2', y2);
                            newLine.setAttribute('stroke', 'darkgray');
                            newLine.setAttribute('stroke-width', '2');
                            linesG.appendChild(newLine);
                        }
                    }
                }
            }
        },
        endMove: function (evt) {
            evt.preventDefault();
            var i;
            window.removeEventListener('mousemove', djb.moveIt, false);
            window.removeEventListener('mouseup', djb.endMove, false);
            var columns = document.getElementsByClassName('draggable');
            var allNewColumnPositions = [];
            for (i = 0; i < djb.columnCount; i++) {
                allNewColumnPositions.push(djb.getXpos(columns[i]));
            }
            // numerical array sorting at http://www.w3schools.com/jsref/jsref_sort.asp
            for (i = 0; i < djb.columnCount; i++) {
                if (allNewColumnPositions.indexOf(djb.initialColumnPositions[i]) == -1) {
                    djb.newG.setAttribute('transform', 'translate(' + djb.initialColumnPositions[i] + ')')
                }
            }
            djb.eraseLines();
            djb.drawLines();
            djb.adjustLinesAndColumns('restore');
            djb.newG = null;
        },
        eraseLines: function () {
            // someday this will be easier: http://red-team-design.com/removing-an-element-with-plain-javascript-remove-method/
            // must work backwards: http://stackoverflow.com/questions/1457544/javascript-loop-only-applying-to-every-other-element
            var lines = document.getElementsByTagName('line');
            for (var i = lines.length - 1; i >= 0; i--) {
                lines[i].parentNode.removeChild(lines[i]);
            }
        },
        getXpos: function (g) {
            return parseInt(g.getAttribute('transform').slice(10, -1));
        },
        htmlToArray: function (htmlCollection) {
            return Array.prototype.slice.call(htmlCollection);
        },
        moveIt: function (evt) {
            var oldObjectX = djb.getXpos(djb.newG);
            var newObjectX = oldObjectX + evt.clientX - djb.mouseStartX;
            djb.newG.setAttribute('transform', 'translate(' + newObjectX + ')');
            djb.stretchLines();
            djb.mouseStartX = evt.clientX;
            if (newObjectX < djb.objectX - djb.spacing && newObjectX > '0') {
                swapColumns('left');
            } else if (newObjectX > djb.objectX + djb.spacing && djb.objectX < djb.farRight) {
                swapColumns('right');
            }
        },
        startMove: function (evt) {
            // global variable, used by djb.moveIt()
            djb.mouseStartX = evt.clientX;
            /*
             * clone clicked <g> into djb.newG and attach event listeners
             * svg has no concept of z height, so replace with clone at end of element sequence to avoid
             *   losing focus by becoming hidden by later elements
             */
            djb.createNewG(this); //image element that was clicked is the hook
            // djb.objectX is global, records starting position of drag
            djb.objectX = djb.getXpos(djb.newG);
            djb.assignEventListeners(djb.newG);
            djb.adjustLinesAndColumns('fade');
        },
        stretchLines: function () {
            var newGX = djb.getXpos(djb.newG);
            var lines = document.getElementsByTagName('line');
            for (var i = 0; i < lines.length; i++) {
                var x1 = lines[i].getAttribute('x1');
                var x2 = lines[i].getAttribute('x2');
                if (x1 == djb.newG.oldX + djb.spacing) {
                    lines[i].setAttribute('x2', newGX + djb.columnWidth);
                } else if (x2 == (djb.newG.oldX - djb.spacing + djb.columnWidth)) {
                    lines[i].setAttribute('x1', newGX);
                }
            }
        },
        swapColumns: function (side) {
            djb.eraseLines();
            /**
             * Erase all lines
             * Redraw all lines except for djb.newG column
             * Redraw lines for djb.newG
             *
             * To do: Combine redraw to take care of old and new columns
             * */
            var columns = document.getElementsByTagName('draggable');
        },
        columnsHTML: document.getElementsByClassName('draggable'),
        dummy: null
    }
}();
function plectogram_init() {
    var images, i;
    djb.columns = djb.htmlToArray(djb.columnsHTML);
    for (i = 0; i < djb.columns.length; i++) {
        djb.buildDict(djb.columns[i]);
    }
    djb.columnCount = djb.columns.length;
    djb.columnHeight = parseInt(djb.columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('height'));
    djb.columnMidHeight = djb.columnHeight / 2;
    djb.columnWidth = parseInt(djb.columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('width'));
    djb.initialColumnPositions = [];
    for (i = 0; i < djb.columns.length; i++) {
        djb.initialColumnPositions.push(djb.getXpos(djb.columns[i]));
    }
    djb.spacing = djb.initialColumnPositions[1] - djb.initialColumnPositions[0];
    djb.farRight = djb.initialColumnPositions[djb.initialColumnPositions.length - 1];
    djb.newG = null;
    djb.mouseStartX = null;
    images = document.getElementsByTagName('image');
    for (i = 0; i < images.length; i++) {
        images[i].addEventListener('mousedown', djb.startMove, false);
    }
}
function swapColumns(side) {
    var columns, columnCells, neighborPos, cellYPos, cellText, key, linesG, temp,
        leftNeighbor, leftNeighborObject, leftNeighborX,
        rightNeighbor, rightNeighborObject, rightNeighborX,
        newGObject, newObjectX, i,
        newLine, x1, x2, y1, y2;
    djb.eraseLines();
    /**
     * get properties of djb.newG for drawing column and lines, and build object for lines
     */
    columns = document.getElementsByClassName('draggable');
    newObjectX = djb.getXpos(djb.newG);
    linesG = document.getElementById('lines');
    newGObject = {};
    columnCells = djb.newG.getElementsByTagName('g');
    for (i = 0; i < columnCells.length; i++) {
        cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
        cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
        newGObject[cellText] = cellYPos;
    }
    if (side == 'left') {
        // Swap djb.newG with its old left neighbor
        djb.newG.oldX = djb.newG.oldX - djb.spacing;
        for (i = 0; i < djb.columnCount; i++) {
            neighborPos = djb.getXpos(columns[i]);
            if (neighborPos == djb.objectX - djb.spacing) {
                columns[i].setAttribute('transform', 'translate(' + djb.objectX + ')');
                djb.objectX = djb.objectX - djb.spacing;
                break;
            }
        }
        /**
         * Find right neighbor, position, and object with contents
         */
        rightNeighbor = columns[i];
        rightNeighborX = djb.getXpos(rightNeighbor);
        rightNeighborObject = {};
        columnCells = rightNeighbor.getElementsByTagName('g');
        for (i = 0; i < columnCells.length; i++) {
            cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
            cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
            rightNeighborObject[cellText] = cellYPos;
        }
        /**
         * Use the right neighbor position to find the left
         * var columns holds all draggable objects, which won't have changed, but their order changes
         */
        leftNeighborX = rightNeighborX - (2 * djb.spacing);
        if (leftNeighborX == 0) {
            leftNeighbor = null;
        } else {
            for (i = 0; i < djb.columnCount; i++) {
                temp = djb.getXpos(columns[i]);
                if (temp == leftNeighborX) {
                    leftNeighbor = columns[i];
                    leftNeighborObject = {};
                    columnCells = leftNeighbor.getElementsByTagName('g');
                    for (i = 0; i < columnCells.length; i++) {
                        cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
                        cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
                        leftNeighborObject[cellText] = cellYPos;
                    }
                }
            }
        }
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (key in newGObject) {
                if (newGObject.hasOwnProperty(key)) {
                    if (leftNeighborObject.hasOwnProperty(key)) {
                        x2 = (parseInt(leftNeighborX) + djb.columnWidth);
                        y2 = (parseInt(leftNeighborObject[key]) + djb.columnMidHeight);
                        x1 = (newObjectX);
                        y1 = (parseInt(newGObject[key]) + djb.columnMidHeight);
                        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        newLine.setAttribute('x1', x1);
                        newLine.setAttribute('y1', y1);
                        newLine.setAttribute('x2', x2);
                        newLine.setAttribute('y2', y2);
                        newLine.setAttribute('stroke', 'darkgray');
                        newLine.setAttribute('stroke-width', '2');
                        linesG.appendChild(newLine);
                    }
                }
            }
        }
        /**
         * If there is a rightNeighbor, draw lines
         */
        if (rightNeighbor) {
            for (key in newGObject) {
                if (newGObject.hasOwnProperty(key)) {
                    if (rightNeighborObject.hasOwnProperty(key)) {
                        x1 = rightNeighborX;
                        y1 = (parseInt(rightNeighborObject[key]) + djb.columnMidHeight);
                        x2 = (newObjectX - djb.columnWidth);
                        y2 = (parseInt(newGObject[key]) + djb.columnMidHeight);
                        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        newLine.setAttribute('x1', x1.toString());
                        newLine.setAttribute('y1', y1.toString());
                        newLine.setAttribute('x2', x2.toString());
                        newLine.setAttribute('y2', y2.toString());
                        newLine.setAttribute('stroke', 'darkgray');
                        newLine.setAttribute('stroke-width', '2');
                        linesG.appendChild(newLine);
                    }
                }
            }
        }
    }
    else if (side == 'right') {
        // Swap newG with its old right neighbor
        djb.newG.oldX = djb.newG.oldX + djb.spacing;
        for (i = 0; i < djb.columnCount; i++) {
            neighborPos = djb.getXpos(columns[i]);
            if (neighborPos == djb.objectX + djb.spacing) {
                columns[i].setAttribute('transform', 'translate(' + djb.objectX + ')');
                djb.objectX = djb.objectX + djb.spacing;
                break;
            }
        }
        /**
         * Find left neighbor, position, and object with contents
         */
        leftNeighbor = columns[i];
        leftNeighborX = djb.getXpos(leftNeighbor);
        leftNeighborObject = {};
        columnCells = leftNeighbor.getElementsByTagName('g');
        for (i = 0; i < columnCells.length; i++) {
            cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
            cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
            leftNeighborObject[cellText] = cellYPos;
        }
        /**
         * Use the left neighbor position to find the right
         * var columns holds all draggable objects, which won't have changed, but their order changes
         */
        rightNeighborX = parseInt(leftNeighborX) + (2 * djb.spacing);
        if (rightNeighborX > djb.farRight) {
            rightNeighbor = null;
        } else {
            for (i = 0; i < djb.columnCount; i++) {
                temp = djb.getXpos(columns[i]);
                if (temp == rightNeighborX) {
                    rightNeighbor = columns[i];
                    rightNeighborObject = {};
                    columnCells = rightNeighbor.getElementsByTagName('g');
                    for (var j = 0; j < columnCells.length; j++) {
                        cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
                        cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
                        rightNeighborObject[cellText] = cellYPos;
                    }
                }
            }
        }
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (key in newGObject) {
                if (newGObject.hasOwnProperty(key)) {
                    if (leftNeighborObject.hasOwnProperty(key)) {
                        x2 = (parseInt(leftNeighborX) + djb.columnWidth);
                        y2 = (parseInt(leftNeighborObject[key]) + djb.columnMidHeight);
                        x1 = (newObjectX);
                        y1 = (parseInt(newGObject[key]) + djb.columnMidHeight);
                        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        newLine.setAttribute('x1', x1);
                        newLine.setAttribute('y1', y1);
                        newLine.setAttribute('x2', x2);
                        newLine.setAttribute('y2', y2);
                        newLine.setAttribute('stroke', 'darkgray');
                        newLine.setAttribute('stroke-width', '2');
                        linesG.appendChild(newLine);
                    }
                }
            }
        }
        if (rightNeighbor) {
            for (key in newGObject) {
                if (newGObject.hasOwnProperty(key)) {
                    if (rightNeighborObject.hasOwnProperty(key)) {
                        x1 = rightNeighborX.toString();
                        y1 = (parseInt(rightNeighborObject[key]) + djb.columnMidHeight).toString();
                        x2 = (newObjectX - djb.columnWidth).toString();
                        y2 = (parseInt(newGObject[key]) + djb.columnMidHeight).toString();
                        newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        newLine.setAttribute('x1', x1);
                        newLine.setAttribute('y1', y1);
                        newLine.setAttribute('x2', x2);
                        newLine.setAttribute('y2', y2);
                        newLine.setAttribute('stroke', 'darkgray');
                        newLine.setAttribute('stroke-width', '2');
                        linesG.appendChild(newLine);
                    }
                }
            }
        }
    }
    djb.drawLines();
}
