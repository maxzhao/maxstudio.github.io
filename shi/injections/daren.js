(function () {

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

                    var dataHtml = undefined;
                    if (json.offer.length > 0) {
                        var citem = undefined;
                        for (var i = 0; i < json.offer.length; i++) {
                            var item = json.offer[i];
                            if (parseFloat(item.status) != 0)
                                return;

                            if (parseFloat(item.ad_point) >= 1
                                && parseFloat(item.surplusnum) >= 0
                            ) {
                                if (citem != undefined) {
                                    if (parseFloat(item.ad_point) > parseFloat(citem.ad_point)
                                        || (parseFloat(item.ad_point) == parseFloat(citem.ad_point)
                                        && parseFloat(item.surplusnum) > parseFloat(citem.surplusnum)))
                                        citem = item;
                                } else
                                    citem = item;
                            }

                        }

                        if (citem != undefined) {
                            json.offer = [citem];
                            dataHtml = JSON.stringify(json);
                        }
                    }

                    if (dataHtml == undefined)
                        return;


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

                                items.forEach(function (i, e) {

                                    if (e.data('isputpaytask') != "0"
                                        && e.data('finished') != "1"
                                        && e.data('finished') != "2") {

                                        var adid = e.data('adid');
                                        var quickstartchecksum = e.data('quickstartchecksum');
                                        var quickstartsessionid = e.data('quickstartsessionid');


                                        window.eggQuest++;
                                        var mydata = {
                                            appkey: appkey,
                                            openudid: "",
                                            sessionid: quickstartsessionid,
                                            idfa: idfa,
                                            adid: adid,
                                            uuid: uuid,
                                            version: 6,
                                            checksum: quickstartchecksum
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

                                });

                                items.remove();

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


