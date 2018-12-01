// ==UserScript==
// @name         CSDN Show Full Article
// @namespace    none
// @version      0.1.0
// @description  Automatically show full article in CSDN
// @author       zyr17
// @match        https://blog.csdn.net/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    $("div.article_content").removeAttr("style");
    $("#btn-readmore").parent().remove();
})();