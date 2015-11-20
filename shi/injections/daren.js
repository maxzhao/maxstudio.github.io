(function () {

    var searchFlags = {};
    var takeFlags = {};

    function takeTask(item) {

        window.eggQuest++;
        var mydata = {
            appkey: appkey,
            openudid: "",
            sessionid: item.quickstartsessionid,
            idfa: idfa,
            adid: citem.adid,
            uuid: uuid,
            version: 6,
            checksum: item.quickstartchecksum
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

                searchState.done = true;
            },
            complete: function (XMLHttpRequest, textStatus) {
                window.eggQuest--;
            },
        });

    }

//获取任务详细信息
    function getTaskInfo() {
        searchFlags[adid] = {
            rstate: 0, issearch: false, searching: true, tryNum: 0, done: false
        };

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
            beforeSend: function () {
            },
            success: function (json) {

                var rstate = 0;
                if (json.success == "false") {
                    if (json.message == "giveuptask")
                        rstate = 2;
                    else
                        rstate = 1;
                }

                searchFlags[adid].rstate = rstate;
                searchFlags[adid].issearch = json.issearch;

            },
            complete: function (XMLHttpRequest, textStatus) {
                searchFlags[adid].searching = false;
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

                    var itemjson = {hasitem: false};
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
                                    if (item != undefined) {
                                        if (e.data('isputpaytask') != "0"
                                            && e.data('finished') != "1"
                                            && e.data('finished') != "2") {

                                            item.quickstartchecksum = e.data('quickstartchecksum');
                                            item.quickstartsessionid = e.data('quickstartsessionid');
                                            item.quickgiveupallchecksum = e.data('quickgiveupallchecksum');

                                        } else
                                            delete itemjson[adid];
                                    }

                                });

                                items.remove();

                                // 同步查询info ***** 支持多抢
                                // info 中有任务执行时,退出
                                // 通过info筛选合适任务
                                // 请求

                                Object.keys(itemjson).forEach(function (item, index) {

                                    if (item.quickstartchecksum != undefined) {

                                        var searchState = searchFlags[item.adid];
                                        if (searchState == undefined
                                            || (searchState.searching && searchState.tryNum > 5))
                                            getTaskInfo(item);
                                        else {

                                            if (searchState.searching)
                                                searchState.tryNum++;
                                            else {

                                                if (searchState.rstate == 0
                                                    && !searchState.issearch) {

                                                    if (takeFlags[item.adid] == undefined)
                                                        takeFlags[item.adid] = {done: false, taking: true, tryNum: 0};

                                                    var takeFlag = takeFlags[item.adid];

                                                    if (!takeFlag.done) {
                                                        if (takeFlag.taking)
                                                            takeFlag.tryNum++;

                                                        if (!takeFlag.taking
                                                            || takeFlag.tryNum > 5) {
                                                            takeFlag.tryNum = 0;

                                                            takeTask(item);
                                                        }
                                                    }

                                                }

                                            }


                                        }
                                    }

                                });

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


