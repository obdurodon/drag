/*
Filename: lgToggle.js 
Author: David J. Birnbaum
Date: 2013-08-09
Copyright: Creative Commons BY-NC-SA 3.0 (http://creativecommons.org/licenses/by-nc-sa/3.0/)
Project home page: http://repertorium.obdurodon.org
Project director: David J. Birnbaum (djbpitt@gmail.com)
Synopsis: Toggles language of Repertorium project pages
*/

//Cookie management functions from http://www.quirksmode.org/js/cookies.html
function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() +(days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
  } else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

//Project-specific code begins here

/*
 * Listen for clicks on flags to change language
 * When the page loads, create a new cookie with the old value, so that
 *   it's always good for 30 days
 */
 function init () {
  var flags = document.getElementsByClassName('flag');
  for (i = 0; i < flags.length; i++) {
    flags[i].addEventListener('click', changeLang, false);
  }
  var lang = readCookie('lg');
  createCookie('lg',lang,30);
  changeLang();
}

/*
 * Called from init and when a lg flag is clicked;
 * if this.id is undefined, it's been called from init, so use the current cookie value (if any)
 * otherwise get the language from the flag that's been clicked
 */
 function changeLang() {
  if (typeof this.id === 'undefined') {var id = readCookie('lg')} else {var id = this.id;}
  createCookie('lg',id,30);
  var bgs = document.getElementsByClassName('bg');
  var bgsLength = bgs.length;
  var ens = document.getElementsByClassName('en');
  var ensLength = ens.length;
  var rus = document.getElementsByClassName('ru');
  var rusLength = rus.length;
  var flagImgs = document.querySelectorAll('.flag > img');
  var flagImgsLength = flagImgs.length;
  for (i = 0; i < flagImgsLength; i++) {
    if (flagImgs[i].parentNode.id == id) {
      flagImgs[i].style.boxShadow = '0 0 5px brown';
    } else {
      flagImgs[i].style.boxShadow = 'none';
    }
  }
  switch (id) {
    case 'bg':
    for (var i = 0; i < bgsLength; i++) {
      bgs[i].style.display = 'inline';
    }
    for (var i = 0; i < ensLength; i++) {
      ens[i].style.display = 'none';
    }
    for (var i = 0; i < rusLength; i++) {
      rus[i].style.display = 'none';
    }
    break;
    case 'en':
    for (var i = 0; i < bgsLength; i++) {
      bgs[i].style.display = 'none';
    }
    for (var i = 0; i < ensLength; i++) {
      ens[i].style.display = 'inline';
    }
    for (var i = 0; i < rusLength; i++) {
      rus[i].style.display = 'none';
    }
    break;
    case 'ru':
    for (var i = 0; i < bgsLength; i++) {
      bgs[i].style.display = 'none';
    }
    for (var i = 0; i < ensLength; i++) {
      ens[i].style.display = 'none';
    }
    for (var i = 0; i < rusLength; i++) {
      rus[i].style.display = 'inline';
    }
  }
}

/*
 * use addEventListener instead of window.onload= in order to add
 * onload events in multiple scrips without overwriting
 */
 window.addEventListener('load',init,false);