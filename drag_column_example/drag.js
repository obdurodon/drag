function allowDrop(ev) {
    ev.preventDefault();
}
            
function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}
            
function drop(ev) {
    ev.preventDefault();
    var callId = ev.getAttribute("id");
    cols = document.getElementsByClassName("col");
    colsLength = cols.length;
    for (i = 0; i < colsLength; i++) {
        var id = cols[i].getAttribute("id");
        if (callId == id) {
            console.log("column " + (i+1) + ": " + ev.clientX);
        } else {
            var rect = cols[i].getBoundingClientRect();
            console.log("column " + (i+1) + ": " + rect.left);
        }
    }
}
            
function dragOut(ev) {
    ev.target.style.borderColor="#aaaaaa";
}
