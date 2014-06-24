"use strict";
/*
 * Synopsis: Drag and drop support for plectograms
 * Developer: David J. Birnbaum, djbpitt@gmail.com http://www.obdurodon.org
 * Project: http://repertorium.obdurodon.org
 * Date: First version 2014-05-30
 * Last revised: 2014-06-22
 *
 * To do:
 * js:
 *   Wrap initialization in self-executing anonymous function (SEAF) to
 *     bypass addressing the window 'load' event explicitly:
 *     http://code.tutsplus.com/tutorials/key-principles-of-maintainable-javascript--net-25536
 * xhtml/svg:
 *   Adjust hierarchy of XQuery output to match mockup markup
 *
 * drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
 * see also http://www.codedread.com/dragtest2.svg
 */
window.addEventListener('load', plectogram_init, false);
var djb = function () {
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
            // also adds .getXPos() and .setXPos() methods to <g> object
            g.contents = {};
            var columnCells = g.getElementsByTagName('g');
            for (var i = 0; i < columnCells.length; i++) {
                var cellText = columnCells[i].getElementsByTagName('text')[0].textContent;
                var cellYPos = columnCells[i].getElementsByTagName('rect')[0].getAttribute('y');
                g.contents[cellText] = cellYPos;
            }
            g.getXPos = function () {
                return parseInt(this.getAttribute('transform').slice(10, -1));
            };
            g.setXPos = function (X) {
                this.setAttribute('transform', 'translate(' + X + ')');
            };
        },
        createNewG: function (image) {
            djb.newG = image.parentNode.cloneNode(true);
            djb.buildDict(djb.newG);
            djb.newG.oldX = djb.newG.getXPos();
            image.parentNode.parentNode.appendChild(djb.newG);
            image.parentNode.parentNode.removeChild(image.parentNode);
        },
        drawLines: function () {
            var columns, key, x1, y1, x2, y2, linesG, newLine, i;
            columns = djb.htmlToArray(document.getElementsByClassName('draggable'));
            columns.sort(function (a, b) {
                var result = a.getXPos() - b.getXPos();
                return (result);
            }); // numerical sort by Xpos of column
            linesG = document.getElementById('lines');
            for (i = 1; i < djb.columnCount; i++) {
                for (key in columns[i].contents) {
                    if (columns[i].contents.hasOwnProperty(key)) {
                        if (columns[i - 1].contents.hasOwnProperty(key)) {
                            x1 = columns[i].getXPos();
                            y1 = parseInt(columns[i].contents[key]) + djb.columnMidHeight;
                            x2 = columns[i - 1].getXPos() + djb.columnWidth;
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
            djb.newG.oldX = djb.newG.getXPos();
        },
        endMove: function (evt) {
            evt.preventDefault();
            var i;
            window.removeEventListener('mousemove', djb.moveIt, false);
            window.removeEventListener('mouseup', djb.endMove, false);
            var columns = document.getElementsByClassName('draggable');
            var allNewColumnPositions = [];
            for (i = 0; i < djb.columnCount; i++) {
                allNewColumnPositions.push(columns[i].getXPos());
            }
            // numerical array sorting at http://www.w3schools.com/jsref/jsref_sort.asp
            for (i = 0; i < djb.columnCount; i++) {
                if (allNewColumnPositions.indexOf(djb.initialColumnPositions[i]) == -1) {
                    djb.newG.setXPos(djb.initialColumnPositions[i]);
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
        htmlToArray: function (htmlCollection) {
            return Array.prototype.slice.call(htmlCollection);
        },
        moveIt: function (evt) {
            var oldObjectX = djb.newG.getXPos();
            var newObjectX = oldObjectX + evt.clientX - djb.mouseStartX;
            djb.newG.setXPos(newObjectX);
            djb.stretchLines();
            djb.mouseStartX = evt.clientX;
            if (newObjectX < djb.objectX - djb.spacing && newObjectX > '0') {
                djb.swapColumns('left');
            } else if (newObjectX > djb.objectX + djb.spacing && djb.objectX < djb.farRight) {
                djb.swapColumns('right');
            }
        },
        setXPos: function (g, Xpos) {
            g.setAttribute('transform', 'translate(' + Xpos + ')');
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
            djb.objectX = djb.newG.getXPos();
            djb.assignEventListeners(djb.newG);
            djb.adjustLinesAndColumns('fade');
        },
        stretchLines: function () {
            var newGX = djb.newG.getXPos();
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
            var columns, neighbor;
            columns = djb.htmlToArray(document.getElementsByClassName('draggable'));
            columns.sort(function (a, b) {
                var result = a.getXPos() - b.getXPos();
                return result;
            }); // numerical sort by Xpos of column
            neighbor = columns[djb.objectX / djb.spacing - 1];
            if (side == 'left') {
                djb.objectX = djb.objectX - djb.spacing;
                neighbor.setXPos(neighbor.getXPos() + djb.spacing);
            } else {
                djb.objectX = djb.objectX + djb.spacing;
                neighbor.setXPos(neighbor.getXPos() - djb.spacing);
            }
            djb.eraseLines();
            djb.drawLines();
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
        djb.initialColumnPositions.push(djb.columns[i].getXPos());
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
