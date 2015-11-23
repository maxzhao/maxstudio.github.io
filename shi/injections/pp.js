(function () {

    var localT = this;

    function startFastTask(id) {

        ppApp.getDeviceInfo();

        var data = ppApp.deviceInfo;
        data.fast_id = id;

        localT.eggQuest++;
        $$.ajax({
            method: "POST",
            url: "/index.php/fasttask/startTask",
            dataType: "json",
            data: data,
            success: function (n) {
                if (1 == n.result) {
                    localT.currentEgg++;
                }
                else if (n.code && 10104 == n.code) {
                    var a = "/index.php/user/bindPhone";
                    mainView.router.loadPage(a)
                } else
                    pp.alert(n.errormsg)
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
                doc.find(".active").each(function(i,e){

                    e = $$(e);

                    if(!e.hasClass("webtask")){
                        var task = {};

                        task.id = e.data("id");
                        task.money = parseFloat(e.data("amount"));
                        task.num = 0;
                        try{
                            e.find(".item-subtitle").each(function(i,ne){
                                ne = $$(ne);
                                var numText = ne.text();
                                if(numText.indexOf("剩余") != -1){
                                    task.num = parseInt(numText.replace("剩余","").replace("份", ""));
                                }
                            });

                        }catch(e){}

                        ctasks.push(task);
                    }
                });

                doc.remove();

                var citem = undefined;
                var hasChosse = false;
                ctasks.forEach(function(item){
                    if(item.num > 0
                        && item.money >= 1){

                        if(citem == undefined)
                            citem = item;
                        else if(item.money > citem.money
                            || (item.money == citem.money && item.num < citem.num))
                            citem = item;
                    }
                });

                if(!hasChosse && citem != undefined)
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


