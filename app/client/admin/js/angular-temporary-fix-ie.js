'use strict';
(function() {

  // fix from https://github.com/angular/angular.js/issues/10259#issuecomment-142027894
  if (typeof SVGElement.prototype.contains == 'undefined') {
    SVGElement.prototype.contains = HTMLDivElement.prototype.contains;
  }

  // fix for IE10+ using 'HtmlDocument' and IE9 using 'Document'
  // inspired by http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html and
  // http://ejohn.org/blog/comparing-document-position/
  var document = typeof HTMLDocument !== 'undefined' ? HTMLDocument :
          (typeof Document !== 'undefined' ? Document : null);
  if (document && typeof document.prototype.contains === 'undefined') {
    document.prototype.contains = function(element) {
      return Boolean(this.compareDocumentPosition(element) & 16);
    };
  }
})();
