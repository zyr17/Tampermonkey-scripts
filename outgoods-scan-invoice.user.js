// ==UserScript==
// @name         扫描发票填存货
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr
// @match        https://zcc.fudan.edu.cn/private/front/index.action
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action*
// @match        http://www.wxpgl.fudan.edu.cn/invoice/login/main_new.jsp*
// @match        http://www.wxpgl.fudan.edu.cn/invoice/login/edit_new.jsp*
// @match        http://www.wxpgl.fudan.edu.cn/invoice/login/invoice_cert_success.jsp*
// @icon         https://www.fudan.edu.cn/_upload/tpl/00/0e/14/template14/images/favicon.ico
// @require      https://cdn.bootcdn.net/ajax/libs/pdf.js/2.10.377/pdf.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/qr-scanner/1.2.0/qr-scanner.umd.min.js
// @start-at     document-end
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @connect      *
// ==/UserScript==

// @require      https://cdn.bootcdn.net/ajax/libs/html5-qrcode/2.0.3/html5-qrcode.min.js
let $ = unsafeWindow.$;
;
(function() {
    'use strict';

    let PROF_NAME = 'aaa';
    let PHONE = '13000000000';
    let PROF_ID = '11111';
    let DEFAULT_COMPANY_NAME = '';
    let FUND_NAME = 'VVV1234567';
    // let DEFAULT_COMPANY_NAME = '上海圆迈贸易有限公司';

    if (unsafeWindow.location.href.indexOf('index') != -1){
        let func = unsafeWindow.openIntegratedTqb;
        function f(x, y) {
            if (x == '' && y == '') unsafeWindow.location.href = 'https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr';
            func(x,y);
        }
        unsafeWindow.openIntegratedTqb = f;
        return;
    }

    if (unsafeWindow.location.href.indexOf('https://zcc.fudan.edu.cn/private/outgoods/form.action') != -1 && unsafeWindow.location.href != 'https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr'){
        let input = unsafeWindow.document.getElementById('jfly-single-no');
        function fill() {
            input.value = '';
            //setTimeout(() => {
            input.value = FUND_NAME;
            unsafeWindow.jfly_changeVal();
            //}, 50);
        }
        setInterval(fill, 1000);
        return;
    }

    if (unsafeWindow.location.href.indexOf('http://www.wxpgl.fudan.edu.cn/invoice/login/main_new.jsp') != -1){
        // fill verify code
        let id = document.getElementById('fpdm').value + document.getElementById('fphm').value // code, no
        console.log(id);
        GM.getValue(id).then((res) => {
            res = res.slice(res.length - 6);
            document.getElementById('fpje').value = res;
            console.log(res);
        });
        return;
    }

    if (unsafeWindow.location.href.indexOf('http://www.wxpgl.fudan.edu.cn/invoice/login/edit_new.jsp') != -1){
        function confirm() {
            document.querySelector('.messager-button > a') && document.querySelector('.messager-button > a').click();
        }
        setInterval(confirm, 500);
        function start_click() {
            let startdelay = 0;
            setTimeout(() => {document.querySelector('.goodsType a').click();}, startdelay);
            setTimeout(() => {document.querySelector('.jMenuList').children[0].children[1].click();}, startdelay + 500);
            setTimeout(() => {document.querySelector('#dtlTable a').click();}, startdelay + 1000);
            setTimeout(() => {document.querySelector('.jMenuList').children[0].children[3].click();}, startdelay + 1500);
        }
        let btn = document.createElement('button');
        document.body.appendChild(btn);
        btn.style.cssText = 'position: fixed; top: 50px; left: 5px; display: flex; flex-direction: colum; text-align: left; border: red solid 2px; background: cyan; z-index: 999; height: 40px; width: 300px;';
        btn.innerText = '开始填写';
        btn.onclick = start_click;
        return;
    }

    if (unsafeWindow.location.href.indexOf('http://www.wxpgl.fudan.edu.cn/invoice/login/invoice_cert_success.jsp') != -1){
        function confirm() {
            document.querySelector('#closeBtn') && document.querySelector('#closeBtn').click();
        }
        setInterval(confirm, 500);
        return;
    }

    document.querySelector('img[src="/images/front/tqb/outgoods_process.jpg"]').hidden = true;

    function parse_inv_qrcode(s) {
        s = s.split(',');
        GM.setValue(s[2] + s[3], s[6]).then(() => {
            console.log(s[2] + s[3], s[6]);
            GM.getValue(s[2] + s[3]).then((res) => {
                console.log('111', res);
            });
        });
        return {
            type: (s[1]),
            code: (s[2]),
            no: (s[3]),
            value: (s[4]),
            date: (s[5]),
            check: (s[6]),
        };
    }

    function fill_data(invoice) {
        function getdate(date) {
            date = date.toString();
            return date[0] + date[1] + date[2] + date[3] + '-' + date[4] + date[5] + '-' + date[6] + date[7];
        }
        let data = {
            "outGoodsMain.supplier": DEFAULT_COMPANY_NAME,
            "outGoodsMain.campusNo": "JW",
            "outGoodsMain.authorize": "1",
            "outGoodsMain.authorizeUser": PROF_ID,
            "outGoodsMain.telephone": PHONE,
            "outGoodsMain.graduateTeacher": PROF_NAME,
            "outGoodsMain.invoiceNo": invoice.no,
            "outGoodsMain.invoiceCode": invoice.code,
            "outGoodsMain.invoiceDate": getdate(invoice.date)
        };
        for (let i in data){
            let inp = document.querySelector('input[name="' + i + '"]');
            let sel = document.querySelector('select[name="' + i + '"]');
            if (inp){
                inp.value = data[i];
            }
            else if (sel){
                sel.value = data[i];
            }
        }
        let select2s = document.querySelectorAll('.select2-chosen');
        for (let I in select2s){
            let i = select2s[I];
            if (i && i.innerText && i.innerText.indexOf('请选择') != -1){
                i.innerText = '江湾校区';
                break;
            }
        }

        // select authorizer id
        document.querySelector('#useridId').value = PROF_ID;
        function starid(id){
            id = id.toString();
            let res = '';
            for (let i = 0; i < id.length - 2; i ++ )
                res = res + '*';
            res = res + id.slice(id.length - 2);
            return res;
        }
        document.querySelector('#useridName').value = `${starid(PROF_ID)} | ${PROF_NAME}`;

        //经费来源
        //$('#jfly-single-no').val(FUND_NAME);
        unsafeWindow.jfly_changeVal();
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.bootcdn.net/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    // QrScanner.WORKER_PATH = 'https://cdn.bootcdn.net/ajax/libs/qr-scanner/1.2.0/qr-scanner-worker.min.js';

    function createWorkerFromExternalURL(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function(response) {
                var script, dataURL, worker = null;
                if (response.status === 200) {
                    script = response.responseText;
                    dataURL = 'data:text/javascript;base64,' + btoa(script);
                    // worker = new unsafeWindow.Worker(dataURL);
                }
                callback(dataURL);
            },
            onerror: function() {
                callback(null);
            }
        });
    }

    let cmapdataurl = '';
    createWorkerFromExternalURL('https://cdn.bootcdn.net/ajax/libs/qr-scanner/1.2.0/qr-scanner-worker.min.js', (dataURL) => {QrScanner.WORKER_PATH = dataURL;});
    createWorkerFromExternalURL('https://github.com/mozilla/pdf.js/blob/master/external/bcmaps', (dataURL) => {cmapdataurl = dataURL;});

    function renderImg(pdfFile,canvasContext) {
        pdfFile.getPage(1).then(function(page) { //逐页解析PDF

            console.log(page.getTextContent().then((a)=>{console.log(a)}));

            let scale = 3;

            var viewport = page.getViewport({scale: scale}); // 页面缩放比例
            var newcanvas = canvasContext.canvas;

            //设置canvas真实宽高
            newcanvas.width = viewport.width;
            newcanvas.height = viewport.height;

            console.log(page);

            //设置canvas真实宽高
            newcanvas.style.width = 1920;
            newcanvas.style.height = 1080;

            let renderContext = {
                canvasContext: canvasContext,
                viewport: viewport
            };

            page.render(renderContext).promise.then(() => {
                let dataURL = newcanvas.toDataURL();
                // let scanner = new Html5Qrcode();
                QrScanner.scanImage(newcanvas).then((result) => {
                    console.log(result);
                    fill_data(parse_inv_qrcode(result));
                    newcanvas.style.width = 800;
                    newcanvas.style.height = 450;
                    // newcanvas.hidden = true;
                });
            });
        });

        return;
    };

    let btndiv = document.createElement('div');
    document.body.appendChild(btndiv);
    btndiv.style.cssText = 'top: 50px; left: 5px; display: flex; flex-direction: colum; text-align: left; border: red solid 2px; background: cyan; z-index: 999; height: 40px; width: 300px;';
    btndiv.innerHTML = `<input id='choosePDF' type='file' accept="application/pdf">`;
    let pdfinput = document.getElementById('choosePDF');
    pdfinput.onchange = function () {
        let file = this.files[0];
        if (!file.size) return;
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) { //文件读取成功完成时触发
            console.log(pdfjsLib.getDocument(this.result));
            pdfjsLib.getDocument({url: this.result}).promise.then(function(pdf) { //调用pdf.js获取文件
                if(pdf) {
                    //遍历动态创建canvas
                    var canvas = document.createElement('canvas');
                    canvas.id = "pdfCanvas";
                    btndiv.append(canvas);
                    var context = canvas.getContext('2d');
                    renderImg(pdf,context);

                }
            });
        }
    };

})();
