$('.startTime').datetimepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    forceParse: 0,
    minView: 2,
    showMeridian: 1
});
$('.endTime').datetimepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    forceParse: 0,
    minView: 2,
    showMeridian: 1
});





(function () {
    $('#addSys').on('click', function () {
        var name = new Date().getTime() + '备份.sql'
        var createJson = {
            name: name,
            createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
            status: 1,
        }
        local_api._sysCopy(name, $.cookie('appkey'), function (res) {

            local_api._create('syscopy', createJson, $.cookie('appkey'), function (sys) {
                // console.log(res, sys)
                var path = location.host + '/downloadfile?path=' + res.path + '&name=' + name
                // var path = location.host + '/report'
                location.href='http://' + path
                console.log(path)
                // setTimeout(() => {
                //     window.open(path, '_blank')
                // }, 1000);
                // 
                // openDownloadDialog(res.path,name)
                // var blob = new Blob(res.blob, { type: "application/octet-stream" })
                // openDownloadDialog(blob,name)
                loadSys()
            })
        })
    })

    function openDownloadDialog(blob, name) {
        // if (typeof blob == 'object' && blob instanceof Blob) {
        //   blob = URL.createObjectURL(blob); // 创建blob地址
        // }

        var a = document.createElement("a");
        $('body').append(a)
        // 利用URL.createObjectURL()方法为a元素生成blob URL
        a.href = blob;
        // 设置文件名
        a.download = name;
        a.click()
        $(a).remove()
    }


    var sysList_table = ''
    function loadSys() {


        var _columns = [

            { "mData": "name", "sClass": "ms_left" },
            {
                "mData": null, "sClass": "center", "fnRender": function (obj) {
                    return "已备份";
                }
            },
            {
                "mData": null, "sClass": "center", "fnRender": function (obj) {
                    return new Date(obj.aData.createdAt).format('yyyy-MM-dd hh:mm:ss');
                }
            },

            {
                "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                    return "";
                }
            }
        ];

        var objTable = {
            "bDestroy": true,
            "bAutoWidth": false,
            "bInfo": true,
            "iDisplayLength": 10,
            "bLengthChange": false,
            "bProcessing": true,
            "bScrollCollapse": true,
            "bServerSide": true,
            "bFilter": false,
            "aoColumns": _columns,
            "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": { "sUrl": 'css/lang.txt' },
            "sAjaxSource": "",
            "bInfo": true,
            "fnServerData": retrieveData,
        };

        // console.log(objTable)
        if (sysList_table) {
            sysList_table.fnClearTable();
            // sysList_table.fnAddData(json.data);
        }

        sysList_table = $("#sys_list").dataTable(objTable);

    }


    function retrieveData(sSource, aoData, fnCallback) {
        var page_count = aoData[4].value;
        var page_no = (aoData[3].value / page_count) + 1
        var json = {
            id: '>0',
        };
        local_api._list('syscopy', json, '', '', page_no, page_count, $.cookie('appkey'), function (json) {
            json.sEcho = aoData[0].value;
            json.iTotalRecords = json.total;
            json.iTotalDisplayRecords = json.total;
            // json.data = afterData
            json.aaData = json.data;
            fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式

        })
    }

    loadSys()
})()