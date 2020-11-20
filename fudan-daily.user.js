// ==UserScript==
// @name         auto fudandaily
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://zlapp.fudan.edu.cn/site/ncov/fudanDaily?from=history
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.0/dist/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    function click1(){
        $('.wapat-btn.wapat-btn-ok').click();
    }
    function click2(){
        let ttt = $('.text');
        for (let i = 0; i < ttt.length; i ++ ) if ($(ttt[i]).attr('name') == 'area') $(ttt[i]).click();
    }
    function click3(){
        $('.footers a')[0].click();
    }
    function click4(){
        $('.wapcf-btn.wapcf-btn-ok').click();
    }
    function refresh(){
        window.location.reload();
    }
    if (new Date().getHours() < 9) setTimeout(refresh, 1800000);
    else{
        setTimeout(click1, 10000);
        setTimeout(click2, 20000);
        //setTimeout(refresh, 25000);
        setTimeout(click3, 30000);
        setTimeout(click4, 35000);
        setTimeout(refresh, 1000 * 3600 * 4.5);
    }
})();
