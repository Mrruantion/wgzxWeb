var u_path = $.cookie('tree_path');
var auth_code = $.cookie('appkey');
var selectType = 1;
var icons = {
    0: './img/icon-file-s.svg',
    1: './img/icon-file-s.svg',
    2: './img/icon-file-s1.svg'
}
var assignName, assignDid, assignTreePath, customer_table
// 封装改变高度函数
function changeHeight() {
    var viewH = window.innerHeight || document.documentElement.clientHeight;
    // var header = tools.$('.header')[0];
    // var weiyunContent = tools.$('.weiyun-content')[0];
    var headerHe = $('.header').height();
    var headerH = $('.nav').height();
    $('.weiyun-content').css('height', viewH - headerHe + 'px')
    // weiyunContent.style.height = viewH - headerH + 'px';
    $('.content').css('height', viewH - headerH - 90 + 'px')
    // weiyunContent.style.height = viewH - headerH + 'px';
    // content ? content.style.height = viewH - headerH - 62 + 'px' : '';
    // fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : ''
}

// 初始化
changeHeight();
// 窗口改变时，重新计算可视区高度
window.onresize = changeHeight;
// 初始化日期框
// $('.startTime').datetimepicker({
//     // format: 'yyyy-mm-dd',
//     language: 'zh-CN',
//     weekStart: 1,
//     todayBtn: 1,
//     autoclose: 1,
//     todayHighlight: 1,
//     startView: 2,
//     forceParse: 0,
//     minView: 0,
//     showMeridian: 1
// });

// 初始化日期框
$('.endTime').datetimepicker({
    format: 'yyyy',
    language: 'zh-CN',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 4,
    forceParse: 0,
    minView: 4,
    showMeridian: 1
});

$('.endTime input').val(new Date().format('yyyy'))
$('.endTime').hide()
$('#timeType').change(function () {
    console.log(this.value)
    if (this.value == 2) {
        $('.endTime').show()
    } else {
        $('.endTime').hide()
    }
})

$('#typeSelect').change(function () {
    $('.nav-collects>div:not(:first-child)').hide();
    if (customer_table) {
        customer_table.fnClearTable()
        $("#doc_list").dataTable().fnDestroy();
        customer_table = null;
    }
    selectType = parseInt(this.value);
    $('#doc_list thead').empty();
    $('#doc_list thead').append(summarySheetThead());
    switch (parseInt(this.value)) {
        case 1: $('#classify').parent().show();
            getDirData();
            break;
        case 2: $('#position').parent().show();
            break;
        case 3: $('#datetime').show();
            break;
        case 4: $('#classify').parent().show();
            getDirData()
            break;
        case 5: sysLog();
            break;
    }
})

//案卷汇总表
function summarySheet() {

}
function summarySheetThead() {
    if (selectType == 1 || selectType == 2 || selectType == 3) {
        return `
        <tr class="tops">
            <th width="10px" style="">
                序号
            </th>
            <th width="120px" style="">
                ${selectType == 1 ? '分类名' : selectType == 2 ? '位置' : selectType == 3 ? '时间' : ''}
            </th>
            <th width="120px">
                案卷数量
            </th>
        </tr>
        `
    } else if (selectType == 4) {
        return `
        <tr class="tops">
            <th width="30px" style="">
                序号
            </th>
            <th width="210px" style="">
                案卷名
            </th>
            <th width="150px">
                档号
            </th>
            <th width="120px">
                保存年限
            </th>
            <th width="180px">
                具体地址
            </th>
            <th width="180px">
                位置
            </th>
            <th width="120px">
                社区单位编号
            </th>
            <th width="50px">
                件数
            </th>
            <th width="50px">
                页数
            </th>
        </tr>`
    } else if (selectType == 5) {
        return `
        <tr class="tops">
            <th width="30px" style="">
                序号
            </th>
            <th width="210px" style="">
                操作
            </th>
            <th width="150px">
                操作人
            </th>
            <th width="120px">
                操作账号
            </th>
            <th width="180px">
                操作时间
            </th>
        </tr>`
    }
}

function sysLog() {
    local_api._list('syslog', { u_path: '^' + $.cookie('tree_path') }, '', '-createdAt', 1, -1, $.cookie('appkey'), function (res) {
        querySuccess(res, 5)
    })
}

