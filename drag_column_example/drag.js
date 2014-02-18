function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.getAttribute('id'));
}
            
function drop(ev) {
    ev.preventDefault();
    var callId = ev.dataTransfer.getData("Text");
    cols = document.getElementsByClassName('col');
    colsLength = cols.length;
    
    var x1 = cols[0].getBoundingClientRect().left;
    var x2 = cols[1].getBoundingClientRect().left;
    var interval = x2 - x1;
    
    console.log(interval);
    
    for (i = 0; i < colsLength; i++) {
        var id = cols[i].getAttribute('id');
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
