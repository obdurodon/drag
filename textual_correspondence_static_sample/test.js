/*
 * Synopsis: Drag and drop support for plectograms
 * Developer: David J. Birnbaum, djbpitt@gmail.com http://www.obdurodon.org
 * Project: http://repertorium.obdurodon.org
 * Date: First version 2014-05-30
 * Last revised: 2014-06-18
 *
 * drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
 * see also http://www.codedread.com/dragtest2.svg
 */
window.addEventListener('load', plectogram_init, false);
/**
 * initialize globals in djb namespace object
 *
 * adjustLinesAndColumns(): turns lines and columns gray or black
 * assignEventListeners(): djb.newG responds to mousedown; window monitors mousemove and mouseup
 * buildDict(): column property, an object with text titles as keys and y positions as values
 * createNewG(): clones the <g> where the <image> was clicked to move it to a higher z position
 * getXPos(): retrieves X position of column from @transform "translate()" value
 * htmlToArray(): makes HTML collection easier to handle
 */
var djb = (function() {
    return {
        adjustLinesAndColumns: function(how) {
            // only values should be 'fade' and 'restore'
            var lines = document.getElementsByTagName('line');
            var lineColor = how == 'fade' ? 'lightgray' : 'black';
            var columnOpacity = how == 'fade' ? .5 : 1;
            for (var i = 0; i < lines.length; i++) {
                lines[i].style.stroke = lineColor;
            }
            var columns = document.getElementsByClassName('draggable');
            for (var i = 0; i < djb.columnCount; i++) {
                if (columns[i] !== djb.newG) {
                    columns[i].style.opacity = columnOpacity;
                }
            }   
        },
        assignEventListeners: function(g) {
            // other listeners are on window, so that they can be trapped when the mouse races ahead
            g.getElementsByTagName('image')[0].addEventListener('mousedown', startMove, false);
            window.addEventListener('mousemove', moveIt, false);
            window.addEventListener('mouseup', endMove, false);    
        },
        buildDict: function(g) {
            // attach a dictionary to each <g> with text as key and vertical position as value
            g.contents = new Object();
            var columnCells = g.getElementsByTagName('g');
            for (var l = 0; l < columnCells.length; l++) {
                var cellText = columnCells[l].getElementsByTagName('text')[0].textContent;
                var cellYPos = columnCells[l].getElementsByTagName('rect')[0].getAttribute('y');
                g.contents[cellText] = cellYPos;
            }
        },
        createNewG: function(image) {
            djb.newG = image.parentNode.cloneNode(true);
            djb.newG.oldX = djb.getXpos(djb.newG);
            djb.buildDict(djb.newG);
            image.parentNode.parentNode.appendChild(djb.newG);
            image.parentNode.parentNode.removeChild(image.parentNode);
        },
        getXpos: function(g){
            return parseInt(g.getAttribute('transform').slice(10,-1));
        },
        htmlToArray: function(htmlCollection) {
            return Array.prototype.slice.call( htmlCollection );
        },
        columnsHTML: document.getElementsByClassName('draggable'),
        dummy: null
    }
}());
function plectogram_init() {
    djb.columns = djb.htmlToArray(djb.columnsHTML);
    djb.columnCount = djb.columns.length;
    djb.columnHeight = parseInt(djb.columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('height'));
    djb.columnMidHeight = djb.columnHeight / 2;
    djb.columnWidth = parseInt(djb.columns[0].getElementsByTagName('g')[0].getElementsByTagName('rect')[0].getAttribute('width'));
    djb.initialColumnPositions = new Array ();
    for (var i = 0; i < djb.columns.length; i++) {
        djb.initialColumnPositions.push(djb.getXpos(djb.columns[i]));
    }
    djb.spacing = djb.initialColumnPositions[1] - djb.initialColumnPositions[0];
    djb.farRight = djb.initialColumnPositions[djb.initialColumnPositions.length - 1];
    djb.newG = null;
    djb.mouseStartX = null;
    //http://stackoverflow.com/questions/1187518/javascript-array-difference
    // [1,2,3,4,5,6].diff( [3,4,5] );
    // returns: [1, 2, 6]
    Array.prototype.diff = function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) < 0;
        });
    };
    var images = document.getElementsByTagName('image');
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('mousedown', startMove, false);
    }
}
/**
 * startMove() fires on mousedown
 * calls:
 *   createNewG()
 *   assignEventListeners()
 *   fadeLinesandColumns()
 */
