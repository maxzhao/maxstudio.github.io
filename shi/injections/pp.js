(function () {

    var localT = this;
    var takes = [];

    function startFastTask(id) {

        var c = new Date();

        var data = {
            app_name: "sleepmusic",
            bid: "1ceb72470ba849a25dc9f8fa0d2ce06528ddd3dd",
            boot_time: "2015-11-24 14:36:40",
            bssid: "14:10:9f:d8:3d:c3",
            channel: "AppStore",
            dataline: 1,
            device_token: "a649888db8a34619d183cd3e117aa36fbaaa3cd911c9e1f423a1a5a0e25ee4f7",
            did: "",
            disk_id: "0D2BBEE1E472CC619C1E9FA19539FA0B",
            idfa: "0F1A1CB6-5B3F-46E3-AB81-F372072C7AE5",
            idfv: "156534E8-4446-4AA7-B86B-E34395073925",
            jailbreak: false,
            luminance: 50267,
            opcode: "46011cn",
            openudid: "e3be54c30970d938863f622853ec97cf79156d50",
            platform: "iPhone",
            platform_model: "iPhone 6s",
            stamp: c.getFullYear() + "-" + c.getMonth() + "-" + c.getDate() + " " + c.getHours() + ":" + c.getMinutes() + ":" + c.getSeconds() ,
            system_version: "9.1",
            version: "1.0.3"
        }
        data.fast_id = id;

        localT.eggQuest++;
        $$.ajax({
            method: "POST",
            url: "/index.php/fasttask/startTask",
            dataType: "json",
            data: data,
            beforeSend : function(e) {
                e.setRequestHeader("PP-Requested-With", "XMLHttpRequest"), e.setRequestHeader("sign", data.idfa.split("").reverse().join("").split("-")[0] + "-" + + new Date)
            },
            success: function (n) {
                if (1 == n.result) {
                    if(takes.indexOf(id) == -1){
                        takes.push(id);
                        localT.currentEgg++;
                    }
                }
            }, complete: function (XMLHttpRequest, textStatus) {
                localT.eggQuest--;
            }
        });
    }


    function queryList() {

        if ((localT.queryList || localT.eggQuest > 0)
            && localT.lockCount < 5) {
            localT.lockCount++;
            return;
        }

        localT.lockCount = 0;
        localT.eggQuest = 0;

        localT.queryList = true;


        $$.ajax({
            method: "GET", url: "/index.php/fasttask/index", dataType: "html",
            success: function (html) {

                localT.dotNum++;
                localT.dotNum = localT.dotNum % 5;

                localT.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=pp&dotNum=" + localT.dotNum + "&currentEgg=" + localT.currentEgg;


                var ctasks = [];

                var doc = $$(html);
                doc = $$(doc[doc.length - 1]);

                var hasChosse = doc.find("li.reserved").length > 0;

                if (hasChosse)
                    return;


                doc.find(".active").each(function (i, e) {

                    e = $$(e);

                    if (!e.hasClass("webtask")) {
                        var task = {};

                        task.id = e.data("id");
                        task.money = parseFloat(e.data("amount"));
                        task.num = 0;
                        try {
                            e.find(".item-subtitle").each(function (i, ne) {
                                ne = $$(ne);
                                var numText = ne.text();
                                if (numText.indexOf("剩余") != -1) {
                                    task.num = parseInt(numText.replace("剩余", "").replace("份", ""));
                                }
                            });

                        } catch (e) {
                        }

                        ctasks.push(task);
                    }
                });

                doc.remove();

                var citem = undefined;
                ctasks.forEach(function (item) {
                    if (item.num > 0
                        && item.money >= 1) {

                        if (citem == undefined)
                            citem = item;
                        else if (item.money > citem.money
                            || (item.money == citem.money && item.num < citem.num))
                            citem = item;
                    }
                });

                if (citem != undefined)
                    startFastTask(citem.id);

            }, complete: function (XMLHttpRequest, textStatus) {
                localT.queryList = false;
            }
        });

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


