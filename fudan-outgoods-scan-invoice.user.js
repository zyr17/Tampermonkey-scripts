// ==UserScript==
// @name         扫描发票填存货
// @namespace    http://tampermonkey.net/
// @version      0.5.3
// @description  通过PDF扫描上面的二维码从而获取发票信息并快速填写复旦大学存货单
// @author       You
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr
// @match        https://zcc.fudan.edu.cn/private/front/index.action
// @match        https://zcc.fudan.edu.cn/private/outgoods/form.action*
// @match        https://zcc.fudan.edu.cn/private/outgoods/extractDetails.action*
// @match        https://wxpgl.fudan.edu.cn/invoice/login/main_new.jsp*
// @match        https://wxpgl.fudan.edu.cn/invoice/login/edit_new.jsp*
// @match        https://wxpgl.fudan.edu.cn/invoice/login/invoice_cert_success.jsp*
// @icon         https://www.fudan.edu.cn/_upload/tpl/00/0e/14/template14/images/favicon.ico
// @require      https://cdn.bootcdn.net/ajax/libs/pdf.js/2.10.377/pdf.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/qr-scanner/1.2.0/qr-scanner.umd.min.js
// @start-at     document-end
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.listValues
// @connect      *
// @downloadURL  https://github.com/zyr17/Tampermonkey-scripts/raw/master/fudan-outgoods-scan-invoice.user.js
// @updateURL    https://github.com/zyr17/Tampermonkey-scripts/raw/master/fudan-outgoods-scan-invoice.user.js
// ==/UserScript==

// @require      https://cdn.bootcdn.net/ajax/libs/html5-qrcode/2.0.3/html5-qrcode.min.js


/*

简单使用说明：

打开资产管理系统，点击报账单-外购存货（必须从该入口进入，我的资产-外购存货-新增将无法触发脚本）

填写必要信息。如果需要填写导师信息则填写导师工号及姓名，否则留空。校区填对应字母。注意经费号，可能需要改动！

点击下方浏览文件，并选择发票PDF。一般的电子发票都能正常识别，识别成功后会自动填写对应信息，之后点击下一步即可。识别失败会警告，请手动填写该发票。

点击发票采集，会自动填写发票号码及验证码。点击获取货物明细，点击正中间的点击开始填写，点击确定，完成发票采集。

点击明细提取，自动提取该发票的所有明细。暂时不支持提取部分明细，如有该需求请关闭脚本。

！！！保存两次！！！由于报账系统原因，无法一次性保存经费号和明细，需要连续点击两次保存。

提交存货单。

*/


