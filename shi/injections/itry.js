(function(){

    window.btnStatus = function(user_id,order_id,appid,detail_url){
    	$.ajax({
            type : "post",
            url : "/itry/getIsDownApp",
            data : {appid:appid,user_id:user_id},
            dataType: 'text',
            async : false,
            complete : function(xhr) {
            	if(!xhr.continueCode){
            		window.eggQuest--;
            	}
            },
            success : function(back, status, xhr){
            	if(back=="-1"){
            	}else if(isNumber(back)){
            			xhr.continueCode = true;
                	$.ajax({
                        type : "post",
                        url : "/itry/user_click_record",
                        data : {appid:appid,user_id:user_id,order_Id:order_id,type:"app"},
                        dataType: 'text',
                        async : false,
                        complete : function(){
                        	window.eggQuest--;
                        },
                        success : function(num){
                        	if(num=="-1"){
                        	}else if(isNumber(num)){
                        		var val = ''+appid+order_id+user_id;
								setStore(val,new Date().getTime());

                            	window.currentEgg++;
                        	}
                        }
                    });
                }
           	 }  
        }).continueCode = false;
    }


	function getPlayItems(){

        if ((window.queryList || window.eggQuest > 0)
            && window.lockCount < 5){
                window.lockCount++;
            return;
        }

        window.lockCount = 0;

		window.queryList = true;
		window.eggQuest = 0;
		 $.get("/itry/appList?refresh=" + Date.now(), {}, function (back) {

			 window.dotNum++;
			 window.dotNum=window.dotNum % 5;

			 window.iframeT.src = "http://www.tangjoy.com/shi/upload.html?key=itry&dotNum=" + window.dotNum + "&currentEgg=" + window.currentEgg;

        var doc = $(back);	
        var invertELs = doc.find(".app_j");
        if(invertELs.length > 0){
        	invertELs.each(function(i, e){

				try{
					var priceEls = $("span.price", e);
					if(priceEls.length > 0){
						var pid = priceEls[0].id;
						var money = parseInt(priceEls[0].textContent.replace('+', '').replace('元',''));
						var dateClick = getStore(pid)
						if(typeof(dateClick)!="undefined" || money < 1)
							return
					}
				}catch(e){}

                window.eggQuest++;
        		e.onclick();
        	});
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