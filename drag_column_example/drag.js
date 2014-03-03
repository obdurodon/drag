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
    
    var xposArr = new Array(colsLength);
    
    // add id and xpos to 2D array
    for (i = 0; i < colsLength; i++) {        
        var id = cols[i].getAttribute('id');
        if (callId == id) {            
            xposArr[i] = new Array();
            xposArr[i][0] = id;
            xposArr[i][1] = ev.clientX;
            //console.log("column " + (i+1) + ": " + ev.clientX);
        } else {
            var rect = cols[i].getBoundingClientRect();
            
            xposArr[i] = new Array();
            xposArr[i][0] = id;
            xposArr[i][1] = rect.left;
            //console.log("column " + (i+1) + ": " + rect.left);
        }
    }
    
    // sort columns on xpos
    xposArr = xposArr.sort(function (a, b) {
        return a[1] > b[1];
    });
    
    // print sorted columns for debugging
    for (i = 0; i < colsLength; i++) {
        console.log(xposArr[i][0] + ": " + xposArr[i][1]);
    }
    
    // assign columns data-index values
    for (i = 0; i < colsLength; i++) {
        elem = document.getElementById(xposArr[i][0]);
        elem.setAttribute('data-index', alphabet[i]);
    }
    
    // http://stackoverflow.com/questions/282670/easiest-way-to-sort-dom-nodes
    var div = document.getElementById('drop');
    
    var items = div.childNodes;
    var itemsArr = [];
    for (var i in items) {
        if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
            itemsArr.push(items[i]);
        }
    }

    itemsArr.sort(function(a, b) {
        return a.getAttribute('data-index') > b.getAttribute('data-index');
    });

    for (i = 0; i < itemsArr.length; ++i) {
        div.appendChild(itemsArr[i]);
    }
}
            
function dragOut(ev) {
    ev.target.style.borderColor="#aaaaaa";
}

var alphabet = new Array('a','b','c','d','e','f','g','h','i','j','k','l');

