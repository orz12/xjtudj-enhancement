# xjtudj-enhancement
党建平台刷课脚本




您可以为本页面添加一个书签，然后将该书签的网址全部替换为如下的一行内容（注：使用快捷键 Ctrl+Shift+B，可显示浏览器书签栏；使用快捷键 Ctrl+D，可添加书签）；之后，只需在课程播放界面点击该书签即可。

`javascript:void ((function(){var reg=/course_detail\.html\?navId=course_list\&courseId=([a-z0-9]{32})\&coursewareId=([a-z0-9]{32})$/;var msg=reg.exec(window.location.href);if(msg!=null){var courseId=msg[1];var coursewareId=msg[2];var videoElement=document.getElementsByTagName("video")[0];if(!videoElement){alert("无法找到播放器，请重试");return false}var DuringTime=document.getElementsByTagName("video")[0].duration;if(!DuringTime){alert("无法获取视频时长，请重试");return false}videoElement.pause();videoElement.removeAttribute("src");videoElement.load();if(DuringTime>0){safePost($host+"/client/course/setFinished",{"courseId":courseId,"coursewareId":coursewareId,"progress":DuringTime},function(res){if(res.isSuccess){if(coursewareId==res.data.coursewareId){var progressHtml="";progressHtml="<div class='progress-o'>本集学习进度<i>"+res.data.rateStr+"%"+"</i></div>"+"<div class='progress-t'>"+"<div class='progress-t-0' style='width: "+res.data.rateStr+"%;'></div></div>";$("#progressBar").html(progressHtml);alert("已完成该课程")}}})}}})());`
