// ==UserScript==
// @name         存货自动填
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr
// @match        https://zcc.fudan.edu.cn/private/front/index.action
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (window.location.href.indexOf('index') != -1){
        let func = window.openIntegratedTqb;
        function f(x, y) {
            if (x == '' && y == '') window.location.href = 'https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr';
            func(x,y);
        }
        window.openIntegratedTqb = f;
        return;
    }
    let $ = window.$;
    let data = {
        "outGoodsMain.supplier": "上海圆迈贸易有限公司",
        "outGoodsMain.campusNo": "JW",
        "outGoodsMain.authorize": "1",
        "outGoodsMain.authorizeUser": "1111",
        "outGoodsMain.telephone": "1111",
        "outGoodsMain.graduateTeacher": "1111",
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
    let select2s = $('.select2-chosen');
    for (let I in select2s){
        let i = select2s[I];
        if (i && i.innerText && i.innerText.indexOf('请选择') != -1){
            i.innerText = '1111';
            break;
        }
    }

    // select authorizer id
    $('#useridId').val(25206);
	$('#useridName').val('1111');

    //经费来源
    $('#jfly-single-no').val('1111');
    window.jfly_changeVal();
})();
