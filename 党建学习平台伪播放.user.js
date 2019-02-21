// ==UserScript==
// @name         党建学习平台伪播放4.0(alpha)
// @namespace    http://tampermonkey.net/
// @version      4.0.2
// @description  注：4.0版使用方法为，点击我的空间-详情-去观看，在视频播放界面上方的“您所在的位置”右侧将生成一个“开始刷课”按钮，页面加载完成后，点击该按钮，若提示“已完成该课程”即本次刷课成功。
// @author       Dabble
// @match        http://xjtudj.edu.cn/course_detail.html?navId=course_list*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    var btn=document.createElement("button");
    btn.innerText = "开始刷课";
    btn.onclick = (function() {
        var reg = /course_detail\.html\?navId=course_list\&courseId=([a-z0-9]{32})\&coursewareId=([a-z0-9]{32})$/;
        var msg = reg.exec(window.location.href);
        if(msg != null){
            var courseId = msg[1];
            var coursewareId = msg[2];
            var videoElement = document.getElementsByTagName("video")[0];
            if(!videoElement){
                alert("无法找到播放器，请重试");
                return false;
            }
            var DuringTime = document.getElementsByTagName("video")[0].duration;
            if(!DuringTime){
                alert("无法获取视频时长，请重试");
                return false;
            }
            videoElement.pause();
            videoElement.removeAttribute('src'); // empty source
            videoElement.load();
            if(DuringTime>0){
                safePost($host + '/client/course/setFinished',
                         {
                    "courseId": courseId,
                    "coursewareId": coursewareId,
                    "progress": DuringTime
                },
                         function (res) {
                    if (res.isSuccess) {
                        if (coursewareId == res.data.coursewareId) {
                            var progressHtml = "";
                            progressHtml = "<div class='progress-o'>本集学习进度<i>" + res.data.rateStr + '%' + "</i></div>" +
                                "<div class='progress-t'>" +
                                "<div class='progress-t-0' style='width: " + res.data.rateStr + "%;'></div></div>";
                            $("#progressBar").html(progressHtml);
                            alert("已完成该课程");
                        }
                    }
                })
            }
        }
    });
    document.getElementsByClassName("loc_font")[0].insertBefore(btn,null);
})();
