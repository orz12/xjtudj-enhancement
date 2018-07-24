// ==UserScript==
// @name         党建学习平台伪播放3.3(alpha)
// @namespace    http://tampermonkey.net/
// @version      3.3.3
// @description  try to take over the world!
// @author       Dabble
// @match        http://xjtudj.edu.cn/myzone/zone_newStudyPlanDetail.do?classID=*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    var delay = 400; //定时器间隔（毫秒）//推荐200-400。这里为了减轻网络抖动带来的影响，增大了延迟
    var step = 58;//伪播放时长（秒）//请务必不要超过60，否则会导致无法记录//感谢 FLY Studio 使得脚本刷课速度大大增加
    var t = 0;//定时器句柄
    var mode = 0;//mode = 0：刷必修课；mode = 1：刷选修课；
    //var DuringTime = [1799, 1799, 1799, 1799, 2999, 2293, 2836, 1978, 1979, 1979, 1979, 1979, 5072];//必修课所有课程时长（秒）//由于需要向后兼容，该条目不再使用
    function xReload() {
        layer.msg('网络错误稍后将刷新页面！');
        clearInterval(t);
        setTimeout(function(){
            window.location.reload();//页面刷新
        },2000);
    }
    function ajaxReload() {
        var ajax = new XMLHttpRequest();//局部刷新
        ajax.open('get', window.location.href);
        ajax.send();
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4 && ajax.status == 200) {
                var reg = /学习计划详情开始[\s\S]+学习计划详情结束/m;//注释帮大忙了
                var msg;
                if((msg = reg.exec(ajax.responseText)) != null){
                    var doc = document.getElementsByClassName("myself_right")[0];
                    doc.innerHTML = doc.innerHTML.replace(reg, msg[0]);
                }else{
                    window.location.reload();//页面刷新
                    //xReload();
                    return false;
                }
            }
        }
    }
    layer.msg("Trick Started");//游戏开始
    (function foo() {
        var minSetbacks = 100;
        var ParentDiv
        if(mode == 0){//必修
            ParentDiv = document.querySelector("body > div.myself_panl > div.myself_right > div:nth-child(2) > div.right_middle > div:nth-child(1) > div:nth-child(3)");
        }else if (mode == 1){//选修
            ParentDiv = document.querySelector("body > div.myself_panl > div.myself_right > div:nth-child(2) > div.right_middle > div:nth-child(2) > div:nth-child(3)");
        }
        var success = 0;
        var finish = 0;
        for (var i = 0; i < ParentDiv.childElementCount; i++){
            var reg = /\/course\/course_detail\.do\?ccID=(\d+)\&cateID=(\d+)\&courseID=(\d+)\&classID=(\d+)/;
            var a = ParentDiv.children[i].children[4].children[1];//跳过播放完后的“分享”//注：这个貌似只在全部必修课播放完才出现，可优化
            if(!a || !a.href){a = ParentDiv.children[i].children[4].children[0];}//如果没有这个元素，就应该是正确的位置
            if(!a){
                xReload();//打扰了。回炉重造吧。
                return false;
            }
            var setbacks = parseInt(/完成(\d+)%/.exec(ParentDiv.children[i].children[2].innerText)[1]);
            if (setbacks < minSetbacks) {minSetbacks = setbacks;}
            if (setbacks < 1){setbacks = 1;}
            var msg = reg.exec(a.href);
            if(msg == null || msg[4] != /classID=(\d+)/.exec(window.location.href)[1]){//如果无法读取或者班级不对，再回炉重造
                xReload();
                return false;
            }
            var ccID = msg[1];
            var cateID = msg[2];//这个没用到，放在这里纯属美观
            var courseID = msg[3];
            var classID = msg[4];
            var currentTime = parseInt(/已观看\s*(\d+)\s*秒/.exec(ParentDiv.children[i].children[1].innerText)[1]);//兼容选修课。我就不明白了，格式咋这么乱？
            var DuringTime = currentTime * 100/setbacks;
            if (setbacks == 100){
                finish ++;
                if(i + 1 == ParentDiv.childElementCount){
                    ajaxReload();
                }
                if(finish == ParentDiv.childElementCount){
                    layer.msg('Done.');
                    //clearInterval(t);
                    if(mode == 0 && confirm("必修课已经刷完，是否继续刷选修？\nPS：记得看看有没有上传心得的要求，然后生成证书。")){
                        mode = 1;
                        layer.msg('Trick Started');
                        continue;
                    }else{
                        return false;
                    }
                }
                continue;//跳走
            }
            ParentDiv.children[i].children[1].innerText += "+";
            if (currentTime > 0 && DuringTime > 0 && currentTime + 30 > DuringTime && setbacks > 90){//容差//并躲避掉setbacks置1的时候观看时间再次置零的问题
                currentTime = DuringTime;
            } else {
                currentTime = currentTime + Math.floor(Math.random() * step + 1); //随机扰动，防检测
            }
            $.ajax({
                url:'http://xjtudj.edu.cn:80/course/course_updateUserWatchRecord.do',
                type:"POST",
                data:{"courseID":courseID,"watchTime":currentTime,"ccID":ccID,"classID":classID},
                async : false,
                dataType:"json",
                success:function(data){
                    if(data.status != 100)
                    {
                        xReload();
                        return false;
                    }else{
                        success++;
                        ParentDiv.children[i].children[1].innerText += "+";
                        //if(success + finish == ParentDiv.childElementCount){
                        if(i + 1 == ParentDiv.childElementCount){
                            ajaxReload();
                        }
                    }
                },
                error:function(){
                    xReload();
                    return false;
                }
            });
        }
        ParentDiv.parentElement.children[0].innerHTML += minSetbacks + "%"
        t = setTimeout(foo, delay);
    })();
})();
