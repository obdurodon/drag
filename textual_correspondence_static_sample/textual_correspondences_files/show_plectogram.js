function plectogram_mouseover() {
        var currentClass = this.className.baseVal;
        var hits = document.querySelectorAll('.'+currentClass);
        for (i = 0; i < hits.length; i++) {
			hits[i].setAttribute('fill','red');
			hits[i].setAttribute('stroke','red');
			hits[i].setAttribute('stroke-width','1.5');
        }
}
function plectogram_mouseout() {
        var currentClass = this.className.baseVal;
        var hits = document.querySelectorAll('.'+currentClass);
        for (i = 0; i < hits.length; i++) {
			hits[i].setAttribute('fill','yellow');
			hits[i].setAttribute('stroke','black');
			hits[i].setAttribute('stroke-width','0.5');
         }
}
function show_plectogram_initialize() {
		var slider = document.getElementById('slider1');
		slider.addEventListener('change',scale_plectogram,false);
        var plectogram_cells = document.querySelectorAll('g[class]');
        for (i = 0; i < plectogram_cells.length; i++) {
                plectogram_cells[i].addEventListener('mouseover',plectogram_mouseover,'false');
                plectogram_cells[i].addEventListener('mouseout',plectogram_mouseout,'false');
        var svg = document.getElementsByTagName('svg')[0];
        createCookie('initialSvgHeight',svg.getAttribute('height'),30);
    }
}
function scale_plectogram() {
	var plectogram = document.getElementById('main_svg');
	plectogram.setAttribute('transform','translate('+ (-100 * this.value) +','+ (12 * this.value) +') scale('+this.value+')');
    var svg = document.getElementsByTagName('svg')[0];
    svg.setAttribute('height', (readCookie('initialSvgHeight') * this.value));
}
/*
 * use addEventListener instead of window.onload= in order to add
 * onload events in multiple scrips without overwriting
 */
window.addEventListener('load',show_plectogram_initialize,false);