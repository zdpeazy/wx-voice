function loaded () {
    myScroll = new iScroll('voiceBox', {
        hScrollbar:false,  //禁止横向滚动
        vScroll:true, 
    });
}
window.onload=loaded;

$(function(){
    var msg;
    var START,END;
    var recordTimer;
    var isPlay = true;
    var recordBtn = $('.recordBtn');
    var voiceBox = $('.voiceBox');
    var newVoiceBox = $('.voiceWarp');
    var pageTwoBtn = $('.pageTwoBtn');

    setVoice();

    //微信注入配置信息
    /*wx.config({
        debug: true, 
        appId: appid,
        timestamp: timestamp, 
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: [
            'checkJsApi', 
            'onMenuShareTimeline', 
            'onMenuShareAppMessage', 
            'onMenuShareQQ', 
            'onMenuShareWeibo',
            'playVoice'
        ]
    });*/
    
    //获取登陆的用户信息
    /*(function insertConfig(){
        $.ajax({
            url: '/20170017/weCharInfo',
            type: 'get',
            cache: false,
            success: function(res){
                var userInfo = res;
            }
        })
    })();*/

    //获取服务器此次活动所有的录音，罗列到voiceBox上
    function setVoice(){
        $.ajax({
            url: './data/data.json',
            type: 'post',
            cache: false,
            success: function(res){
                var data = res.data;
                for(var i=0;i<data.length;i++){
                    insertVoiceBox(res.data[i].userImgUrl,res.data[i].serverId,res.data[i].voiceUrl);
                };
                tapAudio();
            }
        })
    }

    //音频播放
    function tapAudio(){
        var audios = $('audio');
        $.each($('.voiceBtn'),function(index){
            $(this).on('tap',function(){
               var audio = audios[index];
                playOrPaused(audio);
            })
        })
    }

    //播放开关
    function playOrPaused(obj){
        var isOk = obj.paused;
        offAllVoice();
        if(isOk){
            obj.play();
            return;
        }
    }

    //停止所有的音乐
    function offAllVoice(){
        $.each($("audio"),function(){
            $(this)[0].pause();
            $(this)[0].currentTime = 0;
        })
    }

    //开始录音
    recordBtn.on('touchstart',function(event){
        changeActive($(this),'pressDown');
        event.preventDefault();
        START = new Date().getTime();
        recordTimer = setTimeout(function(){
            wx.startRecord({
                success: function(){
                    alert('用户同意授权录音');
                },
                cancel: function () {
                    alert('用户拒绝授权录音');
                }
            });
        },300);
    })

    //录音结束
    recordBtn.on('touchend',function(event){
        changeActive($(this),'pressUp')
        event.preventDefault();
        END = new Date().getTime();
        if((END - START) < 1000){
            END = 0;
            START = 0;
            //小于1s，不录音
            clearTimeout(recordTimer);
        }else{
            showPop('tcc');
            newVoice('');
            affirmBtn('');
            wx.stopRecord({
              success: function (res) {
                var voiceLocalId = res.localId;
                showPop('tcc');
                newVoice(voiceLocalId);
                affirmBtn(voiceLocalId);
              },
              fail: function (res) {
                alert(JSON.stringify(res));
              }
            });
        }
    })

    //当前录音试听
    function newVoice(voiceLocalId) { 
        newVoiceBox.on('tap','.newVoiceBtn',function(voiceLocalId){
            var voiceId = $(this).val();
            if(isPlay){
                playVoice(voiceLocalId);
                alert('播放'+voiceId+'成功');
            }else{
                stopVoice(voiceLocalId);
                alert('暂停'+voiceId+'成功');
            }
            
        })
    }

    //确定按钮
    function affirmBtn(voiceLocalId){
        pageTwoBtn.on('tap',function(voiceLocalId){
            uploadVoice(voiceLocalId);
            hidePop('tcc');
        })
    }
    
    //上传录音
    function uploadVoice(voiceLocalId){
        wx.uploadVoice({
            localId: voiceLocalId, 
            isShowProgressTips: 1, 
            success: function (res) {
                var serverId = res.serverId; // 返回音频的服务器端ID
                downloadVoice(serverId);
            }
        });
    }   

    //获取刚刚的录音
    function downloadVoice(serverId){
        wx.ready(function(){
            wx.downloadVoice({
                serverId: serverId, 
                isShowProgressTips: 1, 
                success: function (res) {
                   var localId = res.localId;
                   insertVoiceBox(localId, localId,'');
                }
            });
        });
    }

    //微信jdk播放音乐
    function playVoice(voiceLocalId){
        wx.playVoice({
            localId:  voiceLocalId,
        });
        isPlay = false;
    }

    //微信jdk暂停音乐
    function stopVoice(voiceLocalId){
        wx.stopVoice({
            localId: voiceLocalId, 
        });
        isPlay = true;
    }
    
    wx.ready(function(){
        wx.onMenuShareTimeline(content);
        wx.onMenuShareAppMessage(content);
    });

    wx.error(function(res){
        console.log(res);
    });

    //微信分享内容
    var content = {
        title: '《我想和你唱》', 
        link: '', 
        imgUrl: 'http://ziyingpingtai.oss-cn-qingdao.aliyuncs.com/spePic/wantToMeetYou/logo.jpg', 
        desc: "《我想和你唱》，不止仰望，还可对唱！",
        success : function(){
            msg = '分享成功';
        },
        cancel: function(){
            msg = '取消分享';
        }
    }



})

//录音按钮的样式
function changeActive(ele,status){
    if(status == 'pressDown'){
        ele.addClass('active').text('松开 结束');
    }else if(status == 'pressUp'){
        ele.removeClass('active').text('按住 开始');
    }
}

//初始化插入所有音频
function insertVoiceBox(userImgUrl, serverId, voiceUrl){
    var $li = $('<li class="clearfix" data-id="'+serverId+'"><img src="'+userImgUrl+'"/><input class="voiceBtn" type="button" value="'+serverId+'" name="voice" /><audio preload="preload" src="'+voiceUrl+'" loop=""></audio></li>');
    $('.voiceBox ul').append($li);
}


//屏蔽输入，显示蒙板
function showMask(idName) {
    var obj = document.getElementById(idName);
    obj.style.width = document.body.clientWidth;
    obj.style.height = document.body.clientHeight;
    obj.style.display = "block";
}
//隐藏蒙板

function hideMask(idName) {
    document.getElementById(idName).style.display = "none";
}

//显示弹框
function showPop(idName) {
    showMask('mask');
    var width = 12;
    var height = 6;  
    var obj = document.getElementById(idName);
    obj.style.display = "block";
    obj.style.position = "absolute";
    obj.style.zindex = "10";
    obj.style.overflow = "hidden";
    obj.style.width = width + "rem";
    obj.style.height = height + "rem";
    obj.style.top = '50%';
    obj.style.left = '50%';
    obj.style.marginLeft = -width/2 + 'rem';
    obj.style.marginTop = -height/2 + 'rem';

}

//隐藏模板
function hidePop(idName) {
    hideMask('mask');
    //removeVoice();
    document.getElementById(idName).style.display = "none";
} 
