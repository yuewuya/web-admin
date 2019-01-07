const backHost = "http://127.0.0.1:8888";

var token = localStorage.getItem("token");
if (!token || token == null) {
    // parent.location.href = '/login.html';
    token = '3b704f9e62812bef9881514a89f5ee20';
}

//jquery全局配置
$.ajaxSetup({
    dataType: "json",
    cache: false,
    headers: {
        "token": token
    },
    complete: function (xhr) {
        if (xhr.responseText != undefined && JSON.parse(xhr.responseText).code == 401) {
            parent.location.href = baseURL + 'login.html';
        }
        if (xhr.responseJSON == undefined) {
            return;
        }
        if (xhr.responseJSON.code == 401) {
            parent.location.href = baseURL + 'login.html';
        }
    }
});

/**
 * ajax通讯
 */
function ajaxPostInvoke(url, JsonData, SuccessFun) {
    $.ajax({
        type: 'POST',
        url: backHost + url,
        data: JSON.stringify(JsonData),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            console.log('开始通讯');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            layer.alert("和后台通讯失败！" + textStatus + jqXHR.status + jqXHR.readyState, {icon: 2});
        },
        success: function (result) {
            if (result.msg == 'success' && result.code == 0) {
                SuccessFun(result.data);
            } else {
                layer.alert(result.msg, {icon: 2});
            }
        }
    });
}

/**
 * ajax通讯
 */
function ajaxGetInvoke(Url, param, SuccessFun) {
    let getUrl = '';
    if (param == null) {
        getUrl = backHost + Url;
    } else {
        getUrl = backHost + Url + "/" + param;
    }
    $.ajax({
        type: 'get',
        url: getUrl,
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function () {
            console.log('开始通讯');
        },
        headers: {
            "token": token
        },
        error: function (jqXHR, textStatus, errorThrown) {
            layer.alert("和后台通讯失败！" + textStatus + jqXHR.status + jqXHR.readyState, {icon: 2});
        },
        success: function (result) {
            if (result.msg == 'success' && result.code == 0) {
                SuccessFun(result);
            } else {
                layer.alert(result.msg, {icon: 2});
            }
        }
    });
}

/**
 * 获取表单数据
 */
(function ($) {
    $.fn.getData = function () {
        let serializeObj = {};
        $(this.serializeArray()).each(function () {
            if (isAdDate(this.value)) {
                console.log(this.name + ":是日期格式！");
                serializeObj[this.name] = moment(this.value).format("YYYY-MM-DD HH:mm:ss");
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        let $radio = $('input[type=radio],input[type=checkbox]', this);
        $.each($radio, function () {
            if ($("input[name='" + this.name + "']:checked").length == 0) {
                serializeObj[this.name] = 0;
            }
        });
        return serializeObj;
    };
})(jQuery);

/**
 * 
 * 自动填充表单
 */
function loadData(jsonStr){
	var obj = eval("("+jsonStr+")");
	var key,value,tagName,type,arr;
	for(x in obj){
		key = x;
		value = obj[x];
		
		$("[name='"+key+"'],[name='"+key+"[]']").each(function(){
			tagName = $(this)[0].tagName;
			type = $(this).attr('type');
			if(tagName=='INPUT'){
				if(type=='radio'){
					$(this).attr('checked',$(this).val()==value);
				}else if(type=='checkbox'){
					arr = value.split(',');
					for(var i =0;i<arr.length;i++){
						if($(this).val()==arr[i]){
							$(this).attr('checked',true);
							break;
						}
					}
				}else{
					$(this).val(value);
				}
			}else if(tagName=='SELECT' || tagName=='TEXTAREA'){
				$(this).val(value);
			}
			
		});
	}
}

/**
 * 
 * 初始化layui表格
 */
function initLayTbl(tableItem){
    // let tableId = tableItem.id && tableItem.id != '' ? tableItem.id : 'dg';
    let laydg = layui.table.render({
        elem: '#' + (tableItem.id || 'dg'),
        method : 'post', 
        contentType: 'application/json',
        headers: {'token': token},
        url : backHost + tableItem.url,
        where: tableItem.param,
        parseData: function(res){
            if(res && res.code == 0){
                return {
                    "code": 0,
                    "msg": '',
                    "count": res.data.totalCount,
                    "data": res.data.list
                  };
            }else {
                return {
                    "code": res.code,
                    "msg": res.msg,
                    "count": 0,
                    "data": []
                  };
            }
          },
        cellMinWidth : 95,
        height : tableItem.height || 532,
        page : tableItem.page || true,
        limit : tableItem.limit || 10,
        limits : tableItem.limits || [10,20,50,100],
        id : tableItem.tblId || "layTbl",
        cols : tableItem.col,
        toolbar: '#' + (tableItem.tableItem || 'toolbar')
        // toolbar: 'default'
    });
    return laydg;
}

/**
 * 重载layui表格
 */
function reloadTbl(param, otherTbl){
    layui.table.reload(otherTbl || "layTbl",{
        page: {curr: 1},
        where: param
    })
}

function isAdDate(d) {
    let regx = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!regx.test(d)) {
        return false;
    }
    else {
        return true;
    }
}

function getDateRange(a){
    if(a && a != ''){
        let res = [];
        res.push(a.split(" - ")[0] + ' 00:00:00');
        res.push(a.split(" - ")[1] + ' 23:59:59');
        return res;
    }else {
        return ['', '']
    }
}
