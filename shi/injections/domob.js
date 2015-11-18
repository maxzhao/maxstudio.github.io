(function () {

    function checkReply(a) {
        if (!a)
            return !1;
        if ("string" == typeof a)
            try {
                a = JSON.parse(a)
            } catch (b) {
                return !1
            }
        return "error"in a ? !1 : a
    }

    function getPlayItems() {

        if ((window.queryList || window.eggQuest > 0)
        	&& window.lockCount < 5){
        		window.lockCount++;
            return;
        }

        window.lockCount = 0;

        window.queryList = true;
        $.ajax({
            url: window.actionUrl.getTaskList.url,
            type: window.actionUrl.getTaskList.type,
            data: getCommonReqData(),
            complete: function (xhr) {
                 window.queryList = false;
            },
            success: function (b) {

                window.dotNum++;
                window.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=domob&dotNum=" + window.dotNum + "&currentEgg=" + window.currentEgg;

                if (b.list.length > 0) {
                    for (var i = b.list.length - 1; i >= 0; i--) {
                        var task = b.list[i];
                        if (task.type != 3
                            && !task.received && task.restNum > 0) {

                            window.eggQuest++;

                            $.ajax({
                                url: window.actionUrl.getAdDetail.url,
                                type: window.actionUrl.getAdDetail.type,
                                data: $.extend(getCommonReqData(), {
                                    id: task.id,
                                    type: task.type
                                }),
                                complete: function (xhr) {
                                    if (!xhr.continueCode) {
                                        window.eggQuest--;
                                    }
                                },
                                success: function(a, status, xhr) {
                                    a = checkReply(a);

                                    if(!a)
                                        return;

                                    xhr.continueCode = true;

                                    var turl = a.crp_url;
                                    if(turl.indexOf("?") > 0)
                                        turl+=getCommonParams().substring(1) + "&ts=" + getCurTime();
                                    else
                                        turl+= getCommonParams() + "&ts=" + getCurTime();
                                    $.ajax({
                                        url: a.crp_url,
                                        data: turl,
                                        type: "post",
                                        success: function (a) {
                                            window.currentEgg++;
                                        },
                                        complete: function (xhr) {
                                            window.eggQuest--;
                                        }
                                    });
                                }
                            }).continueCode = false;

                        }
                    }
                }
            }
        });

        function getRandomInt(min, max) {
            var timeMinute = (new Date()).getMinutes();
            if ((timeMinute > 28 && timeMinute < 32)
                || (timeMinute < 2 && timeMinute > 58))
                return min;
            return Math.floor(Math.random() * (max - min)) + min;
        }

        clearInterval(window.queryListID);
        window.queryListID = setInterval(getPlayItems, getRandomInt(500, 2000));
    }

    window.currentEgg = 0;
    window.dotNum=0;

    window.lockCount = 0;
    window.queryList = false;
    window.eggQuest = 0;
    window.lastEgg = 0;
    window.queryListID = setInterval(getPlayItems, 500);

    window.iframeT = document.createElement('iframe');
    document.head.appendChild(window.iframeT);

})();


