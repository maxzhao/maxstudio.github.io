(function () {

//放弃所有任务
function giveUpAllTask() {
    var mydata = {
        cmd: "giveupalltask",
        appkey: appkey,
        idfa: idfa,
        adid: adid,
        uuid: uuid,
        version: 5,
        checksum: quickgiveupallchecksum
    };
    $.ajax({
        async: true,
        url: "" + service + "ashx/Quick.ashx",
        type: 'get',
        dataType: 'jsonp',
        jsonp: 'jsonpcallback',
        data: mydata,
        timeout: 5000,
        beforeSend: function () { },
        success: function (json) {

            if (json.success == "true") {
                alert("成功放弃");
                return;
            }
            else {
                alert("放弃失败 请联系客服");
                return;
            }
        },
        complete: function (XMLHttpRequest, textStatus) { },
        error: function (xhr) {
            alert(netWorkError)
        }
    })
}
//获取任务详细信息
function getclicktaskinfo() {
    var mydata = {
        cmd: "getclicktaskinfo",
        appkey: appkey,
        idfa: idfa,
        adid: adid,
        uuid: uuid,
        version: 5,
        checksum: quickinfochecksum
    };
    $.ajax({
        async: true,
        url: "http://api2.adjuz.com/TaskClickInfo/getindex",
        type: 'get',
        dataType: 'jsonp',
        jsonp: 'jsonpcallback',
        data: mydata,
        timeout: 5000,
        beforeSend: function () { },
        success: function (json) {
            if (json.success == "false" )
            {
                // 实验是可以多任务的 ???
                if (json.message == "giveuptask") {//含有其他未完成的任务
                    if (confirm("不可以同时执行多个任务哦，要放弃之前的全部任务吗？")) {//放弃之前所有任务
                        giveUpAllTask();
                    }
                    return;
                }
                else {//其他错误
                    alert("用户验证失败");
                    return;
                }
            }
            if (adid == "10378" || adid == "10387") {
            }
            else {
            }

            adStopMinute = json.stopminute;//记录任务试玩时间
            adclickTime=json.clickgettime;//记录任务拷贝时间
            $("#task_start_success_text").hide();
            $("#adlogo_box").attr('src', json.logo);
            $("#adname_box").html(json.name);
            if (json.desc != null && json.desc != "") {
                $("#addesc_box").html(json.desc.replace("\\n", "<br>").replace("\\n", "<br>").replace("\\n", "<br>"));
            }
            if (json.issearch == true) {
                //有关键字隐藏第一步按钮
            } else {
                //无关键字显示第一步按钮
            } if (json.status == 1) {
                //'任务抢到了，请在' + json.minute + '分钟内完成');
                window.currentEgg++;
                UpdateTime(json.clickgettime, json.minute);
            } else if (json.status == 2) {
                //$("#task_start_success_text").html("任务已超时，请重新抢做")
            }
            else {
            }
        },
        complete: function (XMLHttpRequest, textStatus) { },
        error: function (xhr) {
            alert(netWorkError)
        }
    })
}

    function getPlayItems() {

        if ((window.queryList || window.eggQuest > 0)
            && window.lockCount < 5) {
            window.lockCount++;
            return;
        }

        window.lockCount = 0;

        window.queryList = true;

        var url = adjuzUrl + "&isjijiang=cureenttask";

        $.ajax({
            async: true,
            url: url,
            type: 'get',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            data: null,
            timeout: 3000,
            success: function (json, status, xhr) {
                if (json != null) {

                    window.dotNum++;
                    window.dotNum = window.dotNum % 5;

                    window.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=daren&dotNum=" + window.dotNum + "&currentEgg=" + window.currentEgg;

                    var itemjson = { hasitem: false};
                    if (json.offer.length > 0) {
                        for (var i = 0; i < json.offer.length; i++) {
                            var item = json.offer[i];

                            if (parseFloat(item.status) == 0
                                && parseFloat(item.ad_point) >= 1
                                && parseFloat(item.surplusnum) >= 0
                            ) {
                                itemjson.hasitem = true;
                                itemjson[item.adid] = item;
                            }

                        }

                        if (!itemjson.hasitem)
                            return;
                    }

                    var dataHtml = JSON.stringify(json);

                    xhr.continueCode = true;
                    $.ajax({
                        async: true,
                        url: "/ashx/Ads.ashx",
                        type: 'post',
                        dataType: 'text',
                        data: {advhtml: dataHtml},
                        timeout: 3000,
                        beforeSend: function () {
                        },
                        success: function (json) {

                            if (json != null && json.length > 50 && json.lastIndexOf("=========") > -1) {

                                var items = $(json.replace("=========", ""));

                                items.each(function (i, e) {

                                    var adid = e.data('adid');
                                    var item = itemjson[adid];
                                    if(item != undefined){
                                        if (e.data('isputpaytask') != "0"
                                            && e.data('finished') != "1"
                                            && e.data('finished') != "2") {

                                            item.quickstartchecksum = e.data('quickstartchecksum');
                                            item.quickstartsessionid = e.data('quickstartsessionid');
                                            item.quickgiveupallchecksum = e.data('quickgiveupallchecksum');

                                        }else
                                            delete itemjson[adid];
                                    }

                                });

                                items.remove();

                                // 同步查询info ***** 支持多抢
                                // info 中有任务执行时,退出
                                // 通过info筛选合适任务
                                // 请求

                                var citem = undefined;
                                Object.keys(itemjson).forEach(function (item, index) {
                                     if (citem != undefined) {
                                         if (parseFloat(item.ad_point) > parseFloat(citem.ad_point)
                                         || (parseFloat(item.ad_point) == parseFloat(citem.ad_point)
                                         && parseFloat(item.surplusnum) > parseFloat(citem.surplusnum)))
                                         citem = item;
                                     } else
                                        citem = item;
                                });

                                if(citem != undefined){
                                    window.eggQuest++;
                                        var mydata = {
                                            appkey: appkey,
                                            openudid: "",
                                            sessionid: citem.quickstartsessionid,
                                            idfa: idfa,
                                            adid: citem.adid,
                                            uuid: uuid,
                                            version: 6,
                                            checksum: citem.quickstartchecksum
                                        };
                                        $.ajax({
                                            async: true,
                                            url: "" + service + "ashx/QuickClick.ashx",
                                            type: 'get',
                                            dataType: 'jsonp',
                                            jsonp: 'jsonpcallback',
                                            data: mydata,
                                            timeout: 5000,
                                            success: function (json) {
                                                if (json.success == "true") {
                                                    window.currentEgg++;
                                                }
                                            },
                                            complete: function (XMLHttpRequest, textStatus) {
                                                window.eggQuest--;
                                            },
                                        });
                                }


                            }

                        },
                        complete: function (XMLHttpRequest, textStatus) {
                            window.queryList = false;
                        }
                    });
                }
            },
            complete: function (xhr, textStatus) {
                if (!xhr.continueCode)
                    window.queryList = false;
            }
        }).continueCode = false;


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
    window.dotNum = 0;

    window.lockCount = 0;
    window.queryList = false;
    window.eggQuest = 0;
    window.lastEgg = 0;
    window.queryListID = setInterval(getPlayItems, 500);

    window.iframeT = document.createElement('iframe');
    document.head.appendChild(window.iframeT);

})();


