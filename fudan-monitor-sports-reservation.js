// ==UserScript==
// @name         监控复旦体育场
// @namespace    http://tampermonkey.net/
// @version      2025-04-01
// @description  try to take over the world!
// @author       You
// @match        https://elife.fudan.edu.cn/public/front/getResource2.htm*
// @match        https://elife.fudan.edu.cn/public/front/toResourceFrame.htm*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fudan.edu.cn
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (document.body.innerText.indexOf('场馆预约') == -1) {
        if (Notification.permission === "granted") {
            new Notification("提示", { body: "不是场馆预约界面！检查是不是被封了" });
        }
        alert("不是场馆预约界面！检查是不是被封了");
        return
    }
    var button = document.createElement('button');
    button.innerText = '请求通知权限';

    // 设置按钮样式，使其固定在网页最末尾
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';

    // 按钮点击事件
    button.addEventListener('click', function() {
        Notification.requestPermission().then(function(permission) {
            console.log('通知权限：', permission);
        });
    });

    // 添加按钮到页面
    document.body.appendChild(button);

    const images = document.querySelectorAll("img");
    const targetImages = Array.from(images).filter(img => img.src.endsWith('/images/front/index/button/reserve.gif'));
    console.log(targetImages);

    let refresh_time = Math.random() * 5000 + 8000;
    if (targetImages.length > 0) {
        // console.log(Notification.permission)
        if (Notification.permission === "granted") {
            new Notification("提示", { body: "找到了目标图片！" });
            // setTimeout(() => {
            //     location.reload();
            // }, refresh_time); // 10秒后刷新
        }
        alert("找到了目标图片！");
    } else {
        setTimeout(() => {
            location.reload();
        }, refresh_time); // 10秒后刷新
    }
    // Your code here...
})();
