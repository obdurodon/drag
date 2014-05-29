// drag and drop based on http://dl.dropboxusercontent.com/u/169269/group_drag.svg
function startMove(evt) {
    //global variable, used by moveIt()
    mouseStartX = evt.clientX;
    //svg has no concept of z height, so replace with clone at end of sequence to avoid losing focus
    var newG = this.cloneNode(true);
    this.parentNode.appendChild(newG);
    this.parentNode.removeChild(this);
    var objectX = newG.getAttribute('transform').slice(10, -1);
    console.log('startMove for object ' + newG.id + ' with objectX=' + objectX + ' and mouseX=' + mouseStartX);
    newG.addEventListener('mousedown', startMove, false);
    newG.addEventListener('mousemove', moveIt, false);
    newG.addEventListener('mouseup', endMove, false);
}
function endMove(evt) {
    this.removeEventListener('mousemove', moveIt, false);
    console.log('endMove at mouse position ' + evt.clientX);
}
function moveIt(evt) {
    var g = this;
    var oldObjectX = g.getAttribute('transform').slice(10, -1);
    var newObjectX = parseInt(oldObjectX) + evt.clientX - mouseStartX;
    console.log('Now moving ' + this.id + ' at ' + oldObjectX + ' to ' + newObjectX);
    g.setAttribute('transform', 'translate(' + newObjectX + ')');
    mouseStartX = evt.clientX;
    // global variable, initialized in startMove()
}
function init() {
    var columns = document.getElementsByClassName('draggable');
    for (var i = 0; i < columns.length; i++) {
        columns[i].addEventListener('mousedown', startMove, false);
        columns[i].addEventListener('mouseup', endMove, false);
    }
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
window.onload = init;