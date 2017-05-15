var audio = $('audio');
$(function(){
    var voiceId;
    //头像的点击
    $.each($('.starImg'),function(index){
        $(this).on('tap',function(){
            var id = $(this).attr('data-id');
            getVoice(id);
            voiceId = id;
            showPop('tcc');//弹窗展示
        })
    });

    //声音按钮点击
    $('.voiceWarp').on('tap','.audioBtn',function(){
        playOrPaused(audio[0]);
    });

    //声音按钮点击
    $('.footer').on('tap','.pageOneBtn',function(){
        window.location.href="index.html?id="+voiceId;
    });

})

//弹窗获取对应音乐
function getVoice(id){
    audio.attr('src','http://ziyingpingtai.oss-cn-qingdao.aliyuncs.com/spePic/teamVoice/'+id+'.mp3');
}
//关闭弹窗删除音乐
function removeVoice(){
    audio.attr('src','');
}

//声音点击控制
function playOrPaused(obj){
    var isOk = obj.paused;
    obj.pause();
    obj.currentTime = 0;
    if(isOk){
        obj.play();
        return;
    }
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
    removeVoice();
    document.getElementById(idName).style.display = "none";
} 


