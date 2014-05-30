/*
 * Synopsis: Drag and drop support for plectograms
 * Developer: David J. Birnbaum, djbpitt@gmail.com http://www.obdurodon.org
 * Project: http://repertorium.obdurodon.org
 * Date: First version 2014-05-30
 */
// drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
// see also http://www.codedread.com/dragtest2.svg
function startMove(evt) {
    //global variable, used by moveIt()
    mouseStartX = evt.clientX;
    //svg has no concept of z height, so replace with clone at end of sequence to avoid losing focus
    //also global, so that it can be tracked even when the mouse races ahead
    newG = this.parentNode.cloneNode(true);
    //target is <image> child of column, so need to move up two generations
    this.parentNode.parentNode.appendChild(newG);
    this.parentNode.parentNode.removeChild(this.parentNode);
    //objectX is global, records starting position of drag
    objectX = parseInt(newG.getAttribute('transform').slice(10, -1));
    newG.getElementsByTagName('image')[0].addEventListener('mousedown', startMove, false);
    window.addEventListener('mousemove', moveIt, false);
    window.addEventListener('mouseup', endMove, false);
    var lines = document.getElementsByTagName('line');
    for (i = 0; i < lines.length; i++) {
        lines[i].style.stroke = 'lightgray';
    }
    var columns = document.getElementsByClassName('draggable');
    for (i = 0; i < columns.length; i++) {
        if (columns[i] !== newG) {
            columns[i].style.opacity = '.5';
        }
    }
}
function endMove(evt) {
    window.removeEventListener('mousemove', moveIt, false);
    window.removeEventListener('mouseup', endMove, false);
    var landingPos = parseInt(newG.getAttribute('transform').slice(10, -1));
    var columns = document.getElementsByClassName('draggable');
    var allNewColumnPositions =[];
    for (i = 0; i < columns.length; i++) {
        allNewColumnPositions.push(parseInt(columns[i].getAttribute('transform').slice(10, -1)));
    }
    // numerical array sorting at http://www.w3schools.com/jsref/jsref_sort.asp
    for (i = 0; i < allColumnPositions.length; i++) {
        if (allNewColumnPositions.indexOf(allColumnPositions[i]) == -1) {
            newG.setAttribute('transform', 'translate(' + allColumnPositions[i] + ')')
        }
    }
    drawLines();
    var lines = document.getElementsByTagName('line');
    for (i = 0; i < lines.length; i++) {
        lines[i].style.stroke = 'black';
    }
    for (i = 0; i < columns.length; i++) {
        columns[i].style.opacity = '1';
    }
    newG = null;
}
function moveIt(evt) {
    var oldObjectX = newG.getAttribute('transform').slice(10, -1);
    var newObjectX = parseInt(oldObjectX) + evt.clientX - mouseStartX;
    newG.setAttribute('transform', 'translate(' + newObjectX + ')');
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
    var newObjectX = parseInt(newG.getAttribute('transform').slice(10, -1));
    var columns = document.getElementsByClassName('draggable');
    if (side == 'left') {
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
    } else if (side == 'right') {
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
    }
}
function drawLines() {
    var columns = document.getElementsByClassName('draggable');
    var columnObject = new Object();
    var columnCellsObject = new Object();
    for (i = 0; i < columns.length; i++) {
        columnId = columns[i].getAttribute('transform').slice(10, -1);
        columnObject[columnId] = columns[i];
        var columnCells = columns[i].getElementsByTagName('g');
        for (j = 0; j < columnCells.length; j++) {
            columnCellsObject[columnId] = columnCells;
        }
    }
    for (i = 1; i < allColumnPositions.length; i++) {
        columnId = ((i + 1) * spacing);
        precedingColumnId = (i * spacing);
        // console.log('current column (' + columnObject[columnId].id + ') has ' + columnCellsObject[columnId].length + ' texts and preceding column (' + columnObject[precedingColumnId].id + ') has ' + columnCellsObject[precedingColumnId].length + ' texts');
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