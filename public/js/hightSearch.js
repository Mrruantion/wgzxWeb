var header = tools.$('.header')[0];
var weiyunContent = tools.$('.weiyun-content')[0];
var headerH = header.offsetHeight;
var _g = getSearch();

//英转汉
var tableCloumns = {
    name: "名称",
    saveExpireIn: '保存期限',
    createdAt: '创建时间',
    did: "档号",
    type: "文件类型",
}
//汉转英
var tableCloumnsReverse = {
    "名称": 'name',
    '保存期限': 'saveExpireIn',
    '创建时间': 'createdAt',
    "档号": 'did',
    "文件类型": 'type',
}


//不显示字段
var fixPropArr = ['id', 'fid', 'sid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname", "onum", "tree_path"];



$(document).ready(function () {
    function changeHeight() {
        var viewH = window.innerHeight || document.documentElement.clientHeight;
        weiyunContent.style.height = viewH - headerH + 'px';
        $('#searchResult').css('height', viewH - headerH - 100 + 'px')
        // content ? content.style.height = viewH - headerH - 62 + 'px' : '';
        // fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : ''
    }
    // if ($.cookie('uid') == 5) {
    //     $('.nav-box').children().hide();
    //     $($('.nav-box').children()[2]).show()
    // } else {
    //     $('.nav-box').children().show();
    // }



    // 初始化
    changeHeight();
    // 窗口改变时，重新计算可视区高度
    window.onresize = changeHeight;


    // tools.addEvent(tools.$('#search')[0], 'focus', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     tools.addClass(searchBar, 'focus')
    // })
    // tools.addEvent(tools.$('#search')[0], 'blur', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)

    // })

    var filterArray = ['docprop', 'document', 'playapp', 'syscopy', 'syslog', 'user', 'access']
    var allTableArray = []

    var selectTable = []
    function getTable(cb) {
        local_api.getTable('docdb', $.cookie('appkey'), function (res) {
            allTableArray = []
            if (!res.err) {
                res.row.forEach(e => {
                    if (filterArray.indexOf(e['table_name']) == -1) {
                        allTableArray.push(e['table_name'])
                    }
                })
                // showTree(allTableArray)
            }
            showTableNameSelect(allTableArray, cb)
            // console.log(res)
        })
    }

    function showTableNameSelect(data, cb) {
        $('#frmTableName').empty()
        var span = document.createElement('div')
        var string = '<input class="tkey" id="dd0" style="margin:0;position: relative;top: 2.5px;" type="checkbox" name="全部" value="' + '全部' + '">' +
            '<label class="tlkey" for="dd0" style="margin:0" >' + '全部' + '</label>'
        span.innerHTML = string
        $('#frmTableName').append(span)
        for (var i = 0; i < data.length; i++) {
            var span = document.createElement('div')
            var string = '<input class="tkey" id="dd' + (i + 1) + '" style="margin:0;position: relative;top: 2.5px;" type="checkbox" value="' + data[i] + '">' +
                '<label class="tlkey" for="dd' + (i + 1) + '" style="margin:0" >' + data[i] + '</label>'
            span.innerHTML = string
            $('#frmTableName').append(span)
        }


        $('#frmTableName input').each(function (i, e) {
            $(e).prop("checked", true)
        })
        $('#selD').val('全部')
        selectTable = data
        cb()
    }

    // $('#frmTableName input[name = "全部"]').change(function(){
    //     var check = $(this).prop("checked")
    //     console.log('clik')
    //     $('#frmTableName input').each(function (i, e) {
    //         $(e).prop("checked", check)
    //     })
    // })
    $(document).on('click', '#frmTableName input[name = "全部"]', function () {
        var check = $(this).prop("checked")
        console.log('clik')
        $('#frmTableName input').each(function (i, e) {
            $(e).prop("checked", check)
        })
    })
    $(document).on('click', '#frmTableName input[name != "全部"]', function () {
        var inputArr = $('#frmTableName input[name != "全部"]:checked');
        if (inputArr.length != allTableArray.length) {
            $('#frmTableName input[name = "全部"]').prop("checked", false);
        }
        if (inputArr.length == allTableArray.length) {
            $('#frmTableName input[name = "全部"]').prop("checked", true);
        }
        // var check = $(this).prop("checked")
        // console.log('clik')
        // $('#frmTableName input').each(function (i, e) {
        //     $(e).prop("checked", check)
        // })
    })

    //表格显示弹框
    $('#divTableName').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '选择分类',
        buttons: {
            "确定": function () {
                divTableUserSave()
                $('#divTableName').dialog("close");
            },
            "取消": function () {
                $('#divTableName').dialog("close");
            }
        }
    });

    function divTableUserSave() {
        var inputArr = $('#frmTableName input[name != "全部"]:checked');
        var inputTable = []
        inputArr.each(function (i, e) {
            inputTable.push($(e).val())
        })
        // console.log(inputArr)
        if (inputTable.length == allTableArray.length) {
            $('#selD').val('全部')
        } else {
            $('#selD').val(inputTable.join(','))
        }
        selectTable = inputTable
    }

    $(document).on('click', '#selD', function (res) {
        // alert('click')
        $('#divTableName').dialog("open");
    })

    // getUserDoc()//id
    // var CData = []
    // function getUserDoc() {
    //     local_api._get("document", { u_path: $.cookie("tree_path") }, "id,tree_path", $.cookie("appkey"), function (res) {
    //         console.log(res)
    //         local_api._list("document", { pid: res.data.id }, "", "id", 1, -1, $.cookie("appkey"), function (all) {
    //             console.log(all, "resall")
    //             CData = all.data
    //             $('#selD').empty()
    //             $('#selC').empty()
    //             var option = `<option value="${res.data.tree_path}">全部</option>`
    //             $('#selD').append(option)
    //             for (var i = 0; i < all.data.length; i++) {
    //                 var option = `<option value="${all.data[i].tree_path}">${all.data[i].name}</option>`
    //                 $('#selD').append(option)
    //             }
    //             // var option = `<option value="1">${1}</option>`
    //             // $('#selD').append(option)
    //             // $('#selC').parent().hide()
    //             // if (all.data[0]) {
    //             // var _pidArr = all.data[0].tree_path.split(',');
    //             // var _pid = _pidArr[_pidArr.length - 1]
    //             // local_api._list("document", { pid: _pid }, "", "id", 1, -1, $.cookie("appkey"), function (allC) {
    //             //     console.log(allC, "resall")
    //             //     var option = `<option value="">全部</option>`
    //             //     $('#selC').append(option)
    //             //     for (var i = 0; i < allC.data.length; i++) {
    //             //         var option = `<option value="${allC.data[i].tree_path}">${allC.data[i].name}</option>`
    //             //         $('#selC').append(option)
    //             //     }
    //             // })
    //             // }

    //         })

    //     })
    // }
    // $('#selD').change(function (e) {
    //     // console.log(e.target.text)
    //     console.log();
    //     var text = $("#selD").find("option:selected").text()
    //     var _pidArr = e.target.value.split(',');
    //     var _pid = _pidArr[_pidArr.length - 1]

    //     if (text == '全部') {
    //         $('#selC').parent().hide()
    //         return
    //     }

    //     $('#selC').parent().show()

    //     local_api._list("document", { pid: _pid }, "", "id", 1, -1, $.cookie("appkey"), function (allC) {
    //         console.log(allC, "resall")
    //         $('#selC').empty()
    //         var option = `<option value="${$("#selD").val()}">全部</option>`
    //         $('#selC').append(option)
    //         for (var i = 0; i < allC.data.length; i++) {
    //             var option = `<option value="${allC.data[i].tree_path}">${allC.data[i].name}</option>`
    //             $('#selC').append(option)
    //         }

    //     })
    // })


    var docColumns = [];
    if (_g.query && _g.query != '') {
        console.log(_g.query);
        $('#search').val(_g.query);
        createOperate('文件检索')
        isGlobal = true
        getTable(function () {
            selectPropFor()
        })
        return
        // vagueQuery(_g.query, function (fileIdArr) {
        //     // console.log(fileIdArr)
        //     var filestr = ''
        //     // fileIdArr.forEach(ele => {
        //     //     if (ele != '') {
        //     //         filestr += ele + '|';
        //     //     }
        //     // })
        //     for (var i = 0; i < fileIdArr.length; i++) {
        //         if (fileIdArr[i] != '') {
        //             filestr += fileIdArr[i] + '|';
        //         }
        //     }
        //     filestr = filestr.slice(0, filestr.length - 1);

        //     var idObj = { id: filestr, ispass: 1 }
        //     if (roleArr.indexOf('访问加锁文档') == -1) {
        //         idObj['islock'] = '<>2'
        //     }
        //     local_api._list('document', idObj, '', '', 1, 10, $.cookie('appkey'), function (res) {
        //         console.log(res);
        //         if (res.data.length) {
        //             showFileList(res.data)
        //             initPaginator(res.total, 1, 10, idObj)
        //         } else {
        //             $('.file-list').hide();
        //             $('.g-empty').show();
        //         }

        //     })
        // })
    } else {
        // selectPropFor()
        getTable(function () {
            console.log('ten')
        })
    }


    // $('#query').click(function () {
    //     var name = $('#name').val().trim();
    //     var did = $('#onlyId').val().trim();
    //     var keyword = $('#keyword').val().trim();
    //     createOperate('文件检索')
    //     var obj = {
    //         type: 2
    //     }



    //     if (name || keyword) {
    //         obj['name'] = '^' + (name || keyword)
    //     }
    //     if (did) {
    //         obj['did'] = '^' + did
    //     }

    //     local_api._list('document', obj, '', '', 1, 500, $.cookie('appkey'), function (res) {
    //         var str = []

    //         for (var i = 0; i < res.data.length; i++) {
    //             str.push(res.data[i].id);
    //         }

    //         var obj = { type: 3, ispass: 1 }
    //         if ($('#selC').val() != '') {
    //             obj["tree_path"] = '^' + $('#selC').val()
    //         }
    //         if (res.data.length) {
    //             obj['pid'] = str.join('|')
    //         }
    //         if (keyword) {
    //             obj['name'] = '^' + keyword
    //         }
    //         if (roleArr.indexOf('访问加锁文档') == -1) {
    //             idObj['islock'] = '<>2'
    //         }

    //         if (did && !res.data.length) {
    //             $('.file-list').hide();
    //             $('.g-empty').show();
    //             return false
    //         }

    //         local_api._list('document', obj, '', '', 1, 10, $.cookie('appkey'), function (res) {
    //             if (res.data.length) {
    //                 showFileList(res.data)
    //                 initPaginator(res.total, 1, 10, obj)
    //             } else {
    //                 $('.file-list').hide();
    //                 $('.g-empty').show();
    //             }
    //         })

    //     })

    //     // })


    //     // var obj = {}
    //     // if(keyword){
    //     //     obj['keyword'] = 
    //     // }
    // })


    var isGlobal = true
    $('#query').click(function () {

        isGlobal = false
        var name = $('#name').val().trim();
        var did = $('#onlyId').val().trim();
        var keyword = $('#keyword').val().trim();
        createOperate('文件检索')
        selectPropFor()
        return
        // if (keyword != '') {
        //     vagueQuery(keyword, function (fileIdArr) {
        //         var filestr = ''
        //         // fileIdArr.forEach(ele => {
        //         //     if (ele != '') {
        //         //         filestr += ele + '|';
        //         //     }
        //         // })
        //         for (var i = 0; i < fileIdArr.length; i++) {
        //             if (fileIdArr[i] != '') {
        //                 filestr += fileIdArr[i] + '|';
        //             }
        //         }
        //         filestr = filestr.slice(0, filestr.length - 1);
        //         var idObj = { id: filestr, ispass: 1 }
        //         if (roleArr.indexOf('访问加锁文档') == -1) {
        //             idObj['islock'] = '<>2'
        //         }
        //         local_api._list('document', idObj, '', 'name', 1, 10, $.cookie('appkey'), function (res) {
        //             console.log(res)
        //             if (res.data.length) {
        //                 showFileList(res.data)
        //                 initPaginator(res.total, 1, 10, idObj)
        //             } else {
        //                 $('.file-list').hide();
        //                 $('.g-empty').show();
        //             }
        //         })
        //     })
        // } else {
        //     var obj = {
        //         type: 2
        //     }
        //     if (name || keyword) {
        //         obj['name'] = '^' + name
        //     }
        //     if (did) {
        //         obj['did'] = '^' + did
        //     }

        //     local_api._list('document', obj, '', 'name', 1, 500, $.cookie('appkey'), function (res) {
        //         if (res.data.length) {
        //             showFileList(res.data)
        //             initPaginator(res.total, 1, 10, obj)
        //         } else {
        //             $('.file-list').hide();
        //             $('.g-empty').show();
        //         }
        //     })
        // }

        // var obj = {
        //     type: 2
        // }
        // if (name || keyword) {
        //     obj['name'] = '^' + name
        // }
        // if (did) {
        //     obj['did'] = '^' + did
        // }

        // local_api._list('document', obj, '', '', 1, 500, $.cookie('appkey'), function (res) {
        //     var str = []

        //     for (var i = 0; i < res.data.length; i++) {
        //         str.push(res.data[i].id);
        //     }

        //     var obj = { type: 3, ispass: 1 }
        //     if ($('#selC').val() != '') {
        //         obj["tree_path"] = '^' + $('#selC').val()
        //     }
        //     if (res.data.length) {
        //         obj['pid'] = str.join('|')
        //     }
        //     if (keyword) {
        //         obj['name'] = '^' + keyword
        //     }
        //     if (roleArr.indexOf('访问加锁文档') == -1) {
        //         idObj['islock'] = '<>2'
        //     }

        //     if (did && !res.data.length) {
        //         $('.file-list').hide();
        //         $('.g-empty').show();
        //         return false
        //     }

        //     local_api._list('document', obj, '', '', 1, 10, $.cookie('appkey'), function (res) {
        //         if (res.data.length) {
        //             showFileList(res.data)
        //             initPaginator(res.total, 1, 10, obj)
        //         } else {
        //             $('.file-list').hide();
        //             $('.g-empty').show();
        //         }
        //     })

        // })
    })



    // function getDocuList(val, page) {
    //     local_api._list('document', val, '', '', page, 10, $.cookie('appkey'), function (res) {
    //         showFileList(res.data)
    //     })
    // }
    var allData = [];
    // function showFileList(data) {

    //     if (allData.length) {
    //         var pidArr = [];
    //         // data.forEach(ele => {
    //         //     ele.tree_addr = getNavTree(ele.pid, allData);
    //         //     ele.pfid = docParent(allData, ele.pid);
    //         //     pidArr.push(docParent(allData, ele.pid))
    //         // })

    //         for (var i = 0; i < data.length; i++) {
    //             data[i].tree_addr = getNavTree(data[i].pid, allData);
    //             data[i].pfid = docParent(allData, data[i].pid);
    //             pidArr.push(docParent(allData, data[i].pid))
    //         }
    //         local_api._list('docProp', { fid: pidArr.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (prop) {
    //             // data.forEach(ele => {
    //             //     prop.data.forEach(e => {
    //             //         if (e.fid == ele.pfid) {
    //             //             console.log(e)
    //             //             ele._postion = `${e.qnum}区${e.lnum}列${e.ce == 1 ? '左' : '右'}侧${e.jnum}节${e.cnum}层${e.bnum}本`
    //             //             // ele._postion_ = `${e.qnum}_${e.lnum}_${e.ce}_${e.jnum}_${e.cnum}_${e.bnum}`
    //             //         }
    //             //     })
    //             // })

    //             for (var i = 0; i < data.length; i++) {
    //                 for (var j = 0; j < prop.data.length; j++) {
    //                     if (prop.data[j].fid == data[i].pfid) {
    //                         console.log(prop.data[j])
    //                         data[i]._postion = `${prop.data[j].lnum}列${prop.data[j].ce == '1' ? '左' : '右'}侧${prop.data[j].jnum}节${prop.data[j].cnum}层${prop.data[j].onum || ''}本`
    //                     }
    //                 }
    //             }
    //             $('.file-list').empty();
    //             $('.file-list').show();
    //             $('.g-empty').hide();
    //             $('.file-list').append(createFilesHtmls(data));
    //             $('.file-list .file-item>div').on('click', function (e) {
    //                 // debugger;
    //                 if (e.target.nodeName == 'BUTTON') {
    //                     openM(e)
    //                     return;
    //                 }
    //                 if (e.target.nodeName != 'A') {
    //                     linkfile(e)
    //                 }
    //             })
    //         })
    //     } else {
    //         local_api._list('document', { type: '0|1|2|4', u_path: '^' + $.cookie('tree_path') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
    //             allData = res.data;
    //             var pidArr = [];
    //             // data.forEach(ele => {
    //             //     ele.tree_addr = getNavTree(ele.pid, allData);
    //             //     ele.pfid = docParent(allData, ele.pid);
    //             //     pidArr.push(docParent(allData, ele.pid))
    //             // })
    //             for (var i = 0; i < data.length; i++) {
    //                 data[i].tree_addr = getNavTree(data[i].pid, allData);
    //                 data[i].pfid = docParent(allData, data[i].pid);
    //                 pidArr.push(docParent(allData, data[i].pid))
    //             }
    //             local_api._list('docProp', { fid: pidArr.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (prop) {
    //                 // data.forEach(ele => {
    //                 //     prop.data.forEach(e => {
    //                 //         if (e.fid == ele.pfid) {
    //                 //             console.log(e)
    //                 //             ele._postion = `${e.qnum}区${e.lnum}列${e.ce == 1 ? '左' : '右'}侧${e.jnum}节${e.cnum}层${e.bnum}本`
    //                 //             // ele._postion_ = `${e.qnum}_${e.lnum}_${e.ce}_${e.jnum}_${e.cnum}_${e.bnum}`
    //                 //         }
    //                 //     })
    //                 // })
    //                 for (var i = 0; i < data.length; i++) {
    //                     for (var j = 0; j < prop.data.length; j++) {
    //                         if (prop.data[j].fid == data[i].pfid) {
    //                             console.log(prop.data[j])
    //                             data[i]._postion = `${prop.data[j].lnum}列${prop.data[j].ce == 'l' ? '左' : '右'}侧${prop.data[j].onum || ''}`
    //                         }
    //                     }
    //                 }
    //                 $('.file-list').empty();
    //                 $('.file-list').show();
    //                 $('.g-empty').hide();
    //                 $('.file-list').append(createFilesHtmls(data));
    //                 $('.file-list .file-item>div').on('click', function (e) {
    //                     // console.log(e)
    //                     // debugger;
    //                     if (e.target.nodeName == 'BUTTON') {
    //                         openM(e)
    //                         return;
    //                     }
    //                     if (e.target.nodeName != 'A') {
    //                         linkfile(e)
    //                     }

    //                 })
    //                 // console.log(prop)
    //             })
    //             // console.log(pidArr)

    //         })
    //     }

    // }

    // function linkfile(e) {
    //     var pid = e.currentTarget.dataset.filePid;
    //     var path = e.currentTarget.dataset.filepath;
    //     // path = `/js/pdf/generic/web/viewer.html?file=${path}`
    //     // window.open(path, '_blank')
    //     path = '/file?fileId=' + e.currentTarget.dataset.fileId;
    //     window.open(path, '_blank')
    // }
    // function initPaginator(total, currentpage, numberOfPages, val) {
    //     var totalPages = Math.ceil(total / numberOfPages)
    //     $('#pageLimit').bootstrapPaginator({
    //         currentPage: currentpage,
    //         totalPages: totalPages,
    //         size: "normal",
    //         bootstrapMajorVersion: 3,
    //         alignment: "right",
    //         numberOfPages: 6,
    //         itemTexts: function (type, page, current) {
    //             switch (type) {
    //                 case "first": return "首页";
    //                 case "prev": return "上一页";
    //                 case "next": return "下一页";
    //                 case "last": return "末页";
    //                 case "page": return page;
    //             }
    //         },
    //         onPageClicked: function (event, originalEvent, type, page) {
    //             // console.log(page)
    //             getDocuList(val, page)
    //         }
    //     });
    // }

    $('#search').on('keypress', function (e) {
        if (e.keyCode == 13) {
            var val = e.target.value.trim();
            if (val != '') {
                isGlobal = true
                selectPropFor()
                return
                // vagueQuery(val, function (fileIdArr) {
                //     var filestr = ''
                //     // fileIdArr.forEach(ele => {
                //     //     if (ele != '') {
                //     //         filestr += ele + '|';
                //     //     }
                //     // })
                //     for (var i = 0; i < fileIdArr.length; i++) {
                //         if (fileIdArr[i] != '') {
                //             filestr += fileIdArr[i] + '|';
                //         }
                //     }
                //     filestr = filestr.slice(0, filestr.length - 1);
                //     var idObj = { id: filestr, ispass: 1 }
                //     if (roleArr.indexOf('访问加锁文档') == -1) {
                //         idObj['islock'] = '<>2'
                //     }
                //     local_api._list('document', idObj, '', '', 1, 10, $.cookie('appkey'), function (res) {
                //         console.log(res)
                //         if (res.data.length) {
                //             showFileList(res.data)
                //             initPaginator(res.total, 1, 10, idObj)
                //         } else {
                //             $('.file-list').hide();
                //             $('.g-empty').show();
                //         }
                //     })
                //     // }
                //     // console.log(res)
                // })
            }
        }
    })

    // function getNavTree(fileId, allData) {
    //     var parents = dataControl.getParentss(allData, fileId).reverse();
    //     var str = '';
    //     var str1 = ''
    //     // parents.forEach(el => {
    //     //     if (roleArr.indexOf('目录') == -1) {
    //     //         str += `<a href="#">${el.name}</a>` + '/'
    //     //     } else {
    //     //         str += `<a href="/file?fileId=${el.id}">${el.name}</a>` + '/';
    //     //     }
    //     //     str1 += `${el.name}` + '/'
    //     //     // console.log(e)
    //     // })

    //     for (var i = 0; i < parents.length; i++) {
    //         if (roleArr.indexOf('目录') == -1) {
    //             str += `<a href="#">${parents[i].name}</a>` + '/'
    //         } else {
    //             str += `<a href="/file?fileId=${parents[i].id}">${parents[i].name}</a>` + '/';
    //         }
    //         str1 += `${parents[i].name}` + '/'
    //         // console.log(e)
    //     }
    //     console.log(str)
    //     return { str, str1 }
    // }

    // function docParent(data, id) {
    //     var dd;
    //     for (var i = 0; i < data.length; i++) {
    //         if (data[i].id == id && data[i].type == 2) {
    //             dd = data[i].id;
    //             break;
    //         } else if (data[i].id == id) {
    //             dd = docParent(data, data[i].pid);
    //             break;
    //         }
    //     }
    //     return dd
    // }

    function vagueQuery(selectPropName, val, callback) {
        var docColumns = selectObj[selectPropName]
        if (docColumns.length) {
            var obj = {};

            for (var i = 0; i < docColumns.length; i++) {
                obj[docColumns[i]] = val;
            }
            queryRetrive(selectPropName, val, obj, callback)
        }
    }

    function queryRetrive(selectPropName, val, obj, callback) {
        var fileIdArr = [];
        local_api._vlist(selectPropName, obj, '', '', 1, 200, $.cookie('appkey'), function (res) {

            for (var i = 0; i < res.data.length; i++) {
                // if(res.data[0].propName == selectPropName){
                fileIdArr.push(res.data[i].fid);
                // }

            }
            var obj = {
                name: val,
                did: val,
                keyword: val,

            }
            local_api._vlist('document', obj, 'propName,type,pid,id', '', 1, -1, $.cookie('appkey'), function (res) {
                for (var i = 0; i < res.data.length; i++) {
                    if (res.data[i].propName == selectPropName && fileIdArr.length <= 300) {
                        if (res.data[i].type == 3) {
                            fileIdArr.push(res.data[i].pid);
                        } else {
                            fileIdArr.push(res.data[i].id);
                        }
                    }

                }
                callback(fileIdArr)
                // var idObj = { id: fileIdArr.join('|') }
                // local_api._list('document', idObj, '', '', 1, -1, $.cookie('appkey'), function (res) {
                //     var fileIdArr = []
                //     for (var i = 0; i < res.data.length; i++) {
                //         fileIdArr.push(res.data[i].id);
                //     }
                //     callback(fileIdArr)
                // })
            })

        })
        console.log(obj)
    }

    var appInterval;
    function openM(e, name) {
        var docProId = e
        // console.log(e.target.dataset, 'ddd')
        // var docProId = e.target.dataset.docprpid
        // if(_position.length >= 5){

        createOperate('打开密集柜')
        // var docProId = ev.id.slice('openProo_'.length, ev.id.length);
        local_api._get(name, { fid: docProId }, '', $.cookie('appkey'), function (res) {
            if (res.data) {
                // var qu = parseInt(res.data.qnum || 0);
                // var lie = parseInt(res.data.lnum || 0);
                var col = parseInt(res.data.lnum || 0);
                var side = parseInt(res.data.ce || 0);
                var section = parseInt(res.data.jnum || 0);
                var layer = parseInt(res.data.cnum || 0);
                var docname = '';
                // var jie = parseInt(res.data.jnum || 0);
                // var ceng = parseInt(res.data.cnum || 0);
                // var ce = res.data.ce
                // var bh = parseInt(res.data.bnum || 1);
                if (col > 0 && side>=0 && section > 0 && layer > 0) {
                    var url = 'col=' + col + '&side=' + side + '&section=' + section + '&layer=' + layer + '&docname=' + docname
                    $.ajax({
                        url: '/openApi?' + url,
                        type: 'get',
                        dataType: 'json',
                        success: function (oS) {
                            var status = oS.status
                            status = JSON.parse(status)
                            if (status.resultcode == 0) {
                                showTips('ok', '密集柜已打开！');
                            } else {
                                showTips('err', '密集柜打开失败！');
                            }
                        }
                    })
                } else {
                    showTips('err', '无位置信息，无法打开密集柜！');
                }
            } else {
                showTips('err', '无位置信息，无法打开密集柜！');
            }
        })
    }


    // tools.addEvent(tools.$('#search')[0], 'focus', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     tools.addClass(searchBar, 'focus')
    // })
    // tools.addEvent(tools.$('#search')[0], 'blur', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)

    // })

    $(document).on('click', '.file-title-addr a', function (ev) {
        ev.stopPropagation(); //阻止打开页面
        // alert(1)
    })

    // var selectTable = ['编码卡资料', '登记备案合同']
    function selectPropFor() {
        $('.file-list').empty()
        allData = []
        selectTable.forEach((e, index) => {
            getColumnsAll(e, function (array) {
                selectObj[e] = array
                showTableHeader(index, e, array)
            })
        })
    }
    //获取分类表字段
    var selectObj = {}
    function getColumnsAll(name, cb) {
        console.log(name)
        filterColumns = []
        allSelectPropColumn = ['位置']
        local_api.getTableColumns(name, $.cookie('appkey'), function (colum) {
            filterColumns = []
            if (colum.err) {
                return
            }
            for (var i = 0; i < colum.row.length; i++) {
                if (fixPropArr.indexOf(colum.row[i].Field) == -1) {
                    filterColumns.push(colum.row[i].Field)
                }
            }
            console.log(filterColumns)
            cb(filterColumns)
        })
    }


    function checkFun() {
        console.log($(this).attr('id'))
        var _id = $(this).attr('id')
        var index = _id.split('_')[1]
        // console.log($("[type='checkbox'][class='tableCheck"+index+" tableCheck']"),$('#'+_id))
        $("[type='checkbox'][class='tableCheck" + index + " tableCheck']").prop("checked", $('#' + _id).prop("checked"));
        // $()
    }

    var reverObj = {
        名称: 'name',
        档号: 'did',
        创建时间: 'createdAt',
    }
    var ceobj = {
        1: '左',
        0: '右'
    }
    $('#export').on('click', function () {
        getAllExportData()
    })
    function getAllExportData() {
        console.log($(".tableCheck:checked"))

        var isExist = {}
        var exportData = []
        var index = 0
        $(".tableCheck:checked").each(function (ind, e) {
            var id = $(e).data().fileid
            var nowData = allData.filter(e => e.id == id)
            var name = nowData[0].propName
            var arrString = localStorage.getItem(name + 'tableHearder')
            var arrArray = JSON.parse(arrString) || ['名称', '创建时间', '操作']

            arrArray.splice(arrArray.length - 1, 1)
            console.log(arrArray)
            if (!isExist[name]) {
                index = 0
                isExist[name] = name
                var headerArray = [name]
                headerArray.length = arrArray.length
                exportData.push(headerArray)
                exportData.push(arrArray)
            }
            index += 1
            console.log(index)
            var newArray = []
            arrArray.forEach(function (e, i) {
                switch (e) {
                    case '序号':
                        newArray.push(index)
                        break
                    case '位置':
                        var position = !nowData[0].qnum ? '' : nowData[0].lnum + '列' + ceobj[parseInt(nowData[0].ce)] + '侧' + (nowData[0].jnum || '') + '节' + (nowData[0].cnum || '') + '层' + (nowData[0].onum || '') + '本'
                        newArray.push(position)
                        break
                    case '创建时间':
                        newArray.push(new Date(nowData[0].createdAt).format('yyyy-MM-dd hh:mm:ss'))
                        break
                    default:
                        newArray.push(nowData[0][(reverObj[e] || e)])
                        break;
                }
                // console.log()

            })
            exportData.push(newArray)
        })
        console.log(exportData)
        var sheet = XLSX.utils.aoa_to_sheet(exportData);
        openDownloadDialog(sheet2blob(sheet), '导出.xlsx');

    }
    function openDownloadDialog(blob, name) {
        if (typeof blob == 'object' && blob instanceof Blob) {
            blob = URL.createObjectURL(blob); // 创建blob地址
        }

        var a = document.createElement("a");
        $('body').append(a)
        // 利用URL.createObjectURL()方法为a元素生成blob URL
        a.href = blob;
        // 设置文件名
        a.download = name;
        a.click()
        $(a).remove()
    }

    // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
  function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
      SheetNames: [sheetName],
      Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    var wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    // 字符串转ArrayBuffer
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    return blob;
  }



    function showTableHeader(index, name, colum) {

        //自定义属性
        // var docPropArray = JSON.parse(localStorage.getItem('docProp')) || []
        // $('#custom-prop').empty()
        // for (var i = 0; i < docPropArray.length; i++) {
        //     var string = `<li style="margin-top: 10px">
        //       <label class="ellipsis ulLabel">${docPropArray[i]}</label>
        //       <input data-name="${docPropArray[i]}" value="" class="form-control recordAssign"  style="height: 20px;width:70%;display: inline-block;"/>
        //   </li>`
        //     $('#custom-prop').append(string)
        // }
        var tableId = "fileAll_list_" + index
        var table = document.createElement('table')
        table.className = "table table-hover table-striped table-bordered"
        table.width = '100%'
        table.cellpadding = "0"
        table.cellspacing = "0"
        table.border = "0"
        table.id = tableId
        var template = '<thead><tr class="tops"></tr></thead><tbody></tbody>'
        table.innerHTML = template

        var nameDiv = document.createElement('div')
        nameDiv.id = "fileAll_list_" + index + '_header'
        nameDiv.innerText = name

        var nameDiv2 = document.createElement('div')
        nameDiv2.id = "fileAll_list_" + index + '_content'
        // nameDiv.innerText = name

        $('.file-list').append(nameDiv2)
        $(nameDiv2).append(nameDiv)
        $(nameDiv2).append(table)

        var arrString = localStorage.getItem(name + 'tableHearder')


        var arrArray = JSON.parse(arrString) || ['名称', '创建时间', '操作']
        // arrArray.splice(1,0,'分类')
        console.log(arrArray)
        var th = document.createElement('th')
        th.width = '20px'
        th.style = {
            textAlign: 'center !important'
        }

        var input = document.createElement('input')
        input.type = "checkbox"
        input.id = "checkAll_" + index
        // th.innerHTML = '<input type="checkbox" id="checkAll >'
        $($('#' + tableId + ' .tops')[0]).empty()
        console.log(th, 'th')
        $($('#' + tableId + ' .tops')[0]).append(th)
        // console.log($(th), 'th')
        $(th).append(input)

        $('#' + input.id).off('click', checkFun)
        $('#' + input.id).on('click', checkFun)
        // var innerString = '<th width="20px" style="text-align: center !important;"><input type="checkbox" id="checkAll ></th>' + '<span></span>'
        var _columns = [{
            "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                // console.log(obj.oSettings.sTableId)
                var classs = 'tableCheck' + obj.oSettings.sTableId.split('_')[2]
                return "<input type='checkbox' class='" + classs + " tableCheck' data-fileId='" + obj.aData.id + "' data-tree_path='" + obj.aData.tree_path + "' data-name='" + obj.aData.name + "' data-size='" + obj.aData.size + "' data-type='" + obj.aData.type + "' value='" + obj.aData.id + "'>";
            }
        }]
        tableDefaultObj = {}
        for (var i = 0; i < arrArray.length; i++) {
            // innerString += '<th width="120">' + arrArray[i] + '</th>'
            tableDefaultObj[arrArray[i]] = ''

            var th = document.createElement('th')
            th.width = '120'
            if (arrArray[i] == '操作') {
                th.width = 80
            }
            if (arrArray[i] == '序号') {
                th.width = '50px'
            }
            th.innerText = arrArray[i]
            $('#' + tableId + ' .tops').append(th)
            var obj = { "mData": tableCloumnsReverse[arrArray[i]] || arrArray[i], "sClass": "ms_left" }
            obj.fnRender = function (obj) {
                console.log(obj)
                return '<span class="file_name" style="display:inline-block;cursor:pointer;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-type="' + (obj.aData.type) + '" data-id="' + (obj.aData.id) + '" title="' + (obj.aData[obj.mDataProp] || "") + '">' + (obj.aData[obj.mDataProp] || "") + '</span>'
            }
            var ceobj = { 1: '左', 0: '右' }
            switch (arrArray[i]) {
                case '序号':
                    obj.mData = null
                    obj.fnRender = function (obj, obj2) {
                        // console.log(obj,obj2)
                        var xh = obj.oSettings._iDisplayStart + obj.iDataRow + 1
                        return xh
                    }
                    break;
                case '名称':
                    obj.mData = null
                    obj.fnRender = function (obj) {
                        return '<span class="file_name" style="display:inline-block;cursor:pointer;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-type="' + (obj.aData.type) + '" data-id="' + (obj.aData.id) + '" title=" ' + obj.aData.name + '"> ' + obj.aData.name + '</span>'
                    }
                    break;
                case '位置':
                    obj.mData = null
                    obj.fnRender = function (obj) {
                        var position = !obj.aData.qnum ? '' : obj.aData.lnum + '列' + ceobj[parseInt(obj.aData.ce)] + '侧' + (obj.aData.jnum || '') + '节' + (obj.aData.cnum || '') + '层' + (obj.aData.onum || '') + '本'
                        return '<span class="file_name" style="display:inline-block;cursor:pointer;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" data-type="' + (obj.aData.type) + '" data-id="' + (obj.aData.id) + '" title="' + (position) + '">' + (position) + '</span>'
                    }
                    break;
                case '创建时间':
                    obj.mData = null
                    obj.fnRender = function (obj) {
                        // console.log(obj,'objobjobj')
                        return new Date(obj.aData.createdAt).format('yyyy-MM-dd hh:mm:ss');
                    }
                    break
                case '操作':
                    obj.mData = null
                    obj.sClass = 'ms_fixed'
                    obj.fnRender = function (obj) {
                        console.log(obj.aData.type)
                        if (obj.aData.type == 2) {
                            return "<a href='#' title='跳转'><i class='icon-eye-open' file_id='" + obj.aData.id + "'></i>&nbsp;&nbsp;</a><a href='#' title='修改'><i class='icon-edit' file_id='" + obj.aData.id + "' table_name='" + name + "'></i></a>&nbsp;&nbsp;<a href='#' title='打开密集柜'><i class='openDoc icon-lock' file_id='" + obj.aData.id + "' table_name='" + name + "'></i></a>";
                        } else if (obj.aData.type == 3) {
                            return "<a href='#' title='浏览'><i class='icon-eye-open' data-type='" + obj.aData.type + "' data-tree_path='" + obj.aData.tree_path + "' data-name='" + obj.aData.name + "'  data-fileId='" + obj.aData.id + "'></i></a>";
                        } else {
                            return ''
                        }

                    }
                    break
                case '分类':
                    obj.mData = null
                    obj.sClass = "ms_center"
                    obj.fnRender = function (obj) {
                        var name = obj.aData.propName || ''
                        return '<span class="file_name" style="display:inline-block;cursor:pointer;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"  title="' + name + ' ">' + name + '</span>'
                        // console.log(obj)
                        // var sel = obj.aData.CData.filter(ele => obj.aData.tree_path.indexOf(ele.tree_path) > -1)
                        // console.log(sel)
                        // return (sel[0] || {}).name || ''
                    }
                    break
            }
            _columns.push(obj)
        }
        // console.log($('.file-list .tops').html())

        var scrollX = (arrArray.length - 1) * 120 + 80

        if ($(window).width() - 180 > scrollX) {
            scrollX = $(window).width() - 180
        }

        console.log(scrollX)

        showTable(_columns, scrollX, tableId)




    }


    //表格显示
    var fileList_table
    function showTable(_columns, scrollX, tableId) {



        var sScrollY = $(window).height() - 300 + 'px'
        $('#' + tableId)[0].style.width = scrollX + 'px'
        console.log(sScrollY)


        var objTable = {
            "bDestroy": true,
            "bAutoWidth": false,
            // "sScrollX": scrollX + 'px',
            "sScrollY": sScrollY,
            "sScrollX": "100%",
            "sScrollXInner": scrollX + 'px',
            "bInfo": true,
            "iDisplayLength": 10,
            "aLengthMenu": [[15, 50, 100, 500], [15, 50, 100, 500]],
            "bLengthChange": true,
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

            // fixedColumns: { leftColumns: 0, rightColumns: 1 }
        };

        // if (fileList_table) {
        //     fileList_table.fnClearTable();
        // }

        fileList_table = $("#" + tableId).dataTable(objTable);
        // console.log(fileList_table,tableId)
        (function (fileList_table2) {
            setTimeout(function () {
                // console.log(`闭包 ${i}`);
                //alert("闭包"+ i);
                new FixedColumns(fileList_table2, {
                    "iLeftColumns": 0,
                    "iRightColumns": 1
                });
            }, 2000)
        })(fileList_table);
        // setTimeout(function () {
        // new FixedColumns(fileList_table, {
        //     "iLeftColumns": 0,
        //     "iRightColumns": 1
        // });
        // }, 200)


    };
    var tableCloumnsReverse = {
        "名称": 'name',
        '保存期限': 'saveExpireIn',
        '创建时间': 'createdAt',
        "档号": 'did',
        "文件类型": 'type',
    }

    function moveTableTop(tableId) {
        var cur_li = $('#' + tableId + '_content')
        console.log(cur_li)
        // var cur_li2 = $('#' + tableId+ '_header')
        var first_li = $('.file-list>div').eq(0)
        console.log(first_li)
        first_li.before(cur_li);
        // first_li = $('.file-list div').eq(0)
        // first_li.before(cur_li2);


    }
    //表格渲染之前处理
    function retrieveData(sSource, aoData, fnCallback, oSettings) {
        // var key = $('#deviceKey').val().trim();
        console.log(sSource, 'sSource', aoData, oSettings.sTableId)
        var nowTableId = oSettings.sTableId

        var selectPropName = selectTable[oSettings.sInstance.split('_')[2]]
        console.log(selectPropName)
        // var query_json;
        var page_count = aoData[4].value;
        var page_no = (aoData[3].value / page_count) + 1
        // var json = {
        //     pid: queryfileId,
        //     u_path: '^' + u_path
        // };
        var value = ''
        if (isGlobal) {
            value = $('#search').val()
        } else {
            value = $('#keyword').val()
        }

        var descLength = $('.dataTables_scrollHeadInner .sorting_desc').length
        var ascLength = $('.dataTables_scrollHeadInner .sorting_asc').length
        var text = ''
        // var textAcc = 
        if (descLength) {
            text = $('.dataTables_scrollHeadInner .sorting_desc').text()
        }
        if (ascLength) {
            text = $('.dataTables_scrollHeadInner .sorting_asc').text()
        }

        var _sortString = 'document.id'

        if (text !== '位置') {
            if (descLength) {
                _sortString = '-' + (tableCloumnsReverse[text] || text)
            }
            if (ascLength) {
                _sortString = (tableCloumnsReverse[text] || text)
            }
        }



        if (value) {
            vagueQuery(selectPropName, value, function (fileIdArr) {
                var filestr = ''
                // fileIdArr.forEach(ele => {
                //     if (ele != '') {
                //         filestr += ele + '|';
                //     }
                // })
                for (var i = 0; i < fileIdArr.length; i++) {
                    if (fileIdArr[i] != '') {
                        filestr += fileIdArr[i] + '|';
                    }
                }
                filestr = filestr.slice(0, filestr.length - 1);
                var json = { 'document.id': filestr, 'document.ispass': 1 }
                if (!isGlobal) {
                    $('#name').val() ? json['document.name'] = '^' + $('#name').val() : ''
                    $('#onlyId').val() ? json['document.did'] = '^' + $('#onlyId').val() : ''
                }


                if (roleArr.indexOf('访问加锁文档') == -1) {
                    json['document.islock'] = '<>2';
                }
                // if ($("#selD").find("option:selected").text() == '全部') {
                //     json['tree_path'] = $("#selD").val();
                // }
                var table = {
                    table1: 'document',
                    table2: selectPropName,
                }
                json['document.u_path'] = $.cookie('tree_path');
                json['document.propName'] = selectPropName;
                var files = '*'
                var joinCdn = 'document.id = ' + selectPropName + '.fid'
                local_api._listUnionUrl(table, json, files, _sortString, joinCdn, '', page_no, page_count, $.cookie('appkey'), function (res) {
                    json.sEcho = aoData[0].value;
                    json.iTotalRecords = res.total;
                    json.iTotalDisplayRecords = res.total;
                    json.data = res.data
                    json.aaData = res.data;

                    // allData = res.data

                    allData = allData.concat(res.data)
                    if (res.total && page_no == 1) {
                        // setTimeout(function () { moveTableTop(nowTableId) }, 1000)
                        moveTableTop(nowTableId)
                    }
                    fnCallback(json);
                })
                // local_api._list('document', json, '', '', page_no, page_count, $.cookie('appkey'), function (json) {
                //     json.sEcho = aoData[0].value;
                //     json.iTotalRecords = json.total;
                //     json.iTotalDisplayRecords = json.total;
                //     var fidArray = []
                //     for (var i = 0; i < json.data.length; i++) {
                //         json.data[i].index = i;
                //         if (json.data[i].type == 2) {
                //             fidArray.push(json.data[i].id)
                //         }
                //     }

                //     local_api._list('docProp', { fid: fidArray.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (docJson) {
                //         console.log(docJson, tableDefaultObj, 'json')
                //         var afterData = []
                //         var isCopy = {}
                //         if (docJson.data.length) {
                //             for (var i = 0; i < json.data.length; i++) {
                //                 if (json.data[i].type != 2) {
                //                     var obj = Object.assign({}, tableDefaultObj, json.data[i])
                //                     afterData.push(obj)
                //                 } else {
                //                     for (var j = 0; j < docJson.data.length; j++) {
                //                         if (json.data[i].id == docJson.data[j].fid) {
                //                             isCopy[json.data[i].id] = 1
                //                             var obj = Object.assign({}, docJson.data[j], json.data[i])
                //                             afterData.push(obj)
                //                         }
                //                     }


                //                     if (!isCopy[json.data[i].id]) {
                //                         var obj = Object.assign({}, tableDefaultObj, json.data[i])
                //                         afterData.push(obj)
                //                     }
                //                 }


                //             }
                //         } else {
                //             for (var i = 0; i < json.data.length; i++) {


                //                 var obj = Object.assign({}, tableDefaultObj, json.data[i])
                //                 afterData.push(obj)
                //             }
                //         }

                //         console.log(afterData, isCopy, 'afterData')
                //         json.data = afterData
                //         json.aaData = json.data;
                //         fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式
                //     })


                // })
            })
        } else {
            // var json = { ispass: 1, type: 2 }
            // if (!isGlobal) {
            //     $('#name').val() ? json['name'] = '^' + $('#name').val() : ''
            //     $('#onlyId').val() ? json['did'] = '^' + $('#onlyId').val() : ''
            // }
            var json = { 'document.ispass': 1, 'document.type': 2 }
            if (!isGlobal) {
                $('#name').val() ? json['document.name'] = '^' + $('#name').val() : ''
                $('#onlyId').val() ? json['document.did'] = '^' + $('#onlyId').val() : ''
            }


            if (roleArr.indexOf('访问加锁文档') == -1) {
                json['document.islock'] = '<>2';
            }
            // if ($("#selD").find("option:selected").text() == '全部') {
            //     json['tree_path'] = $("#selD").val();
            // }
            var table = {
                table1: 'document',
                table2: selectPropName,
            }
            json['document.u_path'] = $.cookie('tree_path');
            json['document.propName'] = selectPropName;
            var files = '*'
            var joinCdn = 'document.id = ' + selectPropName + '.fid'
            local_api._listUnionUrl(table, json, files, _sortString, joinCdn, '', page_no, page_count, $.cookie('appkey'), function (res) {
                json.sEcho = aoData[0].value;
                json.iTotalRecords = res.total;
                json.iTotalDisplayRecords = res.total;
                json.data = res.data
                json.aaData = res.data;

                // allData = res.data
                allData = allData.concat(res.data)
                if (res.total && page_no == 1) {
                    // setTimeout(function () { moveTableTop(nowTableId) }, 3000)
                    moveTableTop(nowTableId)
                }
                fnCallback(json);
            })

            // if ($("#selD").find("option:selected").text() == '全部' || $("#selC").find("option:selected").text() == '全部') {
            //     json['tree_path'] = '^' + $("#selD").val();
            // } else {
            //     json['tree_path'] = '^' + $("#selC").val();
            // }
            // // debugger

            // if (roleArr.indexOf('访问加锁文档') == -1) {
            //     json['islock'] = '<>2';
            // }
            // local_api._list('document', json, '', '', page_no, page_count, $.cookie('appkey'), function (json) {
            //     json.sEcho = aoData[0].value;
            //     json.iTotalRecords = json.total;
            //     json.iTotalDisplayRecords = json.total;
            //     var fidArray = []
            //     for (var i = 0; i < json.data.length; i++) {
            //         json.data[i].index = i;
            //         if (json.data[i].type == 2) {
            //             fidArray.push(json.data[i].id)
            //         }
            //     }

            //     local_api._list('docProp', { fid: fidArray.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (docJson) {
            //         console.log(docJson, tableDefaultObj, 'json')
            //         var afterData = []
            //         var isCopy = {}
            //         if (docJson.data.length) {
            //             for (var i = 0; i < json.data.length; i++) {
            //                 json.data[i].CData = CData
            //                 if (json.data[i].type != 2) {
            //                     var obj = Object.assign({}, tableDefaultObj, json.data[i])
            //                     afterData.push(obj)
            //                 } else {
            //                     for (var j = 0; j < docJson.data.length; j++) {
            //                         if (json.data[i].id == docJson.data[j].fid) {
            //                             isCopy[json.data[i].id] = 1
            //                             var obj = Object.assign({}, docJson.data[j], json.data[i])
            //                             afterData.push(obj)
            //                         }
            //                     }


            //                     if (!isCopy[json.data[i].id]) {
            //                         var obj = Object.assign({}, tableDefaultObj, json.data[i])
            //                         afterData.push(obj)
            //                     }
            //                 }
            //             }
            //         } else {
            //             for (var i = 0; i < json.data.length; i++) {
            //                 json.data[i].CData = CData
            //                 var obj = Object.assign({}, tableDefaultObj, json.data[i])
            //                 afterData.push(obj)
            //             }
            //         }
            //         console.log(afterData, isCopy, 'afterData')
            //         json.data = afterData
            //         json.aaData = json.data;
            //         fnCallback(json); //服务器端返回的对象的returnObject部分是要求的格式
            //     })


            // })
        }

    }


    $(document).on('click', '.icon-eye-open', function () {
        console.log($(this).attr('file_id'))
        var href = 'http://' + location.host + '/file?fileId=' + $(this).attr('file_id')
        window.open(href, '_blank')
    })

    $(document).on('click', '.openDoc', function () {
        $('.openDoc.icon-unlock').removeClass('icon-unlock')
        $(this).addClass('icon-unlock')
        // console.log($(this).attr('file_id'))
        openM($(this).attr('file_id'), $(this).attr('table_name'))
        // var href = 'http://' + location.host + '/file?fileId='+$(this).attr('file_id')
        // window.open(href,'_blank')
    })


    //     $('#qnum').empty().append(setOption());
    //   $('#lnum').empty().append(setOption());
    //   $('#jnum').empty().append(setOption());
    //   $('#cnum').empty().append(setOption());
    function setOption() {
        var positionNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        ;
        var str = '';
        positionNumber.forEach(function (ele) {
            str += ("<option value=\"" + ele + "\">" + ele + "</option>");
        });
        return str;
    }
    $('#qnum').empty().append(setOption());
    $('#lnum').empty().append(setOption());
    $('#jnum').empty().append(setOption());
    $('#cnum').empty().append(setOption());

    //案卷新增/修改弹框
    $('#divNewPro').dialog({
        width: 500,
        maxHeight: 400,
        autoOpen: false,
        title: "新增案卷",
        buttons: {
            "确定": function () {
                if (nowEditId) {
                    editRecords()
                }


            },
            "取消": function () {
                $('#divNewPro').dialog("close");
            }
        }
    })
    var tableName
    $(document).on('click', '.icon-edit', function () {
        console.log($(this).attr('file_id'))
        nowEditId = $(this).attr('file_id')
        tableName = $(this).attr('table_name')
        var nowData = allData.filter(e => e.id == $(this).attr('file_id'))

        $('#newDocName').val(nowData[0].name)
        oldEditName = nowData[0].name
        oldEditDid = nowData[0].did
        $('#did').val(nowData[0].did)
        $('#lnum').val(nowData[0].lnum)
        $('#jnum').val(nowData[0].jnum);
        $('#cnum').val(nowData[0].cnum);
        $('#onum').val(nowData[0].onum);
        $('#ce').val(nowData[0].ce);

        //自定义属性
        var docPropArray = JSON.parse(localStorage.getItem(tableName)) || []
        $('#custom-prop').empty()
        for (var i = 0; i < docPropArray.length; i++) {
            var string = `<li style="margin-top: 10px">
          <label class="ellipsis ulLabel">${docPropArray[i]}</label>
          <input data-name="${docPropArray[i]}" value="${nowData[0][docPropArray[i]] || ''}" class="form-control recordAssign"  style="height: 20px;width:70%;display: inline-block;"/>
      </li>`
            $('#custom-prop').append(string)
        }

        $('#divNewPro').dialog("open");
        // console.log(nowData)
    })

    function editRecords() {
        var name = $('#newDocName').val()
        var did = $('#did').val()

        var query = {
            id: nowEditId
        }
        var query2 = {
            fid: nowEditId
        }
        var update_json = {
            name: name,
            did: did,
        }

        var prop_json = {
            // name: name,
            // did: did,
            qnum: $('#qnum').val(),
            lnum: $('#lnum').val(),
            jnum: $('#jnum').val(),
            cnum: $('#cnum').val(),
            onum: $('#onum').val(),
            ce: $('#ce').val()
        }
        $('.recordAssign').each(function (index, ele) {
            prop_json[$(ele).data().name] = $(ele).val() || ''
        })

        // local_api.updaet
        local_api._update('document', query, update_json, $.cookie('appkey'), function (res) {
            local_api._update(tableName, query2, prop_json, $.cookie('appkey'), function (doc) {
                local_api._get('document', { id: nowEditId }, 'tree_path,name,did', $.cookie('appkey'), function (hd) {
                    if (oldEditDid == hd.data.did && oldEditName == hd.data.name) {
                        $('#divNewPro').dialog("close");
                        treeData(pid)
                    } else {
                        var oldPath = getDIDName(hd.data, oldEditDid, oldEditName)
                        var newPath = getDIDName(hd.data, hd.data.did, hd.data.name)


                        var handle_json = {
                            type: 1,
                            oldPath: oldPath,
                            newPath: newPath
                        };
                        local_api._rename(handle_json, $.cookie('appkey'), function (han) {
                            console.log(han);
                            $('#divNewPro').dialog("close");
                            selectPropFor()
                            // treeData(pid)
                        })
                    }

                })
            })
        })

    }

    function getDIDName(data, did, name) {
        var path = doc_path(data.tree_path)
        path = path.split('/')
        path[path.length - 2] = did + name;
        path.length = path.length - 1
        path = path.join('/')
        return path
    }

    var docDatas = []

    //获取所有的除文件的所有文档
    function parentAllData(callback) {
        local_api._list('document', { type: '0|1|2|4' }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
            docDatas = res.data;
            callback ? callback() : null;
        });
    }
    parentAllData()
    function doc_path(doc_paths) {
        var tArr = doc_paths.split(',').filter(function (e) {
            return e != '';
        });
        var uploadPath = '';
        tArr.forEach(function (ele) {
            docDatas.forEach(function (e) {
                if (ele == e.id) {
                    if (e.type == 2) { //案卷的话要did + 名称
                        uploadPath += (e.did || '') + e.name + '/';
                    } else {
                        uploadPath += e.name + '/';
                    }

                }
            });
        });
        if (uploadPath == '') { //防止删除整个目录
            uploadPath = 'nodelete/'
        }
        return uploadPath;
    }
})