function startMove(evt) {
    // global variable, used by moveIt()
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
}
function endMove(evt) {
    evt.preventDefault();
    window.removeEventListener('mousemove', moveIt, false);
    window.removeEventListener('mouseup', endMove, false);
    var columns = document.getElementsByClassName('draggable');
    var allNewColumnPositions =[];
    for (var i = 0; i < djb.columnCount; i++) {
        allNewColumnPositions.push(djb.getXpos(columns[i]));
    }
    // numerical array sorting at http://www.w3schools.com/jsref/jsref_sort.asp
    for (var i = 0; i < djb.columnCount; i++) {
        if (allNewColumnPositions.indexOf(djb.initialColumnPositions[i]) == -1) {
            djb.newG.setAttribute('transform', 'translate(' + djb.initialColumnPositions[i] + ')')
        }
    }
    eraseLines();
    drawLines();
    djb.adjustLinesAndColumns('restore');
    djb.newG = null;
}
function moveIt(evt) {
    var oldObjectX = djb.getXpos(djb.newG);
    var newObjectX = oldObjectX + evt.clientX - djb.mouseStartX;
    djb.newG.setAttribute('transform', 'translate(' + newObjectX + ')');
    stretchLines();
    djb.mouseStartX = evt.clientX;
    if (newObjectX < djb.objectX - djb.spacing && newObjectX != '0') {
        swapColumns('left', evt.clientX);
    } else if (newObjectX > djb.objectX + djb.spacing && djb.objectX != djb.farRight) {
        swapColumns('right', evt.clientX);
    }
}
function swapColumns(side, mousePos) {
    eraseLines();
    /**
     * get properties of djb.newG for drawing column and lines, and build object for lines
     */
    var columns = document.getElementsByClassName('draggable');
    var newObjectX = djb.getXpos(djb.newG);
    var linesG = document.getElementById('lines');
    var newGItems = djb.newG.getElementsByTagName('g');
    var newGObject = new Object();
    var columnCells = djb.newG.getElementsByTagName('g');
    for (var l = 0; l < columnCells.length; l++) {
        var cellText = columnCells[l].getElementsByTagName('text')[0].textContent;
        var cellYPos = columnCells[l].getElementsByTagName('rect')[0].getAttribute('y');
        newGObject[cellText] = cellYPos;
    }
    /**/
    if (side == 'left') {
        // Swap djb.newG with its old left neighbor
        djb.newG.oldX = djb.newG.oldX - djb.spacing;
        for (var i = 0; i < djb.columnCount; i++) {
            var neighborPos = djb.getXpos(columns[i]);
            if (neighborPos == djb.objectX - djb.spacing) {
                columns[i].setAttribute('transform', 'translate(' + djb.objectX + ')');
                djb.objectX = djb.objectX - djb.spacing;
                break;
            }
        }
        /**
         * Find right neighbor, position, and object with contents
         */
        var rightNeighbor = columns[i];
        var rightNeighborX = djb.getXpos(rightNeighbor);
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
        var leftNeighborX = rightNeighborX - (2 * djb.spacing);
        if (leftNeighborX == 0) {
            var leftNeighbor = null;
        } else { for (var i = 0; i < djb.columnCount; i++) {
            temp = djb.getXpos(columns[i]);
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
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (var key in newGObject) {
                if (leftNeighborObject.hasOwnProperty(key)) {
                    var x2 = (parseInt(leftNeighborX) + djb.columnWidth);
                    var y2 = (parseInt(leftNeighborObject[key]) + djb.columnMidHeight);
                    var x1 = (newObjectX);
                    var y1 = (parseInt(newGObject[key]) + djb.columnMidHeight);
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
        /**
         * If there is a rightNeighbor, draw lines
         */
        if (rightNeighbor) {
            for (var key in newGObject) {
                if (rightNeighborObject.hasOwnProperty(key)) {
                    var x1 = rightNeighborX;
                    var y1 = (parseInt(rightNeighborObject[key]) + djb.columnMidHeight);
                    var x2 = (newObjectX - djb.columnWidth);
                    var y2 = (parseInt(newGObject[key]) + djb.columnMidHeight);
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
    } else if (side == 'right') {
        // Swap newG with its old right neighbor
        djb.newG.oldX = djb.newG.oldX + djb.spacing;
        for (var i = 0; i < djb.columnCount; i++) {
            var neighborPos = djb.getXpos(columns[i]);
            if (neighborPos == djb.objectX + djb.spacing) {
                columns[i].setAttribute('transform', 'translate(' + djb.objectX + ')');
                djb.objectX = djb.objectX + djb.spacing;
                break;
            }
        }
        /**
         * Find left neighbor, position, and object with contents
         */
        var leftNeighbor = columns[i];
        var leftNeighborX = djb.getXpos(leftNeighbor);
        var leftNeighborItems = leftNeighbor.getElementsByTagName('g');
        var leftNeighborObject = new Object();
        var columnCells = leftNeighbor.getElementsByTagName('g');
        for (var j = 0; j < columnCells.length; j++) {
            var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
            var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
            leftNeighborObject[cellText] = cellYPos;
        }
        /**
         * Use the left neighbor position to find the right
         * var columns holds all draggable objects, which won't have changed, but their order changes
         */
        var rightNeighborX = parseInt(leftNeighborX) + (2 * djb.spacing);
        if (rightNeighborX > djb.farRight) {
            var rightNeighbor = null;
        } else { 
            for (var i = 0; i < djb.columnCount; i++) {
                temp = djb.getXpos(columns[i]);
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
        /**
         * If there is a leftNeighbor, draw lines
         */
        if (leftNeighbor) {
            for (var key in newGObject) {
                if (leftNeighborObject.hasOwnProperty(key)) {
                    var x2 = (parseInt(leftNeighborX) + djb.columnWidth);
                    var y2 = (parseInt(leftNeighborObject[key]) + djb.columnMidHeight);
                    var x1 = (newObjectX);
                    var y1 = (parseInt(newGObject[key]) + djb.columnMidHeight);
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
        if (rightNeighbor) {
            for (var key in newGObject) {
                if (rightNeighborObject.hasOwnProperty(key)) {
                    var x1 = rightNeighborX;
                    var y1 = (parseInt(rightNeighborObject[key]) + djb.columnMidHeight);
                    var x2 = (newObjectX - djb.columnWidth);
                    var y2 = (parseInt(newGObject[key]) + djb.columnMidHeight);
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
    drawLines();
}
function drawLines() {
    // columnsObject[columnXPos][title] returns cellYpos
    // SVG text objects have a .textContent property, but no .innerHTML
    var columns = document.getElementsByClassName('draggable');
    var columnsObject = new Object();
    for (var i = 0; i < djb.columnCount; i++) {
        var columnXPos = djb.getXpos(columns[i]);
        columnsObject[columnXPos] = new Object();
        var columnCells = columns[i].getElementsByTagName('g');
        for (var j = 0; j < columnCells.length; j++) {
            var cellText = columnCells[j].getElementsByTagName('text')[0].textContent;
            var cellYPos = columnCells[j].getElementsByTagName('rect')[0].getAttribute('y');
            columnsObject[columnXPos][cellText] = cellYPos;
        }
    }
    // draw lines right to left starting with second column (from i to i-1)
    // objects don't have length, but length of myObj is Object.keys(myObj).length
    var linesG = document.getElementById('lines');
    for (var i = 1; i < djb.columnCount; i++) {
        var currentCol = columnsObject[djb.initialColumnPositions[i]];
        var precedingCol = columnsObject[djb.initialColumnPositions[i - 1]];
        for (var key in currentCol) {
            if (undefined != precedingCol && precedingCol.hasOwnProperty(key)) {
                var x1 = djb.initialColumnPositions[i];
                var y1 = parseInt(currentCol[key]) + djb.columnMidHeight;
                var x2 = parseInt(djb.initialColumnPositions[i - 1]) + djb.columnWidth;
                var y2 = parseInt(precedingCol[key]) + djb.columnMidHeight;
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
    var columns = document.getElementsByClassName('draggable');
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
}
function eraseLines() {
    // someday this will be easier: http://red-team-design.com/removing-an-element-with-plain-javascript-remove-method/
    // must work backwards: http://stackoverflow.com/questions/1457544/javascript-loop-only-applying-to-every-other-element
    var lines = document.getElementsByTagName('line');
    for (var i = lines.length - 1; i >= 0; i--) {
        lines[i].parentNode.removeChild(lines[i]);
    }
}