let $ = unsafeWindow.$;
;
(function() {
    'use strict';

    let DATA = {
        'PROF_NAME': '',
        'PHONE': '',
        'PROF_ID': '',
        'FUND_NAME': '',
        'CAMPUS_NO': '',
        'INVOICE_TYPE': '1',
    };

    function sync_and_save() {
        for (let i in DATA) {
            let input = unsafeWindow.document.querySelector('#' + i);
            DATA[i] = input.value;
        }
        GM.setValue('DATA', JSON.stringify(DATA)).then(() => {
            console.log(DATA);
            GM.getValue('DATA').then((res) => { console.log('DATA', res); });
        });
    }

    function load_and_sync(do_sync = true) {
        GM.getValue('DATA').then((res) => {
            if (res) {
                Object.assign(DATA, JSON.parse(res));
                if (do_sync)
                    for (let i in DATA) {
                        let input = unsafeWindow.document.querySelector('#' + i);
                        input.value = DATA[i];
                    }
            }
        });
    }
    load_and_sync(false);

    function add_info_div() {
        // 基本信息格子
        let infodiv = document.createElement('div');
        document.body.appendChild(infodiv);
        infodiv.style.cssText = 'width: 300px; display: flex; flex-direction: column; text-align: left; border: red solid 2px; background: black; z-index: 999;';
        let data_name = {'PROF_NAME': '研究生导师（不需要请留空）', 'PROF_ID': '导师工号（不需要请留空）', 'PHONE': '电话号码', 'FUND_NAME': '经费号', 'CAMPUS_NO': '校区编号 枫林=FL 邯郸=HD 江湾=JW 其他=XW 张江=ZJ', 'INVOICE_TYPE': '新版=0 旧版=1'};
        for (let i in data_name) {
            // console.log(i, data_name[i]);
            let span = document.createElement('span');
            span.innerText = data_name[i];
            span.style.cssText = 'margin-top: 3px; background: cyan';
            infodiv.appendChild(span);
            let input = document.createElement('input');
            input.id = i;
            input.onchange = sync_and_save;
            infodiv.appendChild(input);
        }
        load_and_sync();
    }

    let popup_interval = setInterval(function () { // 主界面点击确认、保存、提交等按钮
        let popup = document.querySelectorAll('.layui-layer');
        if (popup.length > 0) {
            popup = popup[0];
            let texts = popup.innerText;
            console.log(texts);
            if (texts.indexOf('发票采集后，请点击明细提取按钮提取发票明细') != -1 || texts.indexOf('保存成功！') != -1 || texts.indexOf('提交成功！') != -1) {
                let btn = document.querySelector('.layui-layer .layui-layer-btn0');
                if (btn) btn.click();
            }
            if (texts.indexOf('提交成功！') != -1) {
                clearInterval(popup_interval)
            }
        }
    }, 300);

    if (unsafeWindow.location.href.indexOf('/private/outgoods/extractDetails.action') != -1){ // 自动打钩明细提取并确认
        // unsafeWindow._systemUI.checkedAll(this);
        let input = unsafeWindow.document.getElementById('jfly-single-no');
        let interval_id;
        function check() {
            let checkbox = unsafeWindow.document.querySelectorAll('input');
            console.log(checkbox);
            let click_flag = 0;
            for (let i = 0; i < checkbox.length; i ++ ) {
                let cb = checkbox[i];
                console.log(cb);
                if (cb.type == 'checkbox' && !cb.checked) {
                    cb.click();
                    click_flag = 1;
                }
            }
            if (click_flag){
                clearInterval(interval_id);
                let btn = unsafeWindow.document.querySelectorAll('button');
                for (let i = 0; i < btn.length; i ++ ) {
                    let b = btn[i];
                    console.log(b, b.innerText);
                    if (b.innerText.indexOf('批量提取') != -1) b.click();
                }
            }
        }
        interval_id = setInterval(check, 1000);
        return;
    }

    if (unsafeWindow.location.href.indexOf('index') != -1){ // 主界面直接点击打开存货界面
        let func = unsafeWindow.openIntegratedTqb;
        function f(x, y) {
            if (x == '' && y == '') unsafeWindow.location.href = 'https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr';
            func(x,y);
        }
        unsafeWindow.openIntegratedTqb = f;
        return;
    }

    if (unsafeWindow.location.href.indexOf('https://zcc.fudan.edu.cn/private/outgoods/form.action') != -1 && unsafeWindow.location.href != 'https://zcc.fudan.edu.cn/private/outgoods/form.action?outGoodsMain.temp=system&outGoodsMain.menuFlag=gr'){
        // 存货界面自动填写基金号，明细提取后管用，需要保存两次
        add_info_div();
        let input = unsafeWindow.document.getElementById('jfly-single-no');
        function fill() {
            input.value = '';
            //setTimeout(() => {
            input.value = DATA.FUND_NAME;
            unsafeWindow.jfly_changeVal();
            //}, 50);
        }
        setInterval(fill, 1000);
        return;
    }

    if (unsafeWindow.location.href.indexOf('https://wxpgl.fudan.edu.cn/invoice/login/main_new.jsp') != -1){
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

    if (unsafeWindow.location.href.indexOf('https://wxpgl.fudan.edu.cn/invoice/login/edit_new.jsp') != -1){ // 初始填写界面，扫描发票二维码并填写
        function confirm() {
            document.querySelector('.messager-button > a') && document.querySelector('.messager-button > a').click();
        }
        setInterval(confirm, 500);
        function start_click() {
            let startdelay = 0;
            setTimeout(() => {document.querySelector('.goodsType a').click();}, startdelay);
            setTimeout(() => {document.querySelector('.jMenuList').children[0].children[1].click();}, startdelay + 500);
            setTimeout(() => {document.querySelector('#dtlTable a').click();}, startdelay + 1500);
            setTimeout(() => {document.querySelector('.jMenuList').children[0].children[3].click();}, startdelay + 2000);
        }
        let btn = document.createElement('button');
        document.body.appendChild(btn);
        btn.style.cssText = 'position: fixed; top: 25px; left: 40%; display: flex; flex-direction: colum; text-align: left; border: red solid 2px; background: cyan; z-index: 999; height: 40px; width: 300px;';
        btn.innerText = '点击开始填写';
        btn.onclick = start_click;
        return;
    }

    if (unsafeWindow.location.href.indexOf('https://wxpgl.fudan.edu.cn/invoice/login/invoice_cert_success.jsp') != -1){ // 发票验证成功后点击确认
        function confirm() {
            document.querySelector('#closeBtn') && document.querySelector('#closeBtn').click();
        }
        setInterval(confirm, 500);
        return;
    }

    document.querySelector('img[src="/images/front/tqb/outgoods_process.jpg"]').hidden = true;

    function parse_inv_qrcode(s) {
        s = s.split(',');
        let key, value;
        if (s[2] == '' || s[2] == ' ') { // 普通发票（新版发票）
            key = s[3];
            value = s[4];
        }
        else { // 增值税发票（旧版发票）
            key = s[2] + s[3];
            value = s[6];
        }
        GM.setValue(key, value).then(() => {
            console.log(key, value);
            GM.getValue(key).then((res) => {
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

    function select_click(chosen, key) {
        console.log(chosen, key);
        $(chosen).trigger('mousedown');
        $(chosen).trigger('mouseup');
        setTimeout(() => {
            console.log('drop');
            let drops = document.querySelectorAll('#select2-drop .select2-result-label');
            for (let I = 0; I < drops.length; I ++ ) {
                let i = drops[I];
                console.log(i);
                if (i.innerText.indexOf(key) != -1) {
                    $(i).trigger('mousedown');
                    $(i).trigger('mouseup');
                    return;
                }
            }
        }, 100);
    }

    let INVOICE = undefined;

    function fill_data(invoice) {
        // 根据发票种类，展示或不展示发票代码格子
        console.log(invoice);
        let select2s = document.querySelectorAll('.select2-chosen');
        for (let I = 0; I < select2s.length; I ++ ){
            let i = select2s[I];
            console.log(i);
            if (i && i.parentElement.parentElement.parentElement.previousElementSibling.innerText.indexOf('发票类型') != -1)
                if (DATA.INVOICE_TYPE == 0) select_click(i, '新版发票');
                else select_click(i, '旧版发票');
        }
        INVOICE = invoice;
        // 再开始填写
        setTimeout(fill_data_real, 200);
    }

    function fill_data_real() {
        let invoice = INVOICE;
        console.log(invoice);
        if ((!!DATA.PROF_ID) != (!!DATA.PROF_NAME)) {
            alert('导师姓名和工号未全填写或全空！填写正确后刷新网页并重新选择PDF');
            return;
        }
        function getdate(date) {
            date = date.toString();
            return date[0] + date[1] + date[2] + date[3] + '-' + date[4] + date[5] + '-' + date[6] + date[7];
        }
        let data = {
            "outGoodsMain.supplier": "",
            "outGoodsMain.campusNo": DATA.CAMPUS_NO,
            "outGoodsMain.authorize": "1",
            "outGoodsMain.authorizeUser": DATA.PROF_ID,
            "outGoodsMain.telephone": DATA.PHONE,
            "outGoodsMain.graduateTeacher": DATA.PROF_NAME,
            "outGoodsMain.invoiceType": DATA.INVOICE_TYPE,
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
            if (i && i.parentElement.parentElement.parentElement.previousElementSibling.innerText.indexOf('发票类型') != -1) {
                let d = { '0': '新版发票（无发票代码）', '1': '旧版发票（有发票代码）' };
                i.innerText = d[DATA.INVOICE_TYPE];
            }
            else if (i && i.parentElement.parentElement.parentElement.previousElementSibling.innerText.indexOf('校区') != -1){
                let d = { 'FL': '枫林校区', 'JW': '江湾校区', 'HD': '邯郸校区', 'ZJ': '张江校区', 'XW': '其他校区' };
                i.innerText = d[DATA.CAMPUS_NO];
                break;
            }
        }

        // select authorizer id
        document.querySelector('#useridId').value = DATA.PROF_ID;
        function starid(id){
            id = id.toString();
            let res = '';
            for (let i = 0; i < id.length - 2; i ++ )
                res = res + '*';
            res = res + id.slice(id.length - 2);
            return res;
        }
        if (DATA.PROF_ID || DATA.PROF_NAME)
            document.querySelector('#useridName').value = `${starid(DATA.PROF_ID)} | ${DATA.PROF_NAME}`;

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
                    console.log(script)
                    console.log(btoa(script))
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
                }).catch(() => {console.log('failed');alert('QRCode read failed! cannot auto fill this invoice.');});
            });
        });

        return;
    };

    add_info_div();

    // 选PDF格子
    let btndiv = document.createElement('div');
    document.body.appendChild(btndiv);
    btndiv.style.cssText = 'top: 50px; left: 5px; display: flex; flex-direction: column; text-align: left; border: red solid 2px; background: cyan; z-index: 999; height: 40px; width: 300px;';
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
