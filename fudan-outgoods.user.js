// ==UserScript==
// @name         存货自动填
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let $ = window.$;
    let data = {
        "outGoodsMain.supplier": "上海圆迈贸易有限公司",
        "outGoodsMain.campusNo": "JW",
        "outGoodsMain.authorize": "1",
        "outGoodsMain.authorizeUser": "25206",
        "outGoodsMain.telephone": "18066230299",
        "outGoodsMain.graduateTeacher": "孙未未",
    };
    for (let i in data){
        let inp = $('input[name="' + i + '"]');
        let sel = $('select[name="' + i + '"]');
        if (inp.length > 0){
            inp.val(data[i]);
        }
        else if (sel.length > 0){
            sel.val(data[i]);
        }
    }

    // select authorizer id
    $('#useridId').val(25206);
	$('#useridName').val('***06 | 孙未未');

    //经费来源
    $('#jfly-single-no').val('VGH2301029');
    window.jfly_changeVal();
})();