//案卷汇总表
function summarySheetTable() {
    var query_json = {
        'document.tree_path': '^' + assignTreePath,
        'document.type': 2
    }
    var exportTablehead = { '_id': '序号', 'name': '案卷名', 'did': '档号', 'saveExpireIn': '保存年限', '具体地址': '具体地址', 'position': "位置", '社区单位编号': '社区单位编号', 'num': '件数', 'page': '页数' }
    exportTablehead = JSON.stringify(exportTablehead);
    local_api._listUnionUrl({ 'table1': 'document', 'table2': 'docProp' }, query_json, 'docProp.*,document.did,document.id,document.name', 'document.did|document.id', 'document.id=docProp.fid', exportTablehead, 1, -1, $.cookie('appkey'), function (res) {
        if (res.data) {
            if (res.data.length) {
                $('#export').parent().show();
            }
        }
        querySuccess(res, 4);
        $('#divDocumentAssign').dialog("close");
    })

}

//获取所有分类
getDirData()
function getDirData() {
    local_api._list('document', { u_path: '^' + u_path + ',|' + u_path, type: '0|1' }, '', '', 1, -1, auth_code, function (res) {
        console.log(res)
        showTree(res.data);
    })
}





//初始化分类弹框
$('#divDocumentAssign').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '分类',
    buttons: {
        "确定": function () {
            if (selectType == 1) {
                classifyFuc()
            } else if (selectType == 4) {
                summarySheetTable();
            }

        },
        "取消": function () {
            $('#divDocumentAssign').dialog("close");
        }
    }
})



$('#classify').on('click', function () {
    $('#divDocumentAssign').dialog("open");
})

//分类统计
function classifyFuc() {

    local_api._list('document', { tree_path: '^' + assignTreePath, id: '>' + assignDid }, '', '', 1, -1, auth_code, function (res) {

        var childData = dataControl.getChildById(res.data, assignDid);

        // childData.forEach(ele => {
        //     ele.count = dataControl.getChildren(res.data, ele.id, true).filter(ele => ele.type == 2).length
        // })

        for (var i = 0; i < childData.length; i++) {
            childData[i].count = dataControl.getChildren(res.data, childData[i].id, true).filter(function (ele) { return ele.type == 2 }).length
        }

        var _res = { data: childData, total: childData.length }

        querySuccess(_res);

        $('#divDocumentAssign').dialog("close");

        $('#divPosition').dialog("close");
    })
}
//显示目录树
function showTree(data) {
    var names = [];
    customers = data;
    for (var i = 0; i < data.length; i++) {
        names.push(data[i].name);
    }
    var onCustomerAssignClick = function (event, treeId, treeNode) {
        if (parseInt(treeNode.id) > -1) {
            assignDid = treeNode.id;
            assignTreePath = treeNode.treePath;
            assignName = treeNode._name;
        }
    };
    var settingAssign = {
        view: { showIcon: true },
        check: { enable: false, chkStyle: "checkbox" },
        data: { simpleData: { enable: true } },
        callback: { onClick: onCustomerAssignClick }
    };
    var selectArray = [];
    // 创建三个分类的根节点
    for (var i = 0; i < data.length; i++) {
        selectArray.push({
            open: false,
            id: data[i]['id'],
            treePath: data[i]['tree_path'],
            pId: data[i]['pid'],
            name: data[i]['name'],
            u_path: data[i]['u_path'],
            icon: icons[data[i]['type']]
        });
    }

    $.fn.zTree.init($("#documentTreeAssign"), settingAssign, selectArray);
    var contentfileId = data[0].id;
    if (contentfileId >= 0) {
        var treeObj = $.fn.zTree.getZTreeObj("documentTreeAssign");
        var node = treeObj.getNodeByParam("id", contentfileId, null);
        if (node) {
            tree_path = node.treePath;
            treeObj.selectNode(node);
            // assignDid = treeNode.id;
            assignDid = node.id
            assignTreePath = node.treePath;
            // assignName = treeNode._name;
        }
    }
}


$('#position').on('click', function () {
    $('#divPosition').dialog('open')
})

$('#divPosition').dialog({
    width: 300,
    maxHeight: 400,
    autoOpen: false,
    title: '位置',
    buttons: {
        "确定": function () {
            positionFuc()
        },
        "取消": function () {
            $('#divPosition').dialog("close");
        }
    }
})

