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
    var objectX = newG.getAttribute('transform').slice(10, -1);
    console.log('startMove for object ' + newG.id + ' with objectX=' + objectX + ' and mouseX=' + mouseStartX);
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
    newG = null;
    console.log('endMove at mouse position ' + evt.clientX);
    eraseLines();
    var lines = document.getElementsByTagName('line');
    for (i = 0; i < lines.length; i++) {
        lines[i].style.stroke = 'black';
    }
    var columns = document.getElementsByClassName('draggable');
    for (i = 0; i < columns.length; i++) {
        columns[i].style.opacity = '1';
    }
}
function moveIt(evt) {
    var g = newG;
    var oldObjectX = g.getAttribute('transform').slice(10, -1);
    var newObjectX = parseInt(oldObjectX) + evt.clientX - mouseStartX;
    console.log('Now moving ' + g.id + ' at ' + oldObjectX + ' to ' + newObjectX);
    g.setAttribute('transform', 'translate(' + newObjectX + ')');
    mouseStartX = evt.clientX;
    // global variable, initialized in startMove()
}
function drawLines() {
}
function eraseLines() {
    // someday this will be easier: http://red-team-design.com/removing-an-element-with-plain-javascript-remove-method/
    // must work backwards: http://stackoverflow.com/questions/1457544/javascript-loop-only-applying-to-every-other-element
    var lines = document.getElementsByTagName('line');
    for (var i = lines.length - 1; i >= 0; i--) {
        lines[i].parentNode.removeChild(lines[i]);
    }
}
function plectogram_init() {
    var images = document.getElementsByTagName('image');
    for (var i = 0; i < images.length; i++) {
        images[i].addEventListener('mousedown', startMove, false);
    }
    window.addEventListener('mouseup', endMove, false);
}
window.addEventListener('load', plectogram_init, false);