// ==UserScript==
// @name         auto fudandaily
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://zlapp.fudan.edu.cn/site/ncov/fudanDaily?from=history
// @start-at     document-end
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==


(function() {
    'use strict';

    // baidu OCR API key and secret
    let API_KEY = 'YOUR_API_KEY';
    let API_SECRET = 'YOUR_API_SECRET';

    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        console.log(canvas, ctx);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    function get_access_token(cb) {
        GM_xmlhttpRequest({
            method: 'get',
            url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}&`,
            data: {},
            onload: function (res) {
                let resp = JSON.parse(res.response);
                console.log(resp);
                cb && cb(resp);
            }
        });
    }

    function detect_image(access_token, image_base64, cb) {
        console.log('detecttttttt', access_token, image_base64, cb);
        // image_base64 = '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';
        image_base64 = encodeURIComponent(image_base64);
        GM_xmlhttpRequest({
            method: 'post',
            url: `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${access_token}&language_type=ENG&image=${image_base64}`,
            data: {},
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            onload: function (res) {
                console.log(res);
                let resp = JSON.parse(res.response);
                console.log(resp);
                cb && cb(resp);
            }
        });
    }

    // Your code here...
    function clickstart(){
        document.querySelector('.wapat-btn.wapat-btn-ok').click();
    }
    function clickyes(){
        let spans = document.getElementsByTagName('span');
        for (let sp of spans){
            if (sp.innerText.indexOf('今日是否在校') >= 0)
                sp.nextElementSibling.children[0].click();
        }
    }
    function clickgps(){
        document.querySelector('.text[name=area]').click();
    }
    function clicksubmit(){
        document.querySelector('.footers a').click();
    }
    function clickconfirm(){
        document.querySelector('.wapcf-btn.wapcf-btn-ok').click();
    }
    function fillcode(){
        let img = document.querySelector('img[src="/backend/default/code"]');
        let base64img = getBase64Image(img);

        get_access_token((resp) => {
            detect_image(resp.access_token, base64img, (resp) => {
                let code = '';
                if (resp.words_result)
                    for (let i of resp.words_result)
                        code += i.words;
                console.log('code', code);
                document.querySelector('.wapat-title-input').children[0].value = code;
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("input", false, true);
                document.querySelector('.wapat-title-input').children[0].dispatchEvent(evt);
                console.log('code', document.querySelector('.wapat-title-input').children[0], document.querySelector('.wapat-title-input').children[0].value);
                document.querySelector('.wapat-title-input').nextElementSibling.nextElementSibling.children[0].click();
            });
        });
    }
    function refresh(){
        window.location.reload();
    }
    setTimeout(refresh, 1800000);
    if (new Date().getHours() >= 9){
        setTimeout(() => {
            if (/省|市/.exec(document.querySelector('.text[name=area] > input').value)){
                console.log('checkin over. skip.');
                setTimeout(refresh, 1000 * 3600 * 5);
            }
            else{
                console.log('start checkin');
                setTimeout(clickstart, 1000);
                setTimeout(clickyes, 2000);
                setTimeout(clickgps, 2050);
                //setTimeout(refresh, 25000);
                setTimeout(clicksubmit, 10000);
                setTimeout(clickconfirm, 11000);
                setTimeout(fillcode, 13000);
                setTimeout(refresh, 1000 * 3600 * 0.1);}
            }
        , 10000);
    }
})();