//位置统计
function positionFuc() {
    var qu = $('#qnum').val().trim();
    var lie = $('#lnum').val().trim();
    var jie = $('#jnum').val().trim();
    var ceng = $('#cnum').val().trim();
    var ce = $('#ce').val();
    console.log(qu, lie, jie, ceng, ce)
    var query_json = { ce: ce, u_path: '^' + u_path };
    if (qu) {
        query_json['qnum'] = qu;
    }
    if (lie) {
        query_json['lnum'] = lie;
    }
    if (jie) {
        query_json['jnum'] = jie;
    }
    if (ceng) {
        query_json['cnum'] = ceng;
    }

    local_api._list('docProp', query_json, 'fid,qnum,lnum,jnum,cnum,ce,name', 'qnum|lnum|jnum|cnum|ce', 1, -1, $.cookie('appkey'), function (res) {
        var fidArr = [];
        var ceobj = { 1: '左', 0: '右' }
        for (var i = 0; i < res.data.length; i++) {
            var data = res.data[i]
            res.data[i].position = data.qnum + '区' + data.lnum + '列' + data.jnum + '节' + data.cnum + '层' + ceobj[parseInt(data.ce)] + '侧'
        }
        var dataobj = {};
        // res.data.forEach(ele => {
        //     var countArr = [];
        //     if (!dataobj[ele.position]) {
        //         dataobj[ele.position] = {
        //             position: ele.position
        //         }
        //         res.data.forEach(e => {
        //             if (ele.position == e.position) {
        //                 countArr.push(e)
        //             }
        //         })
        //         dataobj[ele.position]['count'] = countArr.length
        //     }
        // })


        for (var i = 0; i < res.data.length; i++) {
            var countArr = [];
            if (!dataobj[res.data[i].position]) {
                dataobj[res.data[i].position] = {
                    position: res.data[i].position
                }
                for (var j = 0; j < res.data.length; i++) {
                    if (res.data[i].position == res.data[j].position) {
                        countArr.push(res.data[j])
                    }
                }
                dataobj[ele.position]['count'] = countArr.length
            }
        }

        var _res = { data: [] }
        for (var i in dataobj) {
            _res.data.push(dataobj[i])
        }
        _res.total = _res.data.length;
        querySuccess(_res, 2);

        $('#divDocumentAssign').dialog("close");
        $('#divPosition').dialog("close");

    })
}

var querySuccess = function (json, type) {
    if (json) {
        names = [];
        var ceobj = { 1: '左', 0: '右' };
        for (var i = 0; i < json.data.length; i++) {
            json.data[i]._id = i;
            if (type == 4) {
                json.data[i].position = '';
                json.data[i].createdAt = new Date(json.data[i].createdAt).format('yyyy-MM-dd hh:mm:ss')
                if (json.data[i].qnum && json.data[i].lnum && json.data[i].jnum) {
                    json.data[i].position = json.data[i].qnum + '区' + json.data[i].lnum + '列' + json.data[i].jnum + '节' + json.data[i].cnum + '层' + ceobj[parseInt(json.data[i].ce)] + '侧'
                }
            } else if (type == 5) {
                json.data[i].createdAt = new Date(json.data[i].createdAt).format('yyyy-MM-dd hh:mm:ss')
            }
        }
    }

    var _columns = [
        { "mData": "_id", "sClass": "ms_left" },
        { "mData": "name", "sClass": "ms_left" },
        { "mData": "count", "sClass": "center" },
        // { "mData": "createdAt", "sClass": "center" },
    ];

    if (type == 2) {
        _columns = [
            { "mData": "_id", "sClass": "ms_left" },
            { "mData": "position", "sClass": "ms_left" },
            { "mData": "count", "sClass": "center" },
        ]
    }
    if (type == 3) {
        _columns = [
            { "mData": "_id", "sClass": "ms_left" },
            { "mData": "createdAt", "sClass": "ms_left" },
            { "mData": "count", "sClass": "center" },
        ]
    }
    if (type == 4) {
        _columns = [
            { "mData": "_id", "sClass": "ms_left" },
            { "mData": "name", "sClass": "ms_left" },
            { "mData": "did", "sClass": "center" },
            { "mData": "saveExpireIn", "sClass": "center" },
            { "mData": "具体地址", "sClass": "center" },
            { "mData": "position", "sClass": "center" },
            { "mData": "社区单位编号", "sClass": "center" },
            { "mData": "num", "sClass": "center" },
            { "mData": "page", "sClass": "center" },
        ]
    }
    if (type == 5) {
        _columns = [
            { "mData": "_id", "sClass": "ms_left" },
            { "mData": "operate", "sClass": "ms_left" },
            { "mData": "name", "sClass": "center" },
            { "mData": "account", "sClass": "center" },
            { "mData": "createdAt", "sClass": "center" },
        ]
    }

    var objTable = {
        "bInfo": false,
        "bLengthChange": false,
        "bProcessing": true,
        "bServerSide": false,
        "bFilter": false,
        "bScrollCollapse": true,
        "bAutoWidth": true, //是否自适应宽度  
        "aaData": json.data,
        "aoColumns": _columns,
        "bInfo": true, //是否显示页脚信息，DataTables插件左下角显示记录数  
        // "sDom": "<'row'r>t<'row'<'pull-right'p>>",
        "sPaginationType": "bootstrap",
        "oLanguage": { //国际化配置  
            "sProcessing": "正在获取数据，请稍后...",
            "sLengthMenu": "显示 _MENU_ 条",
            "sZeroRecords": "没有您要搜索的内容",
            "sInfo": "从 _START_ 到  _END_ 条记录 总记录数为 _TOTAL_ 条",
            "sInfoEmpty": "记录数为0",
            "sInfoFiltered": "(全部记录数 _MAX_ 条)",
            "sInfoPostFix": "",
            "sSearch": "搜索",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "第一页",
                "sPrevious": "上一页",
                "sNext": "下一页",
                "sLast": "最后一页"
            }
        },
    };

    if (customer_table) {
        customer_table.fnClearTable();
        customer_table.fnAddData(json.data);
        // customer_table = $("#doc_list").dataTable(objTable);
    } else {
        customer_table = $("#doc_list").dataTable(objTable);
    }
};

$('#dateQuery').on('click', function () {

    var startTime = $('.endTime input').val();
    var endTime = startTime + 1;
    // console.log(startTime, endTime)
    // if (startTime > endTime) {
    //     alert('开始时间不能大于结束时间')
    // }
    // var url = local_api._listUrl('document', { createdAt: `>${startTime}&<${endTime}`, type: '2' }, '', '', 1, -1, auth_code)
    // querySuccess(url)
    var timeType = parseInt($('#timeType').val());
    var query_json = {}
    if (timeType == 1) {
        query_json = { u_path: '^' + u_path, type: '2' }
    } else if (timeType == 2) {
        query_json = { u_path: '^' + u_path, type: '2', createdAt: `>${startTime}&<${endTime}` }
    }

    local_api._list('document', query_json, '', '', 1, -1, auth_code, function (res) {
        console.log(res)
        // res.data.forEach(ele => {
        //     if (timeType == 1) {
        //         ele._createdAt = new Date(ele.createdAt).format('yyyy')
        //     } else if (timeType == 2) {
        //         ele._createdAt = new Date(ele.createdAt).format('yyyy-MM')
        //     }
        // })
        for (var i = 0; i < res.data.length; i++) {
            if (timeType == 1) {
                res.data[i]._createdAt = new Date(res.data[i].createdAt).format('yyyy')
            } else if (timeType == 2) {
                res.data[i]._createdAt = new Date(res.data[i].createdAt).format('yyyy-MM')
            }
        }
        var obj = {};
        // res.data.forEach(ele => {
        //     if (obj[ele._createdAt]) {
        //         obj[ele._createdAt].count++
        //     } else {
        //         obj[ele._createdAt] = { count: 1, createdAt: ele._createdAt }
        //     }
        // })
        for (var i = 0; i < res.data.length; i++) {
            if (obj[res.data[i]._createdAt]) {
                obj[res.data[i]._createdAt].count++
            } else {
                obj[res.data[i]._createdAt] = { count: 1, createdAt: res.data[i]._createdAt }
            }
        }
        var _res = { data: [] }
        for (var i in obj) {
            _res.data.push(obj[i]);
        }
        // _res.total = _res.data.length;
        querySuccess(_res, 3)
    })
})


$('#export').on('click', function (res) {
    var a = document.createElement('a');
    // a.download = 'b.xlsx';
    a.href = '/b.xlsx'
    a.click()
    // console.log(res)
})