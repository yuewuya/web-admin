layui.use(['form','layer','laydate','table','laytpl'],function(){
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        table = layui.table;

    laydate.render({
        elem: '#dateRange'
        ,range: true
    });

    form.on('submit(searchBtn)', function(data){
        let param = data.field;
        param.startTime = getDateRange(param.dateRange)[0];
        param.endTime = getDateRange(param.dateRange)[1];
        reloadTbl(param);
        return false;
    });

    let tableItem = {
        url: '/processCard/ftCard/findAll', 
        col:[[
            {type: "checkbox", fixed:"left"},
            {field: 'code', title: '指令号', align:"center"},
            {field: 'shape', title: '形状', align:"center"},
            {field: 'material', title: '材质', align:'center'},
            {field: 'status', title: '状态',  align:'center',
                templet:function(row){
                    if(row.status == 1){
                        return '<span class="layui-red">已审核</span>';
                    }else if(row.status == 0){
                        return '<span class="layui-blue">未审核</span>';
                    }else{
                        return '结束'
                    }
                }
            },
            {field: 'thickness', title: '厚度', align:'center'},
            {title: '操作', templet:'#colbar',fixed:"right",align:"center"}
        ]]
    };
    let laydg = initLayTbl(tableItem);

    $("#addBtn").click(function(){
        addNews()
    })

    $("#deleteBtn").click(function(){
        let checkStatus = layui.table.checkStatus('layTbl'),
        data = checkStatus.data,
        ids = [];
        if(data.length > 0) {
            for (let i in data) {
                ids.push(data[i].id);
            }
            layer.confirm('确定删除选中的文章？', {icon: 3, title: '提示信息'}, function (index) {
                // $.get("删除文章接口",{
                //     newsId : newsId  //将需要删除的newsId作为参数传入
                // },function(data){
                    console.log("ids",ids)
                laydg.reload();
                layer.close(index);
                // })
            })
        }else{
            layer.msg("请选择需要删除的文章");
        }
    })

    //添加文章
    function addNews(edit){
        let index = layui.layer.open({
            title : "添加文章",
            type : 2,
            content : "newsAdd.html",
            success : function(layero, index){
                var body = layui.layer.getChildFrame('body', index);
                if(edit){
                    body.find(".newsName").val(edit.newsName);
                    body.find(".abstract").val(edit.abstract);
                    body.find(".thumbImg").attr("src",edit.newsImg);
                    body.find("#news_content").val(edit.content);
                    body.find(".newsStatus select").val(edit.newsStatus);
                    body.find(".openness input[name='openness'][title='"+edit.newsLook+"']").prop("checked","checked");
                    body.find(".newsTop input[name='newsTop']").prop("checked",edit.newsTop);
                    form.render();
                }
                setTimeout(function(){
                    layui.layer.tips('点击此处返回文章列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                },500)
            }
        })
        layui.layer.full(index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize",function(){
            layui.layer.full(index);
        })
    }

    //批量删除
    // $(".delAll_btn").click(function(){
    //     var checkStatus = table.checkStatus('layTbl'),
    //         data = checkStatus.data,
    //         newsId = [];
    //     if(data.length > 0) {
    //         for (var i in data) {
    //             newsId.push(data[i].newsId);
    //         }
    //         layer.confirm('确定删除选中的文章？', {icon: 3, title: '提示信息'}, function (index) {
    //             // $.get("删除文章接口",{
    //             //     newsId : newsId  //将需要删除的newsId作为参数传入
    //             // },function(data){
    //             laydg.reload();
    //             layer.close(index);
    //             // })
    //         })
    //     }else{
    //         layer.msg("请选择需要删除的文章");
    //     }
    // })

    //列表操作
    table.on('tool(dg)', function(obj){
        let layEvent = obj.event,
            data = obj.data;

        if(layEvent === 'edit'){ //编辑
            addNews(data);
        } else if(layEvent === 'delete'){ //删除
            layer.confirm('确定删除？',{icon:3, title:'提示信息'},function(index){
                // $.get("删除文章接口",{
                //     newsId : data.newsId  //将需要删除的newsId作为参数传入
                // },function(data){
                    laydg.reload();
                    layer.close(index);
                // })
            });
        } else if(layEvent === 'look'){ //预览
            layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问")
        }
    });


})