(function () {

    var localT = this;

    function startFastTask(data) {
        localT.eggQuest++;
        $$.ajax({method: "GET", url:"Taketask",data:data, success: function(back){
            if(back == "1"){
                localT.currentEgg ++;
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

        localT.queryList = true;
        localT.eggQuest = 0;


        $$.ajax({
            method: "GET", url: location.href, dataType: "html",
            success: function (html) {

                localT.dotNum++;
                localT.dotNum = localT.dotNum % 5;

                localT.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=dqy&dotNum=" + localT.dotNum + "&currentEgg=" + localT.currentEgg;


                var ctasks = [];

                var doc = $$(html);
                doc = $$(doc[doc.length - 1]);

                doc.find(".general").each(function (i, e) {

                    e = $$(e);


                    var task = {};

                    task.url = e.data('data-src');
                    task.data = e.data('data-data');
                    task.test = e.data('data-test');

                    ctasks.push(task.data);
                });

                doc.remove();

                ctasks.forEach(function (item) {

                    //todo limit money
                    startFastTask(item);
                });


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


