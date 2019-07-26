(function () {
    var header = tools.$('.header')[0]; //获取header
    var weiyunContent = tools.$('.weiyun-content')[0]; //获取content
    var headerH = header.offsetHeight; //hearder高度
    var content = tools.$('.content')[0]; //获取content的右侧
    var fileList = tools.$('.file-list')[0]; //获取content右侧的右下侧
    var table_table
    var tableName
    var _columns = []
    var scrollX = 0
    var accessCloumn = []

    //不显示字段
    // var fixPropArr = ['id', 'fid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname", "onum", "tree_path"];
    var fixPropArr = ['id', '状态']

    function changeHeight() {
        var viewH = window.innerHeight || document.documentElement.clientHeight;
        weiyunContent.style.height = viewH - headerH + 'px';
        content ? content.style.height = viewH - headerH - 62 + 'px' : '';
        fileList ? fileList.style.height = viewH - headerH - 90 + 'px' : '';
    }
    changeHeight();
    window.onresize = changeHeight;
    loadAccess();
    function loadAccess() {
        local_api.getTableColumns('access', $.cookie('appkey'), querySuccess)
    }

    function querySuccess(json) {
        json.data = []
        _columns = []
        // $($('.file-list .tops')[0]).empty()


        $('.file-list').empty()
        var table = document.createElement('table')
        table.className = "table table-hover table-striped table-bordered"
        table.width = '100%'
        table.cellpadding = "0"
        table.cellspacing = "0"
        table.border = "0"
        table.id = "accessTable_list"
        var template = '<thead><tr class="tops"></tr></thead><tbody></tbody>'
        table.innerHTML = template
        $('.file-list').append(table)


        var th = document.createElement('th')
        th.width = '60'
        th.innerText = "序号"
        $($('.file-list .tops')[0]).append(th)
        //设置table加载字段
        var obj = { "mData": null, "sClass": "ms_left" }
        obj.fnRender = function (obj) {
            var xh =  obj.oSettings._iDisplayStart +obj.iDataRow + 1
            return xh
        }
        _columns.push(obj)


        $('#frmAccess ul').empty()
        for (var i = 0; i < json.row.length; i++) {
            if (fixPropArr.indexOf(json.row[i].Field) == -1) {
                json.data.push(json.row[i])

                var string = `<li style="margin-top: 10px">
                    <label class="ellipsis Flabel">${json.row[i].Field}</label>
                    <input class="form-control accessInput" size="16" type="text" data-name="${json.row[i].Field}" value="" style="width: 200px">
                    
                </li>`

                $('#frmAccess ul').append(string)

            }

            if (json.row[i].Field != 'id') {
                accessCloumn.push(json.row[i].Field)
                //设置table头部
                var th = document.createElement('th')
                th.width = '120'
                th.innerText = json.row[i].Field
                $($('.file-list .tops')[0]).append(th)
                //设置table加载字段
                var obj = { "mData": json.row[i].Field, "sClass": "ms_left" }
                _columns.push(obj)
            }
        }
        var th = document.createElement('th')
        th.width = '60'
        th.innerText = '操作'
        $($('.file-list .tops')[0]).append(th)
        var obj = {}
        obj.mData = null
        obj.fnRender = function (obj) {

            return "<a href='#' title='修改'><i class='icon-edit' file_id='" + obj.aData.id + "'></i></a>&nbsp;&nbsp;<a href='#' title='修改'><i class='icon-exchange' file_id='" + obj.aData.id + "'></i></a>&nbsp;&nbsp;<a href='#' title='删除'><i class='icon-trash' file_id='" + obj.aData.id + "'></i></a>";

        }
        _columns.push(obj)

        scrollX = (_columns.length - 1) * 120 + 80

        if ($(window).width() - 220 > scrollX) {
            scrollX = $(window).width() - 220
        }
        // debugger
        showTable(_columns, scrollX)
    }


    $('#divAccess').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '添加新记录',
        buttons: {
            "确定": function () {
                // saveNewPro();
                if (isNew) {
                    addAccess()
                } else {
                    editAccess()
                }


            },
            "取消": function () {
                $('#divAccess').dialog("close");
            }
        }
    });

    $('#dateQuery').on('click',function(){
        loadAccess()
    })

    var isNew = false
    $('#singelAdd').on('click', function () {
        isNew = true
        $('#divAccess').dialog({ title: '新增' })
        $('#divAccess').dialog("open");
    })


    function addAccess() {
        var obj = { '状态': '借阅' }

        $('#frmAccess .accessInput').each(function (index, ele) {
            obj[$(ele).data().name] = $(ele).val()
        })

        local_api._create('access', obj, $.cookie('appkey'), function (res) {
            loadAccess()
            $('#divAccess').dialog("close");
        })
        // console.log(obj)
    }

    function editAccess() {
        var obj = {}

        $('#frmAccess .accessInput').each(function (index, ele) {
            obj[$(ele).data().name] = $(ele).val()
        })
        var query = { id: editId }
        local_api._update('access', query, obj, $.cookie('appkey'), function (res) {
            loadAccess()
            $('#divAccess').dialog("close");
            console.log(res)
        })

    }

    // showTable(_columns, scrollX)


    var fileList_table
    function showTable(_columns, scrollX) {

        var sScrollY = $(window).height() - 200 + 'px'
        console.log(sScrollY)
        // debugger;
        var objTable = {
            "bDestroy": true,
            "bAutoWidth": false,
            "sScrollX": scrollX + 'px',
            "sScrollY": sScrollY,
            "bInfo": true,
            "iDisplayLength": 10,
            "bLengthChange": false,
            "bProcessing": true,
            "bScrollCollapse": true,
            "bServerSide": true,
            "bFilter": false,
            "aoColumns": _columns,
            // "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": { "sUrl": 'css/lang.txt' },
            "sAjaxSource": "",
            "bInfo": true,
            "fnServerData": retrieveData,
        };

        // if (fileList_table) {
        //     fileList_table.fnClearTable();
        // }

        fileList_table = $("#accessTable_list").dataTable(objTable);
        // setTimeout(function () {
        //     new FixedColumns(fileList_table, {
        //       "iLeftColumns": 0,
        //       "iRightColumns": 1
        //     });
        //   }, 600)

    };
    //表格渲染之前处理
    var pageNO = 0
    var allData = []
    function retrieveData(sSource, aoData, fnCallback) {
        var localPage = localStorage.getItem('page_no') || 0
        // var localPage = 0
        console.log(aoData)
        var page_count = aoData[4].value;
        // aoData[3].value = parseInt(localPage) || aoData[3].value
        var page_no = (aoData[3].value / page_count) + 1
        pageNO = page_no
        localStorage.setItem('page_no', 0)

        var json = {
            id: '>0'
        }
        if($('#searchValue').val()){
            json['借阅文件'] = '^' + $('#searchValue').val()
        }

        var descLength = $('.dataTables_scrollHeadInner .sorting_desc').length
        var ascLength = $('.dataTables_scrollHeadInner .sorting_asc').length
        var text = 'id'
        // var textAcc = 

        if (descLength) {
            text = '-' + $('.dataTables_scrollHeadInner .sorting_desc').text()
        }
        if (ascLength) {
            text = $('.dataTables_scrollHeadInner .sorting_asc').text()
        }
        if(text.indexOf('序号')>-1){
            text = ''
        }

        local_api._list('access', json, '', text, page_no, page_count, $.cookie('appkey'), function (json) {
            json.sEcho = aoData[0].value;
            json.iTotalRecords = json.total;
            json.iTotalDisplayRecords = json.total;
            // var fidArray = []
            // for (var i = 0; i < json.data.length; i++) {
            //     json.data[i].index = i;
            //     if (json.data[i].type == 2) {
            //         fidArray.push(json.data[i].id)
            //     }
            // }

            // json.data = afterData
            json.aaData = json.data;
            allData = json.data
            fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式

        })




    }
    var editId
    $(document).on('click', '.icon-edit', function () {
        editId = $(this).attr('file_id')
        var editData = allData.filter(e => e.id == $(this).attr('file_id'))
        $('#frmAccess .accessInput').each(function (index, ele) {
            $(ele).val(editData[0][$(ele).data().name])
        })
        isNew = false
        $('#divAccess').dialog({ title: '修改' });
        $('#divAccess').dialog("open");
    })

    //修改状态
    $(document).on('click', '.icon-exchange', function () {
        console.log($(this).attr('file_id'))
        var query_json = {
            id: $(this).attr('file_id')
        }

        var update_json = {
            '状态': '归还'
        }

        var nowData = allData.filter(e => e.id == $(this).attr('file_id') )
        update_json['状态'] =  nowData[0]['状态'] == '归还' ?  '借阅' : '归还'


        local_api._update('access', query_json, update_json, $.cookie('appkey'), function (res) {
            localStorage.setItem('page_no', pageNO)
            loadAccess()
        })
    })
    //删除记录
    $(document).on('click', '.icon-trash', function () {
        console.log($(this).attr('file_id'))
        var query_json = {
            id: $(this).attr('file_id')
        }


        local_api._delete('access', query_json, $.cookie('appkey'), function (res) {

            loadAccess()
        })
    })
    //导入
    $('#import').on('click', function () {
        var input = document.createElement('input');
        input.type = 'file';
        // console.log(tree_path)
        $(input).change(function (e) {
            var files = $(this)[0].files;
            // console.log(tree_path)
            importFun(files)
        });
        input.click();
    })
    var wb
    function importFun(files) {
        var reader = new FileReader();
        console.log(files[0].name, 'filesname')
        allPushData = []
        reader.readAsBinaryString(files[0]);
        reader.onload = function (evt) {
            var data = evt.target.result;
            wb = XLSX.read(data, { type: 'binary' });
            var SheetNamesArr = wb['SheetNames']; //sheetName 多列
            var importobj = {};
            SheetNamesArr.forEach(function (ele, i) {
                importobj[ele] = {
                    createArr: [],
                    createDoc: []
                };

            });
            for (var o in importobj) {
                getimportData(o)
            }
        }
    }

    function getimportData(name) {
        var xlsData = wb.Sheets[name];
        var xlsDataLength = getIndex(xlsData['!ref']);
        var letter = [];
        for (var x in xlsData) {
            var _x = x.split('');
            var strArr = [];
            _x.forEach(function (ele) {
                /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
            });
            if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
                letter.push(strArr.join(''));
        }
        var createArr = [];
        var createDoc = [];
        var nameIndex = 1
        for (var i = 0; i <= xlsDataLength; i++) {
            var obj = {}; //新建案卷属性

            letter.forEach(function (ele) {
                if (xlsData[ele + i]) {
                    // var propName = xlsData[ele + i] ? xlsData[ele + i].v : xlsData[ele + (i+1)] ? xlsData[ele + (i+1)].v : '';
                    if (accessCloumn.indexOf((xlsData[ele + i] || {}).v) > -1) {
                        nameIndex = i
                    }
                    console.log(nameIndex)
                    var propName = (xlsData[ele + nameIndex] || {}).v
                    if (accessCloumn.indexOf(propName) > -1 && propName != xlsData[ele + i].v) {
                        obj[propName] = xlsData[ele + i].v;
                    }
                }
            });
            if (Object.keys(obj).length) {
                createArr.push(obj)
            }

        }

        console.log(createDoc, createArr);//案卷和案卷属性

        var startI = 0;
        var start = function () {
            // var d = createDoc[startI]
            var objD = { '状态': '借阅' }
            var p = createArr[startI]
            var newP = Object.assign({}, objD, p)
            // p['状态']=""
            if (p) {
                local_api._create('access', newP, $.cookie('appkey'), function (res) {
                    startI++;
                    start()
                });
            } else {
                showTips('ok', '导入' + name + '成功');
                loadAccess()
            }
        }
        start()

    }
    function getIndex(refs) {
        var refArr = refs.split('');
        var _i = 0;
        var _index = '';
        for (var i = refArr.length - 1; i > 0; i--) {
            if (/^[A-Z]+$/.test(refArr[i])) {
                _i = i + 1;
                break;
            }
        }
        for (var i = _i; i < refArr.length; i++) {
            _index += refArr[i];
        }
        return parseInt(_index);
    }


})()