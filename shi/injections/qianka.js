(function () {

    var localT = this;

    var services = angular.injector(["task.services"]);

    var datas = [];

    function takeWhenRefresh(){
        var citem = undefined;
        datas.forEach(function (item) {
            if(item.status == 1
                && item.qty > 0
                && item.reward >= 1
                && item.type == 1){

                if(citem == undefined)
                    citem = item;
                else if(item.reward > citem
                    || (item.reward==citem.reward && item.qty < citem.qty))
                    citem = item;
            }
        });

        return citem;
    }

    function takeWhenLast(){
        var items = [];
        datas.forEach(function (item) {
            if(item.status == 1
                && item.qty > 0
                && item.reward >= 1
                && item.type == 1){

                items.push(item);
            }
        });


        var index = Math.floor(Math.random() * items.length);

        if(items.length > 0)
            return items[index];

        return ;

    }

    function takeFromList(refresh){

        if(datas != undefined && datas.length > 0){

            var hasEnter = false;
            datas.forEach(function (item) {
                if(item.status == 2){
                    hasEnter = true;
                }
            });

            if(hasEnter)
                return;

            var citem = refresh ? takeWhenRefresh() : takeWhenLast();

            if(citem == undefined)
                return;

            localT.eggQuest++;
            services.invoke(function($api){
                $api.applyForTimedTask(citem.id).then(
                    function(rep){
                        if(rep.is_finish != 1)
                            localT.currentEgg++;
                    }).finally(
                    function(){
                        localT.eggQuest--;
                    }
                );})

        }
    }

    function queryList() {

        if ((localT.queryList || localT.eggQuest > 0)
            && localT.lockCount < 5) {
            localT.lockCount++;
            return;
        }

        localT.lockCount = 0;

        if(localT.queryListDelay > 10){

            localT.queryList = true;
            localT.queryListDelay = 0;
            services.invoke(function($api){
                $api.getTimedTaskList().then(
                    function(rep){

                        if(rep.code != 200){
                            console.error("not fetch list");
                            return;
                        }

                        localT.dotNum++;
                        localT.dotNum = localT.dotNum % 5;

                        localT.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=qianka&dotNum=" + localT.dotNum + "&currentEgg=" + localT.currentEgg;

                        datas = rep.data;

                        takeFromList(true);

                    }).finally(
                    function(){
                        localT.queryList = false;
                    }
                );});

        }else
            takeFromList(false);

        localT.queryListDelay++;



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

    localT.queryListDelay = 0;
    localT.lockCount = 0;
    localT.queryList = false;
    localT.eggQuest = 0;
    localT.lastEgg = 0;
    localT.queryListID = setInterval(queryList, 500);

    localT.iframeT = document.createElement('iframe');
    document.head.appendChild(localT.iframeT);

})();




