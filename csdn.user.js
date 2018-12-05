// ==UserScript==
// @name         CSDN Show Full Article
// @namespace    none
// @version      0.1.1
// @description  Automatically show full article in CSDN
// @author       zyr17
// @match        https://blog.csdn.net/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    $("div.article_content").removeAttr("style");
    $("#btn-readmore").parent().remove();
    var checkid10000000 = setInterval(function (){
        $('.check-adblock-bg').remove();
        if ($('#check-adblock-time').size() == 0)
            $('body').append($('<span id="check-adblock-time" style="opacity: 0">10000000</span>'));
        clearInterval(checkid10000000);
    }, 100);
})();
