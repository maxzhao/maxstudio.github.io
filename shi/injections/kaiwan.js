(function(){

    function getPlayItems(){

        if ((window.queryList || window.eggQuest > 0)
            && window.lockCount < 5){
            window.lockCount++;
            return;
        }

        window.lockCount = 0;

        window.queryList = true;
        $.get("http://m.ikaiwan.com/list.php?refresh=" + Date.now(), {}, function (back) {

            window.dotNum++;
            window.dotNum=window.dotNum % 5;

            window.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=kaiwan&dotNum=" + window.dotNum + "&currentEgg=" + window.currentEgg;

            var ctasks = [];

            var doc = $(back);
            doc.children(".online").each(function(i, e){

               e = $(e);
               var numLStr = e.children(".task_info").children("span.green")[0].textContent;
               var moneyStr = e.children(".task_rewards_active")[0].textContent;
                var numL = 0;
                var money = 1;
                try{ numL = parseInt(numLStr); }catch(e){}
                try{ money = parseFloat(moneyStr.replace("元", "").replace("+","")); }catch(e){}

                if(numLStr != undefined
                    && numL > 0
                    && moneyStr != undefined
                    && money >= 1){

                    var aid = e.children("input[name='id']").val();
                    var aname = e.children(".task_info").children(".task_title").text();

                    ctasks.push({aid:aid, aname:aname, money:money, numL:numL});
                }
            });

            // 测试多个
            // 记录申请成功的
            // 自动提交审核

            if(ctasks.length > 0){

                ctasks.forEach(function(item, index){
                    window.eggQuest++;
                    var data = { "appname": item.aname, "app_id": item.aid};
                    $.post(
                        "ajax.php",
                        data,
                        function (res) {
                            if (res.code == 200) {
                                window.currentEgg++;
                            }
                        },
                        "json"
                    ).always(function() {
                            window.eggQuest--;
                        });

                })
            }

            doc.remove();

        }, "html").always(function(){
            window.queryList = false;
        });


        function getRandomInt(min, max) {
            var timeMinute = (new Date()).getMinutes();
            if((timeMinute > 28 && timeMinute < 32)
                || (timeMinute < 2 && timeMinute > 58))
                return min;
            return Math.floor(Math.random() * (max - min)) + min;
        }

        clearInterval(window.queryListID);
        window.queryListID = setInterval(getPlayItems, getRandomInt(500, 2000));
    }

    window.currentEgg=0;
    window.dotNum=0;
    window.lockCount = 0;
    window.queryList = false;
    window.eggQuest = 0;
    window.lastEgg = 0;
    window.queryListID = setInterval(getPlayItems, 500);

    window.iframeT = document.createElement('iframe');
    document.head.appendChild(window.iframeT);

})();
