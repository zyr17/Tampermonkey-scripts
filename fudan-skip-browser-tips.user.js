// ==UserScript==
// @name         skip browsertips
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://ehall.fudan.edu.cn/new/portal/browerTips.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    $('.visit.stillVisitPage').click();
    // Your code here...
})();
