(function () {

    // console.log(2)
    var header = tools.$('.header')[0]; //获取header
    var weiyunContent = tools.$('.weiyun-content')[0]; //获取content
    var headerH = header.offsetHeight; //hearder高度
    var content = tools.$('.content')[0]; //获取content的右侧
    var fileList = tools.$('.file-list')[0]; //获取content右侧的右下侧
    var table_table
    var tableName
    var nowSelectId = 0
    var nowSelectName = ''

    var allTableArray = []
    var filterArray = ['docprop', 'document', 'playapp', 'syscopy', 'syslog', 'user']
    var reverTableObj = {
        'access': '查阅调阅',
        '查阅调阅': 'access'
    }

    //不显示字段
    var fixPropArr = ['id', 'fid', 'sid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname", "onum", "tree_path"];

    function changeHeight() {
        var viewH = window.innerHeight || document.documentElement.clientHeight;
        weiyunContent.style.height = viewH - headerH + 'px';
        content ? content.style.height = viewH - headerH - 62 + 'px' : '';
        fileList ? fileList.style.height = viewH - headerH - 100 + 'px' : '';
    }
    changeHeight();
    window.onresize = changeHeight;
    // loadData()
    //切换
    // $('#tree-menu li').click(function () {
    //     console.log(this)
    //     $('#tree-menu li').removeClass('active')
    //     $(this).addClass('active')
    //     loadData()
    // })
    //加载数据
    function loadData() {
        // tableName = $('.tree_li.active').data().table
        var tableName = nowSelectName

        local_api.getTableColumns(tableName, $.cookie('appkey'), querySuccess)
        // console.log(table)
    }
    var allColumnsData = []
    var tableData = []
    //属性列表显示
    function querySuccess(json) {
        allColumnsData = []
        tableData = []
        json.data = []
        for (var i = 0; i < json.row.length; i++) {
            allColumnsData.push(json.row[i])
            if (fixPropArr.indexOf(json.row[i].Field) == -1) {
                json.data.push(json.row[i])

                tableData.push(json.row[i])
                // allColumnsData.push(json.row[i])
            }
        }

        // var FieldArray = localStorage.getItem(nowSelectName)
        // FieldArray = JSON.parse(FieldArray) || []
        // console.log(json)
        //  = json.row
        var _columns = [
            {
                "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                    var FieldArray = localStorage.getItem(nowSelectName)
                    FieldArray = JSON.parse(FieldArray) || []
                    if (FieldArray.indexOf(obj.aData.Field) > -1) {
                        return "<input type='checkbox' class='tableCheck' checked value='" + obj.aData.Field + "'>";
                    } else {
                        return "<input type='checkbox' class='tableCheck' value='" + obj.aData.Field + "'>";
                    }

                }
            },
            { "mData": "Field", "sClass": "ms_left" },
            { "mData": "Type", "sClass": "center" },
            {
                "mData": null, "sClass": "center", "fnRender": function (obj) {
                    return "<a href='#' title='删除'><i class='icon-trash' file_name='" + obj.aData.Field + "'></i></a>&nbsp;&nbsp;<a href='#' title='编辑'><i class='icon-edit' file_name='" + obj.aData.Field + "'></i></a>&nbsp;&nbsp;<a href='#' title='上移'><i class='icon-arrow-up' row_index='" + obj.iDataRow + "' file_name='" + obj.aData.Field + "'></i></a>&nbsp;&nbsp;<a href='#' title='下移'><i class='icon-arrow-down' row_index='" + obj.iDataRow + "' file_name='" + obj.aData.Field + "'></i></a>"
                }
            },

        ];
        // var lang = i18next.language || 'en';
        var objTable = {
            "bInfo": false,
            "bLengthChange": false,
            "bProcessing": true,
            "bServerSide": false,
            "bFilter": false,
            "iDisplayLength": json.data.length, //默认显示的记录数  
            "bLengthChange": false,
            "bPaginate": false, //是否显示（应用）分页器  
            "aaData": json.data,
            "aoColumns": _columns,
            "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": { "sUrl": 'css/lang.txt' }
        };


        if (table_table) {
            table_table.fnClearTable();
            table_table.fnAddData(json.data);
        } else {
            table_table = $("#table_list").dataTable(objTable);
        }

    }


    // $('#tableCheck').click(function(){

    // })
    //全选字段
    $(document).on('click', '#checkAll', function () {
        $("[type='checkbox'][class='tableCheck']").prop("checked", $('#checkAll').prop("checked"));
        var allField = []
        if ($('#checkAll').prop("checked")) {
            $("[type='checkbox'][class='tableCheck']").each(function (index, ele) {
                // console.log(ele,index)
                allField.push($(ele).val())
            })
            console.log(allField)
        } else {
            console.log(allField)
        }
        localStorage.setItem(nowSelectName, JSON.stringify(allField))
    })

    //选择字段
    $(document).on('click', '#table_list .tableCheck', function () {
        var FieldArray = localStorage.getItem(nowSelectName)
        FieldArray = JSON.parse(FieldArray) || []
        console.log($(this).prop("checked"))
        if ($(this).prop("checked")) {
            FieldArray.push($(this).val())
        } else {
            FieldArray.splice(FieldArray.indexOf($(this).val()), 1)
        }

        localStorage.setItem(nowSelectName, JSON.stringify(FieldArray))
    })


    $(document).on('click', '#table_list .icon-trash', function () {
        console.log($(this).attr('file_name'))
        // if(this.confirm())
        var name = $(this).attr('file_name')
        _confirm('删除字段', '字段将被永久删除，并且无法恢复。您确定删除?', function (res) {
            // console.log(res)
            if (res) {
                local_api.dropColumn(nowSelectName, { name: name }, $.cookie('appkey'), function (res) {
                    console.log(res)
                    if (res.err) {
                        showTips('err', "添加属性失败");
                        return
                    }
                    showTips('ok', '删除成功')
                    loadData()
                })
            }
        })
    })


    var isEdit = false
    var oldName = ''
    $(document).on('click', '.icon-edit', function () {
        console.log($(this).attr('file_name'))
        isEdit = true
        oldName = $(this).attr('file_name')
        $('#newPropname').val(oldName)
        $('#newCustomProp').dialog('open')
        //    $()
    })

    //上移
    $(document).on('click', '.icon-arrow-up', function () {
        var nowIndex = parseInt($(this).attr('row_index'))
        if (nowIndex == 0) {
            return
        }
        var preName = tableData[nowIndex].Field
        var nowName = tableData[nowIndex - 1].Field

        var size = tableData.filter(e => e.Field == tableData[nowIndex].Field)[0].Type

        var query_json = {
            oldColumn: nowName,
            newColumn: nowName,
            preColumn: preName,
            size
        }
        local_api.editTableColumns(nowSelectName, query_json, $.cookie('appkey'), function (res) {
            if (res.err) {
                showTips('err', '移动失败')
                return
            } else {
                loadData()
            }
        })
        //    if(nowIndex == 0){
        //        return
        //    }

        console.log($(this).attr('row_index'))
    })

    //下移
    $(document).on('click', '.icon-arrow-down', function () {
        var nowIndex = parseInt($(this).attr('row_index'))
        if (!tableData[nowIndex + 1]) {
            return
        }
        
        var nowName = tableData[nowIndex].Field
        var preName = tableData[nowIndex + 1].Field

        var size = tableData.filter(e => e.Field == tableData[nowIndex].Field)[0].Type

        var query_json = {
            oldColumn: nowName,
            newColumn: nowName,
            preColumn: preName,
            size
        }
        local_api.editTableColumns(nowSelectName, query_json, $.cookie('appkey'), function (res) {
            if (res.err) {
                showTips('err', '移动失败')
                return
            } else {
                loadData()
            }
        })
        //    if(nowIndex == 0){
        //        return
        //    }

        console.log($(this).attr('row_index'))
    })

    //加载后显示弹框里面的
    $('#pdialogDiv').show()
    $('#newCustomProp').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '添加新属性',
        buttons: {
            "确定": function () {
                if (!isEdit) {
                    saveNewPro();
                } else {
                    editProp()
                }

            },
            "取消": function () {
                $('#newCustomProp').dialog("close");
            }
        }
    });

    $('#addProp').click(function () {
        isEdit = false
        $('#newCustomProp').dialog("open");

    })
    //新增属性
    function saveNewPro() {
        var name = $('#newPropname').val();
        var size = 100;
        var tableName = nowSelectName
        local_api._createColumn(tableName, {
            name: name,
            size: size
        }, $.cookie('appkey'), function (res) {
            createOperate('添加属性');
            if (res.err) {
                showTips('err', "添加属性失败");
                return;
            }
            showTips('ok', '添加属性成功')
            loadData()
            // $('#newCustomProp').dialog('close');
        });
    }

    //修改属性
    function editProp() {
        var newName = $('#newPropname').val()
        console.log(allColumnsData)
        if (oldName == newName) {
            $('#newCustomProp').dialog("close");
            return
        }
        var preIndex = 0
        var size = 0
        allColumnsData.forEach(function (e, index) {
            if (e.Field == oldName) {
                size = e.Type
                preIndex = index
            }
        })
        var preName = allColumnsData[preIndex - 1].Field
        var query_json = {
            oldColumn: oldName,
            newColumn: newName,
            preColumn: preName,
            size
        }
        local_api.editTableColumns(nowSelectName, query_json, $.cookie('appkey'), function (res) {
            if (res.err) {
                showTips('err', '修改失败')
                $('#newCustomProp').dialog("close");
            } else {
                showTips('ok', '修改成功')
                $('#newCustomProp').dialog("close");

                var FieldArray = localStorage.getItem(nowSelectName)
                FieldArray = JSON.parse(FieldArray) || []
                if (FieldArray.indexOf(oldName) > -1) {
                    FieldArray.splice(preIndex, 0, newName)
                    localStorage.setItem(nowSelectName, JSON.stringify(FieldArray))
                }


                loadData()
            }

        })

        // if(oldName == )
    }




    $('#newCustomTable').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '添加新分类',
        buttons: {
            "确定": function () {
                saveNewTable();
            },
            "取消": function () {
                $('#newCustomTable').dialog("close");
            }
        }
    });

    $('#addTable').click(function () {
        $('#newCustomTable').dialog("open");

    })

    function saveNewTable() {
        var name = $('#newTableName').val();
        var data = [
            // { name: 'name', type: 'varchar', size: 100, comment: '名称' }, 
            { name: 'fid', type: 'int', size: 11, comment: '文档关联id' },
            // { name: 'did', type: 'varchar', size: 50, comment: '档号' },
            { name: 'qnum', type: 'varchar', size: 20, comment: '区' },
            { name: 'lnum', type: 'varchar', size: 20, comment: '列' },
            { name: 'ce', type: 'varchar', size: 20, comment: '侧' },
            { name: 'jnum', type: 'varchar', size: 20, comment: '节' },
            { name: 'cnum', type: 'varchar', size: 20, comment: '层' },
            { name: 'onum', type: 'varchar', size: 20, comment: '本号' },
            // { name: 'tree_path', type: 'varchar', size: 50, comment: '路径' },
        ]
        var create_json = { data: JSON.stringify(data) }
        local_api._createTable(name, create_json, $.cookie('appkey'), function (res) {
            createOperate('添加分类');
            if (res.err) {
                showTips('err', "添加分类失败");
                return;
            }
            showTips('ok', '添加分类成功')
            getTable()
            $('#newCustomTable').dialog('close');
        });
    }

    //获取数据库表表名
    function getTable() {
        local_api.getTable('docdb', $.cookie('appkey'), function (res) {
            allTableArray = []
            if (!res.err) {
                res.row.forEach(e => {
                    if (filterArray.indexOf(e['table_name']) == -1) {
                        allTableArray.push(reverTableObj[e['table_name']] || e['table_name'])
                    }
                })
                showTree(allTableArray)
            }
            console.log(res)
        })
    }



    getTable()

    var icons = {
        // 0: './img/table.svg',
        0: './img/table3.svg',

    };
    // var nowSelectId = 0
    function showTree(data) {
        customers = data;
        var onCustomerSelectClick = function (event, treeId, treeNode) {
            // $('#propType').hide()
            console.log(treeNode, 'treeNodetreeNode')
            if (parseInt(treeNode.id) > -1) {
                nowSelectName = reverTableObj[treeNode.name] || treeNode.name
                nowSelectId = treeNode.id
                loadData()
            }
        };


        var OnRightClick = function (event, treeId, treeNode) {
            if (parseInt((treeNode || {}).id || -2) > -1) {
                $('#propType').css({ position: 'absolute', top: event.clientY, left: event.clientX })
                //   console.log(treeNode)
                //   $('#propType ul li').attr('type', treeNode.type)
                //   $('#propType ul li').attr('tree_path', treeNode.treePath)
                $('#propType ul li').attr('name', treeNode.name)
                $('#propType').show()
            } else {
                $('#propType').hide()
            }

            $(document).on('click', documentClick)
        }
        var documentClick = function (e) {
            $('#propType').hide()
            $(document).off('click', documentClick)
        }


        var setting = {
            view: { showIcon: true },
            check: {
                enable: false,
                chkStyle: "checkbox"
            },
            data: { simpleData: { enable: true } },
            callback: { onClick: onCustomerSelectClick, onRightClick: OnRightClick, }
        };

        var fileArray = [{ id: -1, open: true, name: '分类' }];
        data.reverse()
        for (var i = 0; i < data.length; i++) {
            if (data[i] == '查阅调阅') {
                fileArray.push({
                    open: true,
                    id: i,
                    pId: -2,
                    name: data[i],
                    // icon: icons[0]
                });
            } else {
                fileArray.push({
                    open: true,
                    id: i,
                    pId: -1,
                    name: data[i],
                    icon: icons[0]
                });
            }

        }
        // console.log($.fn.zTree)
        $.fn.zTree.init($("#tree-menu"), setting, fileArray);
        var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
        var node = treeObj.getNodeByParam("id", nowSelectId, null);
        if (node) {
            tree_path = node.treePath;
            u_path = node.u_path;
            treeObj.selectNode(node);
            nowSelectName = reverTableObj[node.name] || node.name
            loadData()
        }
    }

    $('#propType ul li').on('click', function (e) {

        var propName = $(this).attr('name')
        console.log(propName)
        if (propName == '查阅调阅') {
            return
        }
        if (propName) {
            local_api._get('document', { propName: propName }, 'propName', $.cookie('appkey'), function (res) {
                if (res.data) {
                    showTips('err', '有文档已选择该分类，无法删除，请删除文档再删除该分类')
                } else {
                    local_api._dropTable(propName, $.cookie('appkey'), function (res) {
                        console.log(res)
                        showTips('ok', '删除成功')
                        getTable()
                    })
                }
            })
        }


        // console.log(propName, 'propType')
    })


})()