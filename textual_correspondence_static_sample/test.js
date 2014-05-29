function startMove(evt) {
    mouseStartX = evt.clientX;
    //global variable, used by moveIt()
    var objectX = this.firstElementChild.getAttribute('x');
    console.log('startMove for object ' + this.id + ' with objectX=' + objectX + ' and mouseX=' + mouseStartX);
    this.addEventListener('mousemove', moveIt, false);
}
function endMove(evt) {
    this.removeEventListener('mousemove', moveIt, false);
    console.log('endMove at mouse position ' + evt.clientX);
}
function moveIt(evt) {
    var x1 = evt.clientX;
    var g = this;
    var oldObjectX = g.getAttribute('x');
    var distanceMoved = x1 - mouseStartX;
    var newObjectX = parseInt(oldObjectX) + distanceMoved;
    console.log('Now moving ' + this.id + ' at ' + oldObjectX + ' by ' + distanceMoved + ' pixels to ' + newObjectX);
    g.setAttribute('x', newObjectX);
    x1 = evt.clientX;
}
function init() {
    var columns = document.getElementsByClassName('draggable');
    for (var i = 0; i < columns.length; i++) {
        columns[i].addEventListener('mousedown', startMove, false);
        columns[i].addEventListener('mouseup', endMove, false);
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
window.onload = init;