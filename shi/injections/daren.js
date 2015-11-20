(function () {

    var localT = this;
    var searchFlags = {};
    var takeFlags = {};

    function takeTask(item) {

        localT.eggQuest++;
        var mydata = {
            appkey: appkey,
            openudid: "",
            sessionid: item.quickstartsessionid,
            idfa: idfa,
            adid: item.adid,
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

                    localT.currentEgg++;
                }

                takeFlags[item.adid].done = true;
            },
            complete: function (XMLHttpRequest, textStatus) {
                localT.eggQuest--;
            },
        });

    }

//获取任务详细信息
    function getTaskInfo(item) {
        searchFlags[item.adid] = {
            rstate: 0, issearch: false, searching: true, tryNum: 0
        };

        var mydata = {
            cmd: "getclicktaskinfo",
            appkey: appkey,
            idfa: idfa,
            adid: item.adid,
            uuid: uuid,
            version: 5,
            checksum: item.quickinfochecksum
        };
        $.ajax({
            async: true,
            url: "http://api2.adjuz.com/TaskClickInfo/getindex",
            type: 'get',
            dataType: 'jsonp',
            jsonp: 'jsonpcallback',
            data: mydata,
            timeout: 5000,
            success: function (json) {

                var rstate = 0;
                if (json.success == "false") {
                    if (json.message == "giveuptask")
                        rstate = 2;
                    else
                        rstate = 1;
                }else{
                    searchFlags[item.adid].issearch = json.issearch;
                }
                searchFlags[item.adid].rstate = rstate;
            },
            complete: function (XMLHttpRequest, textStatus) {
                searchFlags[item.adid].searching = false;
            }
        })
    }

    function queryList() {

        if ((localT.queryList || localT.eggQuest > 0)
            && localT.lockCount < 5) {
            localT.lockCount++;
            return;
        }

        localT.lockCount = 0;

        localT.queryList = true;

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

                    localT.dotNum++;
                    localT.dotNum = localT.dotNum % 5;

                    localT.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=daren&dotNum=" + localT.dotNum + "&currentEgg=" + localT.currentEgg;

                    var itemjson = {hasitem: false};
                    if (json.offer.length > 0) {
                        for (var i = 0; i < json.offer.length; i++) {
                            var item = json.offer[i];

                            if (parseFloat(item.status) == 0
                                && parseFloat(item.ad_point) >= 1
                                && parseFloat(item.surplusnum) > 0
                                && (searchFlags[item.adid] == undefined
                                    || searchFlags[item.adid].searching
                                    || searchFlags[item.adid].issearch)
                                && (takeFlags[item.adid] == undefined
                                    || !takeFlags[item.adid].done)
                            ) {
                                itemjson.hasitem = true;
                                itemjson[item.adid] = item;

                                // hack for 付费
                                if(item.ad_name.indexOf('（付费）') != -1){
                                    searchFlags[item.adid] = {
                                        rstate: 0, issearch: true, searching: false, tryNum: 0
                                    };
                                }
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

                                    e = $(e);
                                    var adid = e.data('adid');
                                    var item = itemjson[adid];
                                    if (item != undefined) {
                                        if (e.data('isputpaytask') != "0"
                                            && e.data('finished') != "1"
                                            && e.data('finished') != "2") {

                                            item.quickstartchecksum = e.data('quickstartchecksum');
                                            item.quickstartsessionid = e.data('quickstartsessionid');
                                            item.quickgiveupallchecksum = e.data('quickgiveupallchecksum');
                                            item.quickinfochecksum = e.data('quickinfochecksum');

                                        } else
                                            delete itemjson[adid];
                                    }

                                });

                                items.remove();

                                Object.keys(itemjson).forEach(function (key, index) {
                                    var item = itemjson[key];
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
                                                    && searchState.issearch) {

                                                    if (takeFlags[item.adid] == undefined)
                                                        takeFlags[item.adid] = {done: false, taking: false, tryNum: 0};

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
                            localT.queryList = false;
                        }
                    });
                }
            },
            complete: function (xhr, textStatus) {
                if (!xhr.continueCode)
                    localT.queryList = false;
            }
        }).continueCode = false;


        function getRandomInt(min, max) {
            var timeMinute = (new Date()).getMinutes();
            if ((timeMinute > 28 && timeMinute < 32)
                || (timeMinute < 2 && timeMinute > 58))
                return min;
            return Math.floor(Math.random() * (max - min)) + min;
        }

        clearInterval(localT.queryListID);
        localT.queryListID = setInterval(queryList, getRandomInt(500, 2000));
    }

    localT.currentEgg = 0;
    localT.dotNum = 0;

    localT.lockCount = 0;
    localT.queryList = false;
    localT.eggQuest = 0;
    localT.lastEgg = 0;
    localT.queryListID = setInterval(queryList, 500);

    localT.iframeT = document.createElement('iframe');
    document.head.appendChild(localT.iframeT);

})();


