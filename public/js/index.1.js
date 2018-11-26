var uploadLiArr = [];
var uploadFileArr = [];
var taskUl = $('.task-list-cont');
var cancalIndexArr = [];
var _g = getSearch();
var tree_path = '';
var u_path = $.cookie('tree_path');
var scrollTop;
var pid = 0;
var contentfileId = $.cookie('contentId');
var moveItem = [];
var movetoTarget = null;
var docDatas;
_readyFun()
function _readyFun() {
    u_path = $.cookie('tree_path');



    /* 主要内容区高度自适应 */

    var header = tools.$('.header')[0];
    var weiyunContent = tools.$('.weiyun-content')[0];
    var headerH = header.offsetHeight;
    var content = tools.$('.content')[0];
    var fileList = tools.$('.file-list')[0]; // 文件展示区容器
    var docProId;
    /* 渲染文件展示区、树形导航区和文件路径区 */

    var datas, childrenDatas;
    console.log(data)
    var treeMenu = tools.$('.tree-menu')[0]; // 树形导航区容器
    var pathNav = tools.$('.path-nav')[0]; // 文件路径导航区容器
    var empty = tools.$('.g-empty')[0]; // 文件展示区空白提醒
    // var parentId = 0; // 父级id，默认为0


    // var isfinish = false;
    var uid = $.cookie('uid');

    // 封装改变高度函数
    function changeHeight() {
        var viewH = document.documentElement.clientHeight;
        weiyunContent.style.height = viewH - headerH + 'px';
        content ? content.style.height = viewH - headerH - 62 + 'px' : '';
        fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : ''
    }

    // 初始化
    changeHeight();
    // 窗口改变时，重新计算可视区高度
    window.onresize = changeHeight;


    function setOption() {
        var positionNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9];;
        var str = '';
        positionNumber.forEach(ele => {
            str += `<option value="${ele}">${ele}</option>`
        })
        return str
    }
    $('#qnum').empty().append(setOption())
    $('#lnum').empty().append(setOption())
    $('#jnum').empty().append(setOption())
    $('#cnum').empty().append(setOption())

    var customArr = [];
    //固定属性
    var fixPropArr = ['id', 'fid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname"]
    $('#divDocPro').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        buttons: {
            "保存": function () {
                if (isbatch) {
                    // console.log(this)
                    saveBatchProp()
                } else {
                    saveDocPro();
                }

            },
            "取消": function () {
                $('#divDocPro').dialog("close");
            }
        }
    })
    $('#selectProp').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '选择自定义属性',
        buttons: {
            "确定": function () {
                $('#selectProp').dialog("close");
            }
        }
    })
    $('#newCustomProp').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '添加新属性',
        buttons: {
            "确定": function () {
                saveNewPro();
            },
            "取消": function () {
                $('#newCustomProp').dialog("close");
            }
        }
    })

    //选择已创建好的属性
    $('#someProp').on('change', function (e) {
        console.log(this.value)
        if (this.value != 0) {
            if (customArr.indexOf(this.value) == -1) {
                customArr.push(this.value)
                appendUlLI(this.value);
                // this.value = 0;
            } else {
                showTips('err', `该属性已存在`);
            }
        }
    })

    //打开新增属性弹框
    $('#newProp').click(function () {
        $('#newCustomProp').dialog('open')
    })

    //打开选择自定义属性弹框
    $('#addCustom').click(function () {
        $('#selectProp').dialog("open");
    })


    //添加新属性
    function saveNewPro() {
        var name = $('#newPropname').val();
        var size = 50;
        local_api._createColumn('docProp', { name: name, size: size }, '', function (res) {
            createOperate('添加自定义属性');
            if (res.err) {
                showTips('err', `添加属性失败`);
                return;
            }
            appendUlLI(name);
            customArr.push(name)
            $('#someProp').append(`<option value="${name}">${name}</option>`)
            $('#newCustomProp').dialog('close')
        })
    }

    //插入到设置属性弹框
    function appendUlLI(name) {
        var li = document.createElement('li');
        li.style.marginTop = '10px';
        li.dataset = name
        var lis = ` 
            <label class="ellipsis" title="${name}">${name}</label>
            <input value="" class="form-control" style="width:50%"/>
            <button class="btn btn-primary newBtn" style="">删除</button>
        `
        li.innerHTML = lis;
        $('#newPropLi').append(li);
        console.log($(li))
        $('button', li).on('click', function (e) {
            console.log(name)
            customArr.splice(customArr.indexOf(name), 1)
            $(e.target).parent().remove()
        })
    }

    var isbatch = false;
    var fileidArr = [];
    var fileTree = [];
    var fileTitleArr = [];
    var fileDocProId = [];
    $('#someProo').on('click', function () {
        isbatch = true;
        fileidArr = [];
        fileTree = [];
        fileTitleArr = [];
        fileDocProId = [];
        console.log(getCheckedFile())
        // get
        if (!getCheckedFile().length) {
            showTips('err', '请选择文件！');
        } else {

            getCheckedFile().forEach(ele => {
                if ($('.item', ele).data().type != 3) {
                    fileidArr.push($('.item', ele).data().fileId);
                    fileTree.push('^' + $('.item', ele).data().tree_path);
                    fileTitleArr.push($('.item .file-title', ele).text())
                }
            })
            console.log(fileidArr, fileTree, fileTitleArr);
            batchSetPro()
        }
    })

    //初始化批量设置属性
    function batchSetPro() {
        local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
            if (!colum.err) {
                customArr = [];
                $('#someProp').empty();
                $('#newPropLi').empty();
                $('#someProp').append(`<option value="${0}">${'可选属性'}</option>`)
                colum.row.forEach(ele => {
                    if (fixPropArr.indexOf(ele.Field) == -1)
                        $('#someProp').append(`<option value="${ele.Field}">${ele.Field}</option>`)
                })
            }
            local_api._list('document', { tree_path: fileTree.join('|'), type: 2 }, '', '', 1, -1, $.cookie('appkey'), function (res) {
                $('#name').val('');
                $('#saveExpireIn').val('');
                $('#createdAt').val('');
                $('#num').val('');
                $('#page').val('');
                $('#did').val('');
                $('#qnum').val(1);
                $('#lnum').val(1);
                $('#jnum').val(1);
                $('#cnum').val(1);
                $('#ce').val(0);
                $('#divDocPro').dialog("option", 'title', '批量设置属性');
                $('#divDocPro').dialog("open");
                res.data.forEach(ele => {
                    fileDocProId.push(ele.id)
                })
                // console.log(res)
            })
        })
    }
    //批量设置属性保存
    function saveBatchProp() {
        console.log(fileDocProId);
        if (!fileDocProId.length) {
            showTips('err', '该档案下没有案卷可设置');
            return;
        }
        // file
        var createBatch = [];
        var create_json = {
            u_path: u_path,
            name: $('#name').val(),
            saveExpireIn: $('#saveExpireIn').val(),
            createdAt: $('#createdAt').val(),
            did: $('#did').val(),
            num: $('#num').val(),
            page: $('#page').val(),
            qnum: $('#qnum').val(),
            lnum: $('#lnum').val(),
            jnum: $('#jnum').val(),
            cnum: $('#cnum').val(),
            ce: $('#ce').val(),
        }
        var liArr = $('#newPropLi li');
        var customJson = {}
        for (var i = 0; i < liArr.length; i++) {
            var li = liArr[i];
            customJson[$('label', li).text()] = $('input', li).val()
        }
        fileDocProId.forEach(ele => {
            var newObj = Object.assign({}, create_json, customJson);
            newObj.fid = ele
            createBatch.push(newObj)
        })
        if (confirm('批量设置属性会覆盖案卷原有属性，是否批量设置属性')) {
            local_api._delete('docProp', { fid: fileDocProId.join('|') }, $.cookie('appkey'), function (del) {
                console.log(del)
                local_api._createBatch('docProp', { data: JSON.stringify({ data: createBatch }) }, $.cookie('appkey'), function (res) {
                    createOperate('批量设置案卷属性')
                    // console.log(res)
                    $('#divDocPro').dialog("option", 'title', '属性');
                    $('#divDocPro').dialog("close");
                })
            })
        }
        console.log(createBatch)
    }

    //初始化单个设置属性
    var isNewProp = false; //是否设置属性
    function setDocPro(ev) {

        isbatch = false;
        docProId = ev.id.slice('docPro_'.length, ev.id.length);
        console.log(docProId)
        local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
            if (!colum.err) {
                customArr = [];
                $('#someProp').empty();
                $('#newPropLi').empty();
                $('#someProp').append(`<option value="${0}">${'可选属性'}</option>`)
                colum.row.forEach(ele => {
                    if (fixPropArr.indexOf(ele.Field) == -1)
                        $('#someProp').append(`<option value="${ele.Field}">${ele.Field}</option>`)
                })
            }
            local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
                console.log(res)
                if (res.status == 0) {
                    if (res.data) {
                        isNewProp = false;
                        $('#name').val(res.data.name);
                        $('#saveExpireIn').val(res.data.saveExpireIn);
                        $('#createdAt').val(res.data.createdAt);
                        $('#num').val(res.data.num);
                        $('#page').val(res.data.page);
                        $('#did').val(res.data.did);
                        $('#qnum').val(res.data.qnum);
                        $('#lnum').val(res.data.lnum);
                        $('#jnum').val(res.data.jnum);
                        $('#cnum').val(res.data.cnum);
                        $('#ce').val(res.data.ce);
                        $('#newPropLi').empty()
                        for (var i in res.data) {
                            if (fixPropArr.indexOf(i) == -1) {
                                if (res.data[i]) {
                                    var li = document.createElement('li');
                                    li.style.marginTop = '10px';
                                    li.dataset = i
                                    var lis = ` 
                                        <label class="ellipsis" title="${i}">${i}</label>
                                        <input value="${res.data[i]}" class="form-control" style="width:60%"/>
                                    `
                                    li.innerHTML = lis;
                                    $('#newPropLi').append(li);
                                }

                            }
                        }
                    } else {
                        isNewProp = true;
                        $('#name').val('');
                        $('#saveExpireIn').val('');
                        $('#createdAt').val('');
                        $('#num').val('');
                        $('#page').val('');
                        $('#did').val('')
                        $('#qnum').val(1);
                        $('#lnum').val(1);
                        $('#jnum').val(1);
                        $('#cnum').val(1);
                        $('#ce').val(0);
                    }
                    $('#divDocPro').dialog("open");
                }
            })
        })
    }
    //保存单个属性
    function saveDocPro() {
        createOperate('单个设置属性')
        if (isNewProp) {
            var create_json = {
                name: $('#name').val(),
                fid: docProId,
                u_path: u_path,
                saveExpireIn: $('#saveExpireIn').val(),
                createdAt: $('#createdAt').val(),
                num: $('#num').val(),
                did: $('#did').val(),
                page: $('#page').val(),
                qnum: $('#qnum').val(),
                lnum: $('#lnum').val(),
                jnum: $('#jnum').val(),
                cnum: $('#cnum').val(),
                ce: $('#ce').val()
            }
            var liArr = $('#newPropLi li');
            var customJson = {}
            for (var i = 0; i < liArr.length; i++) {
                var li = liArr[i];
                customJson[$('label', li).text()] = $('input', li).val()
            }
            Object.assign(create_json, customJson)
            console.log(create_json)
            local_api._create('docProp', create_json, $.cookie('appkey'), function (res) {
                local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
                    $('#divDocPro').dialog("close");
                })

            })
        } else {
            var update_json = {
                name: $('#name').val(),
                saveExpireIn: $('#saveExpireIn').val(),
                createdAt: $('#createdAt').val(),
                num: $('#num').val(),
                did: $('#did').val(),
                page: $('#page').val(),
                qnum: $('#qnum').val(),
                lnum: $('#lnum').val(),
                jnum: $('#jnum').val(),
                cnum: $('#cnum').val(),
                ce: $('#ce').val()
            }
            var query_json = {
                fid: docProId
            }
            var liArr = $('#newPropLi li');
            var customJson = {}
            for (var i = 0; i < liArr.length; i++) {
                var li = liArr[i];
                customJson[$('label', li).text()] = $('input', li).val()
            }
            Object.assign(update_json, customJson)

            console.log(update_json)
            local_api._update('docProp', query_json, update_json, $.cookie('appkey'), function (res) {
                local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
                    $('#divDocPro').dialog("close");
                })
            })
        }
    }

    //审核弹框初始化
    $('#divDocAudit').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        title: '文档审核',
        buttons: {
            "确定": function () {
                saveAudits()
            },
            "取消": function () {
                $('#divDocAudit').dialog("close");
            }
        }
    })

    //文档审核
    $('#passDoc').on('click', function () {
        fileDocProId = [];
        fileTree = [];
        // console.log(getCheckedFile())
        // get
        if (!getCheckedFile().length) {
            showTips('err', '请选择文件！');
        } else {
            getCheckedFile().forEach(ele => {
                fileidArr.push($('.item', ele).data().fileId);
                fileTree.push('^' + $('.item', ele).data().tree_path);
            })
            console.log(fileidArr, fileTree);
            $('#divDocAudit').dialog('open')
            docAudits()
        }
        // 
    })

    function docAudits() {
        local_api._list('document', { tree_path: fileTree.join('|'), type: 3 }, '', '', 1, -1, $.cookie('appkey'), function (res) {

            console.log(res)
        })
    }

    function saveAudits() {
        debugger;
        createOperate('文档审核')
        var upobj = { ispass: $('#divDocAudit input[name]:checked').val() }
        var obj = { tree_path: fileTree.join('|'), type: 3 };
        local_api._update('document', obj, upobj, $.cookie('appkey'), function (res) {
            console.log(res)
            showTips('ok', '审核成功！');
            $('#divDocAudit').dialog('close')
        })

    }

    //打印二维码
    $('#printCode').on('click', function (ev) {
        ev.stopPropagation();
        createOperate('打印二维码')
        fileDocProId = [];
        fileTree = [];
        fileTitleArr = []
        if (!getCheckedFile().length) {
            showTips('err', '请选择文件！');
            return;
        }
        getCheckedFile().forEach(ele => {
            fileidArr.push($('.item', ele).data().fileId);
            fileTree.push('^' + $('.item', ele).data().tree_path);
        })
        console.log(fileidArr, fileTree)
        Qrcode(fileTree)

    })

    function Qrcode(fileTree) {
        var query_json = { tree_path: fileTree.join('|'), type: 2, did: '>0' }
        local_api._list('document', query_json, 'did,name', 'did', 1, -1, $.cookie('appkey'), function (res) {
            var data = res.data;
            //    .remove();
            var div = $('#qrcodePrint')[0] || document.createElement('div');
            div.id = 'qrcodePrint'
            var ul = `<ul class="qrcodePrint">`

            data.forEach(ele => {
                ul += `<li><img src="http://h5.bibibaba.cn/pay/wicare/wxpayv3/qrcode.php?data=${ele.did}"><span>${ele.did}</span></li>`
            })
            ul += `</ul>`
            div.innerHTML = ul;
            if (!$('#qrcodePrint')[0]) {
                $('body').append(div)
            } else {
                $(div).empty();
                $(div).append(ul)
            }

            var bdhtml = window.document.body.innerHTML;

            var prnhtml = $('#qrcodePrint').html();
            window.document.body.innerHTML = prnhtml; //把需要打印的指定内容赋给body.innerHTML
            // window.print(); //调用浏览器的打印功能打印指定区域
            _print(bdhtml)



            // console.log(res)
        })
    }

    function _print(bdhtml) {
        var t_img; // 定时器
        var isLoad = true; // 控制变量（判断图片是否 加载完成）

        isImgLoad(function () {//判断全部打印图片加载完成
            window.print()
            window.document.body.innerHTML = bdhtml;//重新给页面内容赋值；
            _readyFun()
            // 加载完成
        });

        //判断图片加载的函数
        function isImgLoad(callback) {
            // 查找所有打印图，迭代处理
            $('.qrcodePrint img').each(function () {
                // 找到为0就将isLoad设为false，并退出each
                console.log(this.height)
                if (this.height === 0) {
                    isLoad = false;
                    return false;
                }
            });
            // 为true，没有发现为0的。加载完毕
            if (isLoad) {
                clearTimeout(t_img); // 清除定时器
                // 回调函数
                callback();
                // 为false，因为找到了没有加载完成的图，将调用定时器递归
            } else {
                isLoad = true;
                t_img = setTimeout(function () {
                    isImgLoad(callback); // 递归扫描
                }, 500); // 我这里设置的是500毫秒就扫描一次，可以自己调整
            }
        }
    }

    //移动弹框初始化
    $('#divDocumentAssign').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        buttons: {
            "确定": function () {
                movesubmit()
            },
            "取消": function () {
                $('#divDocumentAssign').dialog("close");
            }
        }
    })



    //移动
    $('.move').on('click', function (ev) {
        // console.log(getCheckedFile())
        if (getCheckedFile().length) {
            // console.log()
            // if (!selectMoveItem()) {
            //     showTips('err', '只支持移动案卷或文档');
            //     return;
            // }
            console.log(getMovetree_path())
            $('#divDocumentAssign').dialog('option', 'title', '移动')
            $('#divDocumentAssign').dialog('open')
        } else {
            showTips('err', '请选择需要移动的案卷或分类')
        }
        // console.log(ev)
    })
    function getMovetree_path() {
        var data = getCheckedFile();
        var obj;
        var obj = { tree_path: [], id: [] }
        for (var i = 0; i < data.length; i++) {
            obj.tree_path.push('^' + $('.item', data[i]).data().tree_path)
            obj.id.push($('.item', data[i]).data().fileId)
        }
        return obj
    }
    // function selectMoveItem() {
    //     var data = getCheckedFile();
    //     var istrue = false;
    //     for (var i = 0; i < data.length; i++) {
    //         if ($('.item', data[i]).data().type == 2 || $('.item', data[i]).data().type == 3) {
    //             istrue = true
    //         } else {
    //             istrue = false;
    //             break;
    //         }
    //     }
    //     return istrue
    // }



    //移动确认
    function movesubmit() {
        createOperate('移动')
        var _tree_path = getMovetree_path().tree_path;
        var idArr = getMovetree_path().id
        console.log(assignFid, assignTreePath, assignU_path);
        var updateArr = [];
        local_api._list('document', { tree_path: _tree_path.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
            res.data.forEach(ele => {
                var obj = {};
                obj[ele.id] = {};
                if (idArr.indexOf(ele.id) > -1) {
                    obj[ele.id].pid = assignFid;
                    var startIndex = ele.tree_path.indexOf(ele.id);
                    var endIndex = ele.tree_path.length;
                    var _tree_path = assignTreePath + ',' + ele.tree_path.slice(startIndex, endIndex)
                    obj[ele.id].oldtree_path = ele.tree_path;
                    obj[ele.id].tree_path = _tree_path;
                    obj[ele.id].olePath = doc_path(ele.tree_path);
                    obj[ele.id].newPath = doc_path(_tree_path);
                    obj[ele.id].u_path = assignU_path;
                    obj[ele.id].name = ele.name;
                    obj[ele.id].type = ele.type;
                    updateArr.push(obj)
                    childData(ele.id, _tree_path)
                    function childData(id, _tree_path) {
                        var data = dataControl.getChildById(res.data, id);
                        if (data.length) {
                            data.forEach(e => {
                                var obj1 = {};
                                obj1[e.id] = {};
                                obj1[e.id].pid = id
                                obj1[e.id].oldtree_path = e.tree_path;
                                var _tree_path1 = _tree_path + ',' + e.id
                                obj1[e.id].tree_path = _tree_path1
                                obj1[e.id].olePath = doc_path(e.tree_path);
                                obj1[e.id].newPath = doc_path(_tree_path1);
                                obj1[e.id].u_path = assignU_path;
                                obj1[e.id].name = e.name;
                                obj1[e.id].type = e.type;
                                // console.log(e)
                                updateArr.push(obj1)
                                childData(e.id, _tree_path1)
                            })
                        }
                    }
                }
            })
            // console.log(res)
            console.log(updateArr)
            var i = 0;
            $('#divDocumentAssign').dialog('close')
            movoFile(updateArr, i)
        })
    }
    //递归移动
    function movoFile(updateArr, i) {
        console.log(updateArr[i]);
        var obj = updateArr[i];
        for (var o in obj) {
            if (obj[o].type == 3) {
                var handle_json = {
                    oldPath: obj[o].olePath,
                    newPath: obj[o].newPath,
                    name: obj[o].name,
                    type: 2
                }
                local_api._rename(handle_json, $.cookie('appkey'), function (res) {
                    if (res.status == 0) {
                        var update_json = {
                            path: '/upload/' + obj[o].newPath + res.name,
                            tree_path: obj[o].tree_path,
                            pid: obj[o].pid,
                            u_path: obj[o].u_path,
                            name: res.name
                        };
                        var query_json = { id: o }
                        local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
                            i++;
                            showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
                            if (updateArr[i]) {
                                movoFile(updateArr, i)
                            }
                            if (i == updateArr.length) {
                                treeData(pid)
                            }
                        })
                    } else {
                        i++;
                        showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
                        if (updateArr[i]) {
                            movoFile(updateArr, i)
                        }
                        if (i == updateArr.length) {
                            treeData(pid)
                        }
                    }
                })
            } else {
                var update_json = {
                    path: '/upload/' + obj[o].newPath,
                    tree_path: obj[o].tree_path,
                    pid: obj[o].pid,
                    u_path: obj[o].u_path,
                };
                var query_json = { id: o }
                local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
                    i++;
                    showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
                    if (i == updateArr.length) {
                        treeData(pid);
                    }
                    if (updateArr[i]) {
                        movoFile(updateArr, i)
                    }
                })
            }
        }


    }



    // $('.openPro').on('mousedown',function(ev){
    //     ev.stopPropagation();
    //     openPro(ev)
    // })

    //打开密集柜
    function openPro(ev) {
        createOperate('打开密集柜')
        var docProId = ev.id.slice('openProo_'.length, ev.id.length);
        local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
            if (res.data) {
                var qu = parseInt(res.data.qnum || 0);
                var lie = parseInt(res.data.lnum || 0);
                var jie = parseInt(res.data.jnum || 0);
                var ceng = parseInt(res.data.cnum || 0);
                var ce = parseInt(res.data.ce || 0);
                var bh = parseInt(res.data.bnum || 1);
                if (qu > 0 && lie > 0 && jie > 0 && ceng > 0 && ce >= 0) {
                    var create_json = {
                        qu, lie, jie, ceng, ce, bh,
                        name: res.data.did,
                        status: 1
                    }
                    local_api._delete('playApp', { id: '>0' }, $.cookie('appkey'), function (del) {
                        local_api._create('playApp', create_json, $.cookie('appkey'), function (create) {
                            var _Id = create.id;
                            // showTips('err', '打开失败，请重新打开！')
                            var appInterval = setInterval(() => {
                                local_api._get('playApp', { id: _Id }, '', $.cookie('appkey'), function (status) {
                                    if (status.data.status != 1) {
                                        clearInterval(appInterval);
                                        if (status.data.status == 2) {
                                            showTips('ok', '打开成功！')
                                        } else if (status.data.status == 3) {
                                            showTips('err', '密集柜连接失败，请检查是否已连接！')
                                        } else {
                                            showTips('err', '打开失败，请重新打开！')
                                        }
                                    }
                                })
                            }, 1000)
                        })
                    })
                } else {
                    showTips('err', '无位置信息，无法打开密集柜！')
                }
            } else {
                showTips('err', '无位置信息，无法打开密集柜！')
            }
        })
        console.log(docProId)
    }

    // window.tree_path = tree_path;
    // parentAllData()
    function parentAllData(callback) {
        local_api._list('document', { type: '0|1|2|4' }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
            docDatas = res.data;
            callback ? callback() : null
        })
    }

    //获取目录树
    function treeData(pid) {
        parentAllData()
        local_api._list('document', { type: '0|1|2|4', u_path: '^' + $.cookie('tree_path') }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
            if (res.status == 0) {
                if (res.total) {
                    datas = res.data;
                    pid = pid || res.data[0].pid;
                    contentfileId = _g.fileId || contentfileId || res.data[0].id
                    tree_path = tree_path || res.data[0].tree_path;
                    u_path = u_path || res.data[0].u_path;
                    if (_g.fileId) {
                        local_api._get('document', { id: _g.fileId }, '', $.cookie('appkey'), function (ts) {
                            if (ts.data) {
                                tree_path = ts.data.tree_path;
                                u_path = ts.data.u_path
                            }
                        })
                    }
                    _g.fileId = null;
                    // console.log(dataControl.getLeveById(datas, _g.fileId))
                    getDocumentPlay(pid)
                }
            }
        })
    }
    treeData(pid)

    //点击文件展示区事件
    var fileLIstFun = function (ev) {
        console.log(ev.currentTarget, 'filelist')
        var target = tools.getTarget(ev);

        if (target.className.indexOf('docProo') > -1) {
            setDocPro(ev.target)
        }
        if (target.className.indexOf('openProo') > -1) {
            openPro(ev.target)
        }
        if (target.className.indexOf('folder') > -1 || getCurrentClick(ev)) {
            // 找到class为item的父级,设置为ev.target
            scrollTop = $('.file-list').scrollTop();
            if (tools.parents(target, '.item')) {
                target = tools.parents(target, '.item');
                // 获取父级的自定义属性file-id，渲染子数据
                var fileId = target.dataset.fileId;
                contentfileId = fileId;
                $.cookie('contentId', contentfileId)
                var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
                var node = treeObj.getNodeByParam("id", contentfileId, null);
                if (node) {
                    tree_path = node.treePath;
                    u_path = node.u_path;
                    treeObj.selectNode(node);
                }
                renderFilesPathTree(fileId);
            }
        } else {
            console.log($('.item', ev.currentTarget).data())
            var dataset = $('.item', ev.currentTarget).data();
            var path = `/js/pdf/generic/web/viewer.html?file=${target.dataset.filepath}`
            if (dataset.type == 3) {
                path = '/pdfView?fileid=' + dataset.fileId;
                window.open(path, '_blank')
                // target.dataset.filepath ? window.open(path, '_blank') : null;
            }
            // console.log(target)
            // var path = `/docshow?path=${target.dataset.filepath}`

        }
    }

    //点击导航事件
    var pathNavFun = function (ev) {
        var target = tools.getTarget(ev);
        if (tools.parents(target, 'a')) {
            var fileId = target.dataset.fileId;
            contentfileId = fileId;
            $.cookie('contentId', contentfileId)
            var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
            var node = treeObj.getNodeByParam("id", contentfileId, null);
            if (node) {
                // $.cookie('_treePath',)
                tree_path = node.treePath;
                u_path = node.u_path;
                // $.cookie('_treePath', u_path)
                treeObj.selectNode(node);
            }
            renderFilesPathTree(fileId);
        }
    }

    // var treeMenuFun = function (ev) {
    //     var target = tools.getTarget(ev);
    //     if (tools.parents(target, '.tree-title')) {
    //         var isShow = tools.parents(target, '.tree-title').nextElementSibling.style.display == 'none' ? true : false;
    //         if (target.className.indexOf('ico') > -1) {
    //             target.className = isShow ? 'ico' : 'ico act'
    //             tools.parents(target, '.tree-title').nextElementSibling.style.display = isShow ? 'block' : 'none'
    //             return;
    //         }
    //         target = tools.parents(target, '.tree-title');
    //         var fileId = target.dataset.fileId;
    //         contentfileId = fileId;
    //         tree_path = target.dataset.tree_path;
    //         u_path = target.dataset.u_path;
    //         renderFilesPathTree(fileId);
    //     }
    // }
    //移除事件
    var removeClicks = function () {
        $(document).off('click', `.file-list .file-item`, fileLIstFun)
        // tools.removeEvent(fileList, 'click', fileLIstFun);
        // tools.removeEvent(treeMenu, 'click', treeMenuFun);
        tools.removeEvent(pathNav, 'click', pathNavFun);
    }

    function getDocumentPlay(pid) {
        $('.file-list').empty();
        $('#tree-menu').empty();
        removeClicks();
        // 渲染文件展示区html结构，默认最外层
        fileList.innerHTML = createFilesHtml(datas, contentfileId);
        // 给文件展示区每个文件注册点击事件
        // tools.addEvent(fileList, 'click', fileLIstFun);
        $(document).on('click', `.file-list .file-item`, fileLIstFun)

        // 渲染树形导航区html结构，默认都展开
        showTree(datas)
        // treeMenu.innerHTML = createTreeHtml(datas, pid);
        // // 给树形导航区每个文件注册点击事件
        // tools.addEvent(treeMenu, 'click', treeMenuFun);

        // 渲染文件路径导航区html结构，默认渲染第一层
        pathNav.innerHTML = createPathNavHtml(datas, contentfileId);
        // 树形导航区默认定位到最外层
        // positionTreeById(contentfileId);
        renderFilesPathTree(contentfileId)
        // 给文件路径导航区每个文件注册点击事件
        tools.addEvent(pathNav, 'click', pathNavFun);
    }

    var icons = {
        0: './img/icon-file-s.svg',
        1: './img/icon-file-s.svg',
        2: './img/icon-file-s1.svg',
        4: './img/icon-file-s2.svg',
    }
    //显示目录树
    function showTree(data) {
        var names = [];
        customers = data;
        for (var i = 0; i < data.length; i++) {
            names.push(data[i].name);
        }

        var onCustomerSelectClick = function (event, treeId, treeNode) {
            if (parseInt(treeNode.id) > -1) {
                contentfileId = treeNode.id;
                $.cookie('contentId', contentfileId)
                tree_path = treeNode.treePath;
                u_path = treeNode.u_path;
                renderFilesPathTree(contentfileId);
            }
        };

        var onCustomerAssignClick = function (event, treeId, treeNode) {
            if (parseInt(treeNode.id) > -1) {
                assignFid = treeNode.id;
                assignTreePath = treeNode.treePath;
                // assignName = treeNode._name;
                assignU_path = treeNode.u_path;
                assignPath = treeNode.path;
                // assing
            }
        };

        var setting = {
            view: { showIcon: true },
            check: { enable: false, chkStyle: "checkbox" },
            data: { simpleData: { enable: true } },
            callback: { onClick: onCustomerSelectClick }
        };
        var settingAssign = {
            view: { showIcon: true },
            check: { enable: false, chkStyle: "checkbox" },
            data: { simpleData: { enable: true } },
            callback: { onClick: onCustomerAssignClick }
        };

        var fileArray = [];
        var selectArray = [];


        // 创建三个分类的根节点
        for (var i = 0; i < data.length; i++) {
            fileArray.push({
                open: false,
                id: data[i]['id'],
                treePath: data[i]['tree_path'],
                pId: data[i]['pid'],
                name: data[i]['name'],
                u_path: data[i]['u_path'],
                icon: icons[data[i]['type']],
                path: data[i]['path']
            });
            selectArray.push({
                open: false,
                id: data[i]['id'],
                treePath: data[i]['tree_path'],
                pId: data[i]['pid'],
                name: data[i]['name'],
                u_path: data[i]['u_path'],
                icon: icons[data[i]['type']],
                path: data[i]['path']
            });
        }

        $.fn.zTree.init($("#tree-menu"), setting, fileArray);
        $.fn.zTree.init($("#documentTreeAssign"), settingAssign, selectArray);

        if (contentfileId >= 0) {
            var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
            var node = treeObj.getNodeByParam("id", contentfileId, null);
            if (node) {
                tree_path = node.treePath;
                u_path = node.u_path;
                // cust_name = node.name;
                treeObj.selectNode(node);
            }
            // else {
            //     uid = $.cookie('uid');
            //     u_path = $.cookie('tree_path');
            //     node = treeObj.getNodeByParam("id", uid, null);
            //     tree_path = node.treePath;
            //     cust_name = node.name;
            //     treeObj.selectNode(node);
            // }
        }
    }

    function getCurrentClick(ev) {
        var type = parseInt(ev.target.dataset.type);

        if ([0, 1, 2, 4].indexOf(type) > -1) {
            return true;
        }
        if (ev.target.className == 'file-title') {
            var ptype = parseInt(ev.target.parentNode.parentNode.dataset.type);
            if ([0, 1, 2, 4].indexOf(ptype) > -1) {
                return true;
            }
        }
        if (ev.target.className == 'file-title-box') {
            var ptype = parseInt(ev.target.parentNode.dataset.type);
            if ([0, 1, 2, 4].indexOf(ptype) > -1) {
                return true;
            }
        }
        return false;
    }

    // $('.file-list').scroll(function(re){
    //     // console.log($(this).scrollTop())
    //     scrollTop = $(this).scrollTop();
    // })



    // 在树形导航区定位到传入id的文件
    function positionTreeById(fileId) {
        var ele = document.querySelector('.tree-title[data-file-id="' + fileId + '"]');
        tools.addClass(ele, 'tree-nav');
    }

    // 渲染文件展示区、树形导航区和文件路径区数据
    function renderFilesPathTree(fileId) {
        if (scrollTop) {
            // $(".file-list").animate({scrollTop:scrollTop},"slow");
            setTimeout(() => {
                $(".file-list")[0].scrollTop = scrollTop
            }, 1000)

        }
        // var treeNav = tools.$('.tree-nav', treeMenu)[0]; // 当前定位的文件
        childrenDatas = [];
        datas.forEach(ele => {
            if (ele.id == fileId) {
                if (ele.type == 1 || ele.type == 0) {
                    $('#folder1').show();
                    $('#folder2').show();
                    $('#folder3').hide();
                } else {
                    $('#folder1').hide();
                    $('#folder2').hide();
                    $('#folder3').show();
                }
                childrenDatas.push(ele);
            }
        })

        local_api._list('document', { pid: fileId, u_path: '^' + u_path }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
            $('.file-list').empty();
            // $('.tree-menu').empty();
            // var hasChild = dataControl.hasChrildren(datas, fileId); // 是否有子级
            var hasChild = res.total ? true : false;
            childrenDatas = childrenDatas.concat(res.data)
            // datas = res.data
            console.log(hasChild)

            // 判断是否有子数据，再渲染文件展示区
            if (hasChild) {
                empty.style.display = 'none';
                fileList.innerHTML = createFilesHtml(childrenDatas, fileId);
            } else {
                empty.style.display = 'block';
                fileList.innerHTML = '';
            }

            // 渲染文件路径导航区
            pathNav.innerHTML = createPathNavHtml(datas, fileId);

            // 定位树形导航区当前文件
            // tools.removeClass(treeNav, 'tree-nav');
            // positionTreeById(fileId);

            // 获取所有渲染后的文件，再给这些文件绑定事件
            fileItem = tools.$('.file-item', fileList);
            tools.each(fileItem, function (item, index) {
                fileHandle(item);
            })

            // 重新渲染后取消全选按钮勾选
            tools.removeClass(checkedAll, 'checked');

            // 重新渲染后保存当前父级id
            // parentId = fileId;
            contentfileId = fileId;
            $.cookie('contentId', contentfileId)
            // console.log($('.file-list .checkbox'))
            // $('.file-list .checkbox').on('click',function(e){
            //     console.log(e)
            // })

        })

        // console.log(treeNav)

    }


    //内容展示布局 列表/缩略图
    tools.addEvent(tools.$('.mod-action-wrap')[1], 'mouseover', function (ev) {
        if (ev.target.className == "action-item") {
            return;
        }
        if (ev.target.className == "action-item-con") {
            btnConBack();
            ev.target.style.background = '#f5f6f9';
            ev.target.children[1].style.display = 'inline-block';
            tools.addEvent(document, 'mouseover', btnChange)
            return
        }

    })
    var btnChange = function (evt) {
        // console.log(evt.target.className, 'document')
        if (evt.target.className != 'action-item-con') {
            if (evt.target.className.indexOf('icon-') > -1) {
                return
            }
            btnConBack()
            tools.removeEvent(document, 'mouseover', btnChange)
        }
    }

    function btnConBack() {
        tools.$('#btn-change .action-item-con').forEach(ele => {
            ele.style.background = '#fff'
        });
        tools.$('#btn-change .act-txt').forEach(ele => {
            ele.style.display = 'none'
        });
    }

    for (var i = 0; i < tools.$('.mod-action-wrap')[1].children.length; i++) {
        tools.addEvent(tools.$('.mod-action-wrap')[1].children[i], 'click', function (ev) {
            // console.log(this)
            // console.log(this == tools.$('.mod-action-wrap')[1].children[0])
            console.log(tools.hasClass(this, 'act'))
            if (this == tools.$('.mod-action-wrap')[1].children[0]) {
                if (!tools.hasClass(this, 'act')) {
                    this.className = this.className + ' act';
                    tools.$('.mod-action-wrap')[1].children[1].className = 'action-item';
                    tools.addClass(tools.$('.file-list')[0], 'f_detail')
                }
            } else {
                if (!tools.hasClass(this, 'act')) {
                    this.className = this.className + ' act';
                    tools.$('.mod-action-wrap')[1].children[0].className = 'action-item';
                    tools.removeClass(tools.$('.file-list')[0], 'f_detail')
                }
            }
        })
    }


    /* 鼠标移入移除、全选和单选 */

    var fileItem = tools.$('.file-item', fileList); // 文件展示区所有文件
    var checkedAll = tools.$('.cheched-all')[0]; // 全选按钮
    var allCheckbox = tools.$('.checkbox', fileList); // 当前文件展示区所有的checkbox

    // 给每个文件初始化事件绑定
    tools.each(fileItem, function (item, index) {
        fileHandle(item);
    });

    console.log($('.file-list .checkbox'))
    // $('.checkbox',fileList).on('click',function(e){
    //     console.log(e)
    // })  

    // 给全选按钮添加事件
    tools.addEvent(checkedAll, 'click', function (ev) {
        // 获取最新的文件和所有的checkbox
        fileItem = tools.$('.file-item', fileList);
        allCheckbox = tools.$('.checkbox', fileList);

        // 判断checkbox是否已经勾选
        var isAddClass = tools.toggleClass(this, 'checked');

        if (isAddClass) {
            tools.each(fileItem, function (item, index) {
                tools.addClass(item, 'file-checked');
                tools.addClass(allCheckbox[index], 'checked');
            });
        } else {
            tools.each(fileItem, function (item, index) {
                tools.removeClass(item, 'file-checked');
                tools.removeClass(allCheckbox[index], 'checked');
            })
        }
    });

    // 单独给一个文件添加事件处理
    function fileHandle(item) {
        var checkbox = tools.$('.checkbox', item)[0];

        // 每个文件添加鼠标移入事件
        tools.addEvent(item, 'mouseenter', function () {
            tools.addClass(this, 'file-checked');
        });

        // 每个文件添加鼠标移出事件
        tools.addEvent(item, 'mouseleave', function () {
            if (!tools.hasClass(checkbox, 'checked')) {
                tools.removeClass(this, 'file-checked');
            }
        });

        // 给checkbox添加点击事件，并阻止事件冒泡
        tools.addEvent(checkbox, 'click', function (ev) {
            // 获取最新的allCheckbox
            console.log(ev, 'thischeck')
            allCheckbox = tools.$('.checkbox', fileList);
            // toggleClass返回一个布尔值，有这个class则为true
            var isAddClass = tools.toggleClass(this, 'checked');
            if (isAddClass) {
                // 判断是否所有的checkbox都有checked
                if (getCheckedFile().length == allCheckbox.length) {
                    tools.addClass(checkedAll, 'checked');
                }
            } else {
                // 只要没有checked这个class就说明没有全选
                tools.removeClass(checkedAll, 'checked');
            }
            tools.stopPropagation(ev);
        });
    }

    // 获取所有checkbox被勾选的文件
    function getCheckedFile() {
        var arr = [];
        tools.each(allCheckbox, function (checkbox, index) {
            if (tools.hasClass(checkbox, 'checked')) {
                arr.push(fileItem[index]);
            }
        });
        return arr;
    }

    // 文件(夹)操作
    tools.addEvent(tools.$('.mod-action-wrap')[0], 'mouseover', function (ev) {
        if (ev.target.className == "action-item") {
            return;
        }
        if (ev.target.className == "action-item-con") {
            itemConBack();
            ev.target.style.background = '#f5f6f9';
            ev.target.children[1].style.display = 'inline-block';
            tools.addEvent(document, 'mouseover', itemDocument)
            return
        }

    })
    var itemDocument = function (evt) {
        // console.log(evt.target.className, 'document')
        if (evt.target.className != 'action-item-con') {
            if (evt.target.className.indexOf('icon-') > -1) {
                return
            }
            itemConBack()
            tools.removeEvent(document, 'mouseover', itemDocument)
        }
    }

    function itemConBack() {
        tools.$('.mod-nav .action-item-con').forEach(ele => {
            ele.style.background = '#fff'
        });
        tools.$('.mod-nav .act-txt').forEach(ele => {
            ele.style.display = 'none'
        });
    }

    // tools.addEvent(document


    /* 框选功能 */
    var newDiv = null;
    var newDiv2 = null;
    var disX = 0, disX = 0;

    tools.addEvent(tools.$('.main')[0], 'mousedown', function (ev) {
        var target = tools.getTarget(ev);
        if (tools.parents(target, '.nav-a')) return;
        disX = ev.clientX;
        disY = ev.clientY;

        // moveItem = [];
        // console.log(getCheckedFile(), 'aa')

        // fileItem = tools.$('.file-item', fileList);
        // allCheckbox = tools.$('.checkbox', fileList);

        // if(moveItem.length){

        // }
        // 鼠标移动
        tools.addEvent(document, 'mousemove', mouseMove)

        // 鼠标抬起
        tools.addEvent(document, 'mouseup', mouseUp)

        // 阻止默认行为
        ev.preventDefault();
    })



    var issecondmove = false;
    var newDiv2;
    function moveItemFun(ev) {
        console.log(ev.target)
        movetoTarget = ev.target
        if (!newDiv2) {
            newDiv2 = document.createElement('div');
            document.body.appendChild(newDiv2);
            var cssobj = { position: 'fixed', width: '150px', height: '40px' }
            $(newDiv2).css(cssobj);
            var newDiv2Content =
                `<div class="selectboxMoveone">
                        <div>
                            <span></span>
                            <span class="ellipsis">${$('.file-title', getCheckedFile()[0]).text()}</span>
                        </div>
                        <span class="moveleng">${getCheckedFile().length}</span>
                    </div>
                    ${getCheckedFile().length > 1 ? `<div class="selectboxMovemore"></div>` : ''}
                    `
            $(newDiv2).append(newDiv2Content)
        }
        $(newDiv2).css({ top: ev.clientY + 2, left: ev.clientX + 2 })
    }
    // 鼠标移动
    function mouseMove(ev) {
        // console.log(ev.target)
        // targetNode(ev.target)
        if (newDiv2) {
            moveItemFun(ev)
            return
        }
        // console.log(getCheckedFile().indexOf(ev.target.parentNode))
        if (issecondmove) {
            if (getCheckedFile().indexOf(ev.target.parentNode) > -1) {
                moveItemFun(ev)
            } else {
                _targetNode(ev.target, 'file-item', function (ele) {
                    console.log(ele, 'paen')
                    if (ele) {
                        if (getCheckedFile().indexOf(ele) > -1) {
                            moveItemFun(ev)
                        } else {
                            issecondmove = false;
                            moveSelect()
                        }
                    } else {
                        issecondmove = false;
                        moveSelect()
                    }
                })
            }
        } else {
            moveSelect()
        }
        // moveselect()

        fileItem = tools.$('.file-item', fileList);
        allCheckbox = tools.$('.checkbox', fileList);

        function moveSelect() {
            if (Math.abs(ev.clientX - disX) > 20 || Math.abs(ev.clientY - disY) > 20) {
                // 只生成一个div
                if (!newDiv) {
                    newDiv = document.createElement('div');
                    document.body.appendChild(newDiv);
                    newDiv.className = 'select-box';
                }
                console.log(newDiv, 'hi')
                newDiv.style.display = 'block';
                newDiv.style.width = Math.abs(ev.clientX - disX) + 'px';
                newDiv.style.height = Math.abs(ev.clientY - disY) + 'px';
                newDiv.style.left = Math.min(ev.clientX + 2, disX - 2) + 'px';
                newDiv.style.top = Math.min(ev.clientY + 2, disY - 2) + 'px';

                // 拖选框碰撞检测，如果碰上文件，就勾选文件
                tools.each(fileItem, function (item, index) {
                    if (tools.collisionRect(newDiv, item)) {
                        tools.addClass(item, 'file-checked');
                        tools.addClass(allCheckbox[index], 'checked');
                    } else {
                        tools.removeClass(item, 'file-checked');
                        tools.removeClass(allCheckbox[index], 'checked');
                    }
                });

                // 如果全部选中，勾选全选按钮
                if (getCheckedFile().length == allCheckbox.length) {
                    tools.addClass(checkedAll, 'checked');
                } else {
                    tools.removeClass(checkedAll, 'checked');
                }
            } else {
                if (newDiv) {
                    newDiv.style.display = 'none';
                }
            }
        }

    }
    // 鼠标抬起
    function mouseUp(ev) {
        tools.removeEvent(document, 'mousemove', mouseMove);
        tools.removeEvent(document, 'mouseup', mouseUp);
        if (newDiv) {
            newDiv.style.display = 'none';
        }
        // moveItem = getCheckedFile();
        issecondmove = !issecondmove;
        if (newDiv2) {
            issecondmove = true;
            $(newDiv2).remove()
            newDiv2 = null;
            finallyMove(ev);
        } else {
            console.log(moveItem)
            if (!newDiv) {
                //点击空白地方清除选中
                var pClassName = ev.target.parentNode.className;
                if (pClassName == 'nav' || pClassName == 'file-show' || pClassName == 'content clearfix') {
                    tools.each(fileItem, function (item, index) {
                        tools.removeClass(item, 'file-checked');
                        tools.removeClass(allCheckbox[index], 'checked');
                    })
                    tools.removeClass(checkedAll, 'checked');
                    issecondmove = false;
                }
            } else {
                $(newDiv).remove();
                newDiv = null;
            }
        }
    }

    //最后移动到目录树进行移动
    function finallyMove(ev) {
        // console.log(ev.target.id.split('_'))
        if (ev.target.id.indexOf('tree-menu') > -1) {
            var idArr = ev.target.id.split('_');
            var idStr = idArr[0] + '_' + idArr[1];
            var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
            var treeNode = treeObj.getNodeByParam('tId', idStr, null);
            if (treeNode) {
                assignFid = treeNode.id;
                assignTreePath = treeNode.treePath;
                assignU_path = treeNode.u_path;
                assignPath = treeNode.path;
                movesubmit()
            }


        }


    }

    function _targetNode(target, name, callback) {
        var callback = callback;
        var eleName = $(target).parent()[0]
        if (eleName.nodeName == 'BODY') {
            callback(false)
        } else if (eleName.className.indexOf(name) > -1) {
            callback(eleName)
        } else {
            _targetNode(eleName, name, callback)
        }
    }








    /* 新建文件 */

    var create = tools.$('.create')[0];
    // tools.addEvent(create, 'mouseup', function () {

    // })
    $('.create').on('click', function () {
        // if(!isfinish){
        $('.create_file').toggleClass('act')
        // }

    })

    $(document).on('mousedown', function () {
        if ($('.create_file').hasClass('act')) {
            $('.create_file').toggleClass('act')
        }
    })

    var fileType;
    $('#folder1').on('mousedown', function (ev) {
        // console.log(ev.target);
        ev.stopPropagation();
        $('.create_file').toggleClass('act');
        fileType = 1;
        createDoc(1)
    })
    $('#folder2').on('mousedown', function (ev) {
        // console.log(ev.target)
        ev.stopPropagation();
        $('.create_file').toggleClass('act');
        fileType = 2;
        createDoc(2)
    })
    $('#folder3').on('mousedown', function (ev) {
        // console.log(ev.target)
        ev.stopPropagation();
        $('.create_file').toggleClass('act');
        fileType = 4;
        createDoc(4)
    })

    function createDoc(type) {
        empty.style.display = 'none';
        var firstElement = fileList.firstElementChild;
        var newElement = createFileElement({
            title: '',
            id: new Date().getTime(),
            type: type

        })
        fileList.insertBefore(newElement, firstElement);
        var fileTitle = $('.file-title', newElement);
        var ftext = '';
        var fileEditorHtml = `<span class="file-edtor"> <input type="text" value="${ftext}" class="edtor" autofocus="autofocus"></span>`
        fileTitle.css('display', 'none');
        fileTitle.parent().append(fileEditorHtml);
        var editor = $('.edtor', newElement);
        editor.focus();
        $('.file-edtor', newElement).on('mousedown', function (ev) {
            ev.stopPropagation();//阻止拖拽事件发生
        })
        $(editor).on('keyup', function (e) {
            // console.log(e.keyCode)
            if (e.keyCode == 13) {
                createFile()
            }
        })
        // $('input.',)
        create.isCreateFile = true;// 添加一个状态，表示正在创建文件
        // 给document添加mousedown事件，鼠标在其他地方点击时，确定创建文件
        tools.addEvent(document, 'mousedown', createFile)
    }

    function createFile(ev) {
        // debugger;
        createOperate('新建')
        if (create.isCreateFile) {
            var firstElement = fileList.firstElementChild;
            var edtor = tools.$('.edtor', firstElement)[0];
            var value = edtor.value.trim();

            // 没有输入文件名。则创建不成功
            if (value === '') {
                fileList.removeChild(firstElement);
                if (fileList.innerHTML === '') {
                    empty.style.display = 'block';
                }
            } else {
                // 输入框有内容时，文件创建成功时
                var fileTitle = tools.$('.file-title', firstElement)[0];
                // var fileEdtor = tools.$('.file-edtor', firstElement)[0];
                var fileEdtor = $('.file-edtor', firstElement);
                console.log(firstElement)

                // 显示文件名，隐藏输入框
                fileTitle.style.display = 'block';
                // fileEdtor.style.display = 'none';
                fileTitle.innerHTML = value;
                fileEdtor.remove();
                var create_json = {
                    createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    pid: contentfileId,
                    name: value,
                    type: fileType,
                    u_path: u_path,
                    // uid: $.cookie('uid')
                };
                local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                    var _tree_path = tree_path + ',' + res.id
                    local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (res) {
                        treeData(pid)
                        if (fileType == 2) {
                            showTips('ok', '新建案卷成功!');
                        } else if (fileType == 1) {
                            showTips('ok', '新建分类成功!');
                        } else if (fileType == 4) {
                            showTips('ok', '新建组成功!');
                        }

                    })
                })
            }
            //无论创建成不成功，状态都要设为false
            create.isCreateFile = false;
            tools.removeEvent(document, 'mousedown', createFile)
        }
    }




    /* 重命名 */
    // 需要完善
    var rename = tools.$('.rename')[0];

    tools.addEvent(rename, 'mouseup', function () {
        fileItem = tools.$('.file-item', fileList);
        allCheckbox = tools.$('.checkbox', fileList);
        createOperate('重命名')
        if (!getCheckedFile().length) {
            showTips('err', '请选择文件！');
        } else if (getCheckedFile().length > 1) {
            showTips('err', '只能对单个文件重命名！');
        } else {
            var fileTitle = $('.file-checked .file-title');
            var upId = $('.file-checked .item').data().fileId;
            var uptree_path = $('.file-checked .item').data().tree_path;
            var uptype = $('.file-checked .item').data().type;
            console.log($('.file-checked .item').data())
            if ($('.file-checked .item').data().type == 0) {
                showTips('err', '无法对客户文件夹进行重命名!');
                return;
            }
            var text = fileTitle.text()
            var fileEditorHtml = `<span class="file-edtor"> <input type="text" value="${text}" class="edtor"></span>`
            fileTitle.css('display', 'none');
            // console.log(upId)
            fileTitle.parent().append(fileEditorHtml);
            var editor = $('.file-checked .edtor');
            var fileEdtor = $('.file-checked .file-edtor')[0];
            editor.select();
            $('.file-checked .file-edtor').on('mousedown', function (ev) {
                ev.stopPropagation();//阻止拖拽事件发生
            })

            editor.on('keypress', function (e) {
                if (e.keyCode == 13) {
                    changeFun()
                }
            })


            function changeFun(ev) {
                if (ev) {
                    if (ev.target.parentNode == fileEdtor) {
                        return;
                    }
                }

                // console.log(1)
                var value = editor.val().trim();
                if (value == '') {
                    showTips('err', '请输入文件名！');
                    // console.log()
                } else {
                    // debugger;
                    var path = doc_path(uptree_path);
                    var oldPath, newPath;
                    if (uptype == 3) {
                        oldPath = path + text;
                        newPath = path + value;
                    } else {
                        oldPath = path
                        newPath = path.slice(0, path.lastIndexOf(text)) + value
                    }
                    console.log(path)
                    var handle_json = {
                        type: 1,
                        oldPath: oldPath,
                        newPath: newPath
                    }
                    local_api._rename(handle_json, $.cookie('appkey'), function (han) {
                        console.log(han)
                        if (han.status == 0) {
                            local_api._update('document', { id: upId }, { name: value }, $.cookie('appkey'), function (res) {
                                if (res.status == 0) {
                                    showTips('ok', '重命名成功')
                                    treeData(pid)
                                }
                            })
                        } else {
                            showTips('err', han.message)
                            treeData(pid)
                        }
                    })

                }
                tools.removeEvent(document, 'mousedown', changeFun)
            }
            tools.addEvent(document, 'mousedown', changeFun)
        }
    })






    //左侧菜单
    tools.addEvent(tools.$('.nav-box')[0], 'click', function (ev) {
        // console.log(ev)
        // ev.stopPropagation();
        console.log(tools.getTarget(ev));
        console.log(tools.getTarget(ev).parentNode);
        if (tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list')) {
            tools.each(tools.$('.nav-list.nav-current'), function (ele) {
                console.log(ele.className)
                tools.removeClass(ele, 'nav-current')
            });
            tools.addClass(tools.getTarget(ev).parentNode, 'nav-current')
        }
        console.log(tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list'))

    })
    tools.addEvent(tools.$('#search')[0], 'focus', function () {
        var searchBar = tools.$('#_search_bar')[0];
        tools.addClass(searchBar, 'focus')
    })
    tools.addEvent(tools.$('#search')[0], 'blur', function () {
        var searchBar = tools.$('#_search_bar')[0];
        setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)

    })

    //检索
    $('#search').on('keypress', function (e) {
        createOperate('文件检索')
        if (e.keyCode == 13) {
            e.target.value.trim() != '' ? location.href = '/hightSearch?query=' + e.target.value.trim() : null
        }
    })

    //文件上传
    var isupload = false
    $('.upload').on('click', function (ev) {
        ev.stopPropagation();
        uploadFiles()
    })
    //文件上传
    $('.upload-file').on('click', function (ev) {
        ev.stopPropagation();
        // console.log(ev.target.parentNode)
        var pNode = ev.target.parentNode;
        var ppNode = ev.target.parentNode.parentNode;
        var cNode = $('.upload-file').children().children();
        if (pNode == cNode[0] || ppNode == cNode[0]) {
            // console.log(1)
            uploadFiles()
        }
        // if (pNode == cNode[1] || ppNode == cNode[1]) {
        //     console.log(2)
        // }
    })
    var tree_address = '';
    //文件上传
    function uploadFiles() {
        createOperate('文件上传')
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = "multiple"
        // input.onclick = function (e) {
        //     console.log(e)
        // }
        $(input).change(function (ev) {
            console.log(this.files)
            var fileList = this.files;
            var fileIndex = uploadFileArr.length + 0;
            $('.mod-tasks .tasks-header').removeClass('result-succt').addClass('tasking-nor')
            // debugger;
            // console.log()
            var tArr = tree_path.split(',');
            var uploadPathArr = dataControl.getParents(docDatas, tArr[tArr.length - 1]).reverse()
            var uploadPath = '';
            uploadPathArr.forEach(ele => {
                uploadPath += ele.name + '/'
            })
            tree_address = uploadPath

            Array.prototype.forEach.call(fileList, function (file, index) {
                console.log(file)
                $('.mod-tasks').show();
                var newLi = uploadHtml(0, file, fileIndex + index);
                liClick(newLi)
                uploadLiArr.push(newLi);
                uploadFileArr.push(file);
                taskUl.append(newLi);
            })

            function liClick(li) {
                $(li).on('click', function (e) {
                    console.log(e);
                    var _thisIndex = e.currentTarget.dataset.file_id;
                    console.log(_thisIndex)
                    if ($(e.currentTarget).hasClass('waiting')) {
                        if ($(e.target).hasClass('btn-icon')) {
                            cancalIndexArr.push(parseInt(_thisIndex));
                            replaceLiHtml(3, _thisIndex)
                        }
                    }

                    if ($(e.currentTarget).hasClass('cancel')) {
                        if ($(e.target).hasClass('btn-icon')) {

                        }
                    }
                })
            }

            function replaceLiHtml(type, index) {
                var file = uploadFileArr[index]
                var replaceLi = uploadHtml(type, file, index);
                liClick(replaceLi)
                $(uploadLiArr[index], taskUl).replaceWith(replaceLi);
                uploadLiArr.splice(index, 1, replaceLi)
            }

            function isFileExist() {
                var file = uploadFileArr[fileIndex]
                if (cancalIndexArr.indexOf(fileIndex) > -1) {
                    fileIndex++;
                    isFileExist();
                    return;
                }

                // console.log(uploadFileArr.length == fileIndex)
                if (uploadFileArr.length == fileIndex) {//最后
                    $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ')
                    $('.mod-tasks .summary-wrapper .txt').text(`任务已完成`)
                } else {
                    var scaleXVal = (fileIndex / uploadFileArr.length).toFixed(1)
                    // $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ')
                    $('.mod-tasks .summary-wrapper .before').css('transform', `scaleX(${scaleXVal})`)
                    $('.mod-tasks .summary-wrapper .txt').text(`${fileIndex}/${uploadFileArr.length}项任务进行中`)
                }
                // if(uploadFileArr.length == fileIndex)
                if (file) {
                    start(file, fileIndex, function (res) {
                        console.log($(uploadLiArr[fileIndex], taskUl), fileIndex, '22')
                        if (res.id) {
                            replaceLiHtml(1, fileIndex) //成功
                        } else {
                            replaceLiHtml(2, fileIndex) //失败
                        }
                        fileIndex++;
                        if (!res.name) {
                            // renderFilesPathTree(contentfileId)
                            treeData(pid)
                        }
                        isFileExist()
                    })
                }
            }
            isFileExist()

            function start(file, index, callback) {
                get_filemd5sum(file, function (res) {

                    var filename = file.name;
                    function createDocAndZu(filname, callback) {
                        var first_i = filename.indexOf('【');
                        var last_i = filename.indexOf('】');

                        if (first_i > -1 && last_i > 0) {
                            var first_name = filename.slice(first_i + 1, last_i);
                            var last_name = filename.slice(last_i + 1, filename.length)
                            var first_name_arr = first_name.split('_');
                            var searchObj = { did: first_name_arr[0], name: first_name_arr[0] + first_name_arr[1], tree_path: '^' + tree_path, pid: contentfileId };
                            // debugger;
                            // return;
                            local_api._get('document', searchObj, '', $.cookie('appkey'), function (existobj) {
                                if (existobj.status == 0 && existobj.data) {//存在案卷
                                    if (first_name_arr[2]) { //组别
                                        var searchObj = { name: first_name_arr[2], tree_path: '^' + existobj.data.tree_path, pid: existobj.data.id };
                                        local_api._get('document', searchObj, '', $.cookie('appkey'), function (zobj) {
                                            if (zobj.data) { //在案卷组别上传
                                                callback(Object.assign(zobj.data, { last_name: last_name }))
                                            } else { //创建组别
                                                var create_json = {
                                                    name: first_name_arr[2],
                                                    type: 4,
                                                    createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                                                    pid: existobj.data.id,
                                                    u_path: u_path,
                                                }
                                                local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                                                    var _tree_path = existobj.data.tree_path + ',' + res.id;
                                                    var cres = { id: res.id, tree_path: _tree_path, last_name: last_name }
                                                    local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                                                        callback(cres)
                                                    })
                                                })
                                            }
                                        })
                                    } else {//在案卷中上传
                                        callback(Object.assign(existobj.data, { last_name: last_name }))
                                    }
                                } else { //创建案卷
                                    var create_json = {
                                        name: first_name_arr[0] + first_name_arr[1],
                                        did: first_name_arr[0],
                                        type: 2,
                                        createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                                        pid: contentfileId,
                                        u_path: u_path,
                                    }
                                    local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                                        var _tree_path = tree_path + ',' + res.id;
                                        var dcres = { id: res.id, tree_path: _tree_path, last_name: last_name }
                                        local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                                            // callback(cres)

                                            if (first_name_arr[2]) { //组别
                                                //创建组别
                                                var create_json = {
                                                    name: first_name_arr[2],
                                                    type: 4,
                                                    createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                                                    pid: dcres.id,
                                                    u_path: u_path,
                                                }
                                                local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                                                    var _tree_path = dcres.tree_path + ',' + res.id;
                                                    var cres = { id: res.id, tree_path: _tree_path, last_name: last_name }
                                                    local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                                                        callback(cres)
                                                    })
                                                })

                                            }

                                        })
                                    })
                                }
                            })
                        } else {
                            var cres = { id: contentfileId, tree_path: tree_path, last_name: filename }
                            callback(cres)
                        }

                    }

                    createDocAndZu(filename, function (creaobj) {
                        parentAllData(function () {
                            var firstname = '', lastname = creaobj.last_name, finame = '';
                            var i = 0;
                            if (lastname.lastIndexOf('.') > -1) {
                                firstname = lastname.slice(0, lastname.lastIndexOf('.'))
                                finame = lastname.slice(lastname.lastIndexOf('.'))
                            } else {
                                firstname = lastname;
                                finame = ''
                            }
                            var fmd5 = res;
                            if (fmd5 != -1) {
                                loadGet()//重命名
                                function loadGet() {
                                    i++;
                                    var query_json = {
                                        name: lastname,
                                        tree_path: '^' + creaobj.tree_path,
                                        type: 3,
                                    }
                                    local_api._get('document', query_json, '', $.cookie('appkey'), function (getr) {
                                        if (getr.status == 0 && getr.data) {
                                            // var _tree_path = getr.data.tree_path.slice(0, getr.data.tree_path.lastIndexOf(','));
                                            if (getr.data.f_md5 == fmd5) { //同名同内容
                                                // if (_tree_path != creaobj.tree_path) { //不同文件夹
                                                //     creaobj.last_name = lastname
                                                //     renameSucc(creaobj, fmd5, file, callback)
                                                // } else {
                                                callback(getr.data)
                                                // }
                                            } else { //同名不同内容
                                                lastname = firstname + '(' + i + ')' + finame;
                                                loadGet()
                                            }
                                        } else if (getr.status == 0 && !getr.data) { //不同名
                                            creaobj.last_name = lastname
                                            renameSucc(creaobj, fmd5, file, callback)
                                        }
                                    })
                                }
                            }
                        })//获取alldata

                    })
                })
            }
            //重命名上传
            function renameSucc(creaobj, fmd5, file, callback) {
                var formData = new FormData();
                formData.append(creaobj.last_name, file);
                var url = '/upload?path=' + encodeURI(doc_path(creaobj.tree_path))
                var xhr = http({
                    type: 'POST',
                    url: url,
                    data: formData,
                    onProgress: function (event) {
                        console.log(event.percent);
                        console.log($(uploadLiArr[fileIndex]), fileIndex, '23')
                    },
                    onSuccess: function (data) {
                        console.log(data)
                        data.fmd5 = fmd5;
                        if (data.status == 0) {
                            uploadSuccess(data, creaobj, function (res) {
                                callback(res)
                            })
                        } else {
                            callback(data)
                        }
                    },
                    onError: function (err) {
                        callback(res)
                    }
                })
                // console.log()
            }

            // 上传成功
            function uploadSuccess(data, creaobj, callback) {
                var query_json = {
                    pid: creaobj.id,
                    size: data.file.size,
                    type: 3,
                    name: data.file.filename
                }
                local_api._get('document', query_json, '', $.cookie('appkey'), function (getres) {
                    if (getres.status == 0 && !getres.data) {
                        var filetype = data.file.mimetype.indexOf('image') > -1 ? 'png' : 'txt';
                        var create_json = {
                            size: data.file.size,
                            createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                            pid: creaobj.id,
                            type: 3,
                            filetype: filetype,
                            name: data.file.filename,
                            path: '/upload/' + doc_path(creaobj.tree_path) + data.file.filename,
                            f_md5: data.fmd5,
                            u_path: u_path,
                            ispass: 1
                        }
                        local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                            var _tree_path = creaobj.tree_path + ',' + res.id;
                            var cres = { id: res.id, tree_path: _tree_path }
                            local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                                callback(cres)
                            })
                        })
                    } else if (getres.status == 0 && getres.data) {
                        var cres = { id: getres.data.id, tree_path: getres.data.tree_path };
                        callback(cres)
                    }
                })
            }
            // 当上传的数据为 file 类型时，请求的格式类型自动会变为 multipart/form-data, 如果头部格式有特定需求，在我的 http 函数中传入 headers<Object> 即可，大家可自己查看，我这里没有什么特殊处理所以就不传了
        })
        input.click();
    }



    //删除文件
    $('.delete').on('click', function (ev) {
        console.log(getCheckedFile())
        var selectData = getCheckedFile();
        if (!getCheckedFile().length) {
            showTips('err', '请选择文件或档案！');
            return;
        }
        var treeArr = [];
        var nodelete = [];
        var typeobj = {};
        var typeArr = [];
        var deleteObj = [];
        selectData.forEach(ele => {
            // treeArr.push('^' + $('.item', ele).data().tree_path);
            var type = $('.item', ele).data().type;
            var dobj = {};
            if (type != 0) {
                treeArr.push('^' + $('.item', ele).data().tree_path);
                if (type == 3) {
                    dobj.tree_path = '^' + $('.item', ele).data().tree_path;
                    dobj.path = $('.item', ele).data().filepath
                } else {
                    dobj.tree_path = '^' + $('.item', ele).data().tree_path;
                    dobj.path = doc_path($('.item', ele).data().tree_path)
                }
                deleteObj.push(dobj)
            } else {
                nodelete.push('^' + $('.item', ele).data().tree_path)
            }

            // if(deleteObj)
            if (!typeobj[type]) {
                typeobj[type] = 1;
                var typeStr = type == 1 ? '分类' : type == 2 ? '案卷' : type == 3 ? '文件' : '';
                typeArr.push(typeStr)
            }

        })
        debugger
        createOperate('文件删除')
        console.log(deleteObj)
        if (nodelete.length > 0) {
            showTips('err', '无法对客户文件夹进行删除操作')
            // return false
        }
        // typeobj
        var confirmStr = `确定要删除${selectData.length > 1 ? '这些' : '这个'}${typeArr.join('/')}？`
        if (treeArr.length) {
            if (confirm(confirmStr)) {
                // console.log(treeArr)
                deleteObj.forEach((ele, i) => {
                    local_api._fsDelete({ curPath: ele.path }, $.cookie('appkey'), function (res) {
                        if (res.status == 0) {
                            local_api._delete('document', { tree_path: ele.tree_path }, $.cookie('appkey'), function (dres) {
                                if (i == deleteObj.length - 1) {
                                    treeData(pid)
                                    showTips('ok', `删除${typeArr.join('/')}成功!`);
                                }
                            })
                        }
                    })
                })
            }
        }

    })

    $('.logout').on('mousedown', function (ev) {
        ev.stopPropagation()
        // console.log(1)
        location.href = '/logout'
    })


    $('#showList').click(function () {
        $('.mod-tasks').toggleClass('expand')
    })

    //隐藏上传进度条
    $('#hideList').click(function () {
        $('.mod-tasks').hide();
        uploadLiArr = [];
        uploadFileArr = [];
        taskUl.empty();
        fileIndex = 0;
    })


    //合并

    $('#divCombind').dialog({
        width: 400,
        maxHeight: 400,
        autoOpen: false,
        buttons: {
            "确定": function () {
                combindSubmit()
            },
            "取消": function () {
                $('#divCombind').dialog("close");
            }
        }
    })
    $('#combind').on('click', function () {
        $('#divCombind').dialog("open");

        // console.log(obj)
    })

    function combindSubmit() {
        // console.log(getCheckedFile())
        var obj = {
            handle_json: { input: {}, output: '' },
            update: { path: '', name: '', size: '' },
            query: { id: '' },
            delete_j: { id: '' }
        };
        var objData = [];
        var pdfData = getCheckedFile();
        if (pdfData.length) {
            pdfData.forEach((ele) => {
                var dataSet = $('.item', ele).data();
                dataSet.name = $('.item .file-title', ele).text();
                // console.log($('.item ul>li:nth-child(1)',ele).text())
                dataSet.size = backFileSize($('.item ul>li:nth-child(1)', ele).text())
                objData.push(dataSet)
            })
        } else {
            showTips('err', '请选择pdf文件进行合并！')
        }
        if (!objData.length) {
            showTips('err', '请选择pdf文件进行合并！');
            return;
        }
        var _size = 0;
        var deleteArrId = [];
        objData.forEach((ele, i) => {
            _size += ele.size
            obj.handle_json.input[i] = doc_path(ele.tree_path) + ele.name;
            if (i == 0) {
                obj.query['id'] = ele.fileId;
                obj.update['name'] = $('#renameCombind').val().trim() + '.pdf';
                obj.update['path'] = '/upload/' + doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf'
                obj.handle_json.output = doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf'
            } else {
                deleteArrId.push(ele.fileId)
            }
        })
        obj.delete_j['id'] = deleteArrId.join('|');
        obj.update['size'] = _size;

        createOperate('合并文件')
        if (confirm('确定合并已选择的文件')) {
            local_api._fsCombind(obj.handle_json, $.cookie('appkey'), function (res) {
                if (res.status == 0) {
                    local_api._update('document', obj.query, obj.update, $.cookie('appkey'), function (res) {
                        local_api._delete('document', obj.delete_j, $.cookie('appkey'), function (res) {
                            showTips('ok', '合并成功!');
                            $('#divCombind').dialog("close");
                            renderFilesPathTree(contentfileId);
                        })
                    })
                } else {
                    showTips('err', '合并失败!');
                    $('#divCombind').dialog("close");
                }
            })
        } else {
            $('#divCombind').dialog("close");
        }

    }



    //导入
    $('#export').click(function () {
        var input = document.createElement('input');
        input.type = 'file';
        $(input).change(function (e) {
            // console.log(e)
            var files = $(this)[0].files;
            oneExc(files)
        })
        input.click();
    })

    $('#exportPorp').click(function () {
        var input = document.createElement('input');
        input.type = 'file';
        $(input).change(function (e) {
            // console.log(e)
            var files = $(this)[0].files;
            // oneExc(files)
        })
        input.click();
    })

    var oneExc = function (files) {
        createOperate('导入台账')
        var reader = new FileReader();
        reader.readAsBinaryString(files[0]);
        reader.onload = function (evt) {
            var data = evt.target.result;
            var wb = XLSX.read(data, {
                type: 'binary'
            });
            // console.log(wb)

            // console.log(wb.Sheets, wb['SheetNames'])


            var SheetNamesArr = wb['SheetNames'];
            var importobj = {};
            // if (SheetNamesArr.length > 1) {
            var filterData = docDatas.filter(ele => ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1);
            SheetNamesArr.forEach((ele, i) => {
                filterData.forEach(fil => {
                    if (ele.trim() == fil.name) {
                        console.log(fil)
                        importobj[ele] = {
                            'tree_path': fil.tree_path,
                            'id': fil.id,
                            createArr: [],
                            createDoc: []
                        };
                    }
                })
            })
            // console.log(importobj)
            // } else {

            // }

            // importobj
            for (var o in importobj) {
                // if(o == '兴围社区'){
                // var d = getimportData(o, importobj[o].id, importobj[o].tree_path);
                // }
                // updateData(o, importobj[o].id, importobj[o].tree_path)
                // importobj[o].createArr = d.createArr;
                // importobj[o].createDoc = d.createDoc;

            }
            console.log(importobj)

            function updateData(name, id, i_tree_path) {
                var xlsData = wb.Sheets[name];
                var xlsDataLength = getIndex(xlsData['!ref']);

                var letter = [];
                for (var x in xlsData) {
                    var _x = x.split('');
                    var strArr = []
                    _x.forEach(ele => {
                        /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
                    })
                    if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
                        letter.push(strArr.join(''));
                }

                var createArr = [];
                var createDoc = [];
                var colums = ['did', 'name', '位置']
                for (var i = 5; i < xlsDataLength + 1; i++) {
                    var obj = { u_path: u_path };
                    var create_json = {
                        createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                        pid: id,
                        type: 2,
                        u_path: u_path
                    };
                    letter.forEach(ele => {
                        if (xlsData[ele + i]) {
                            var propName = xlsData[ele + 3] ? xlsData[ele + 3].v : xlsData[ele + 4] ? xlsData[ele + 4].v : '';
                            switch (propName) {
                                case '建档时间': propName = 'createdAt';
                                    break;
                                case '保管期限': propName = 'saveExpireIn';
                                    break;
                                case '页数': propName = 'page';
                                    break;
                                case '文书份数': propName = 'num';
                                    break;
                                case '企业名称': propName = 'name';
                                    break;
                                case '档号': propName = 'did';
                                    break;
                                case '档案编号': propName = 'did';
                                    break;

                            }
                            if (propName == 'name') {
                                create_json.name = xlsData[ele + i].v
                            }
                            if (propName == 'did') {
                                create_json.did = xlsData[ele + i].v
                            }
                            if (colums.indexOf(propName) > -1) {
                                if (propName == '位置') {
                                    var pStr = xlsData[ele + i].v;
                                    var pStrArr = pStr.split('_');
                                    if (pStrArr.length == 6) {
                                        obj['qnum'] = pStrArr[0];
                                        obj['lnum'] = pStrArr[1]
                                        obj['ce'] = pStrArr[2]
                                        obj['jnum'] = pStrArr[3]
                                        obj['cnum'] = pStrArr[4]
                                        obj['bnum'] = pStrArr[5]
                                    }
                                    // obj[propName] = xlsData[ele + i].v
                                } else {
                                    obj[propName] = xlsData[ele + i].v
                                }
                            }
                        }
                    });
                    obj.name ? createDoc.push(create_json) : ''
                    obj.name ? createArr.push(obj) : ''
                }
                console.log(createDoc, createArr)
                var _thisCreateDoc = docDatas.filter(ele => ele.type == 2 && ele.tree_path.indexOf(i_tree_path) > -1);
                console.log(_thisCreateDoc)
                createArr.forEach(ele => {
                    _thisCreateDoc.forEach(_ele => {
                        if (ele.did == _ele.did) {
                            console.log(ele, _ele)
                            var handle_json = {
                                type: 1,
                                oldPath: doc_path(_ele.tree_path).slice(0, -1),
                                newPath: doc_path(i_tree_path) + ele.did + ele.name
                            }
                            console.log(handle_json)
                            // local_api._rename(handle_json, $.cookie('appkey'), function (han) {
                            // console.log(han.status)
                            // if (han.status == 0) {
                            // local_api._update('document', { id: _ele.id }, { name: ele.did + ele.name }, $.cookie('appkey'), function (res) {
                            //     console.log(res)
                            // })
                            // }
                            // })
                            // local_api._update('docProp', { did: ele.did }, ele, $.cookie('appkey'), function (res) {
                            //     console.log(res)
                            // })
                        }
                    })
                })
                // createDoc.forEach((ele, i) => {
                //     local_api._create('document', ele, $.cookie('appkey'), function (res) {
                //         var _tree_path = i_tree_path + ',' + res.id;
                //         var fid = res.id;
                //         local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                //             var docJson = createArr[i];
                //             docJson.fid = fid;
                //             local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
                //                 if (i == createDoc.length - 1) {
                //                     treeData(pid)
                //                     showTips('ok', '导入' + name + '成功')
                //                 }
                //             })
                //         })
                //     })
                // })
                return { createDoc, createArr }
            }

            function getimportData(name, id, i_tree_path) {

                var xlsData = wb.Sheets[name];
                var xlsDataLength = getIndex(xlsData['!ref']);

                var letter = [];
                for (var x in xlsData) {
                    var _x = x.split('');
                    var strArr = []
                    _x.forEach(ele => {
                        /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
                    })
                    if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
                        letter.push(strArr.join(''));
                }


                // var letter1 = ["B", "C", "D", "F", "G", "I", "J", "K", "L", "AD"]
                // console.log(letter, 'letter')
                // console.log(xlsData)
                var createArr = [];
                var createDoc = [];
                var colums = ['createdAt', 'saveExpireIn', 'page', 'num', 'did', 'name', '具体地址', '位置', '社区单位编号', '是否建档', '经营状态']
                for (var i = 5; i < xlsDataLength; i++) {
                    var obj = { u_path: u_path };
                    var create_json = {
                        createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                        pid: id,
                        type: 2,
                        u_path: u_path
                    };
                    letter.forEach(ele => {
                        if (xlsData[ele + i]) {
                            var propName = xlsData[ele + 3] ? xlsData[ele + 3].v : xlsData[ele + 4] ? xlsData[ele + 4].v : '';
                            switch (propName) {
                                case '建档时间': propName = 'createdAt';
                                    break;
                                case '保管期限': propName = 'saveExpireIn';
                                    break;
                                case '页数': propName = 'page';
                                    break;
                                case '文书份数': propName = 'num';
                                    break;
                                case '企业名称': propName = 'name';
                                    break;
                                case '档号': propName = 'did';
                                    break;
                                case '档案编号': propName = 'did';
                                    break;

                            }
                            if (propName == 'name') {
                                create_json.name = xlsData[ele + i].v
                            }
                            if (propName == 'did') {
                                create_json.did = xlsData[ele + i].v
                            }
                            if (colums.indexOf(propName) > -1) {
                                if (propName == '位置') {
                                    var pStr = xlsData[ele + i].v;
                                    var pStrArr = pStr.split('_');
                                    if (pStrArr.length == 6) {
                                        obj['qnum'] = pStrArr[0];
                                        obj['lnum'] = pStrArr[1]
                                        obj['ce'] = pStrArr[2]
                                        obj['jnum'] = pStrArr[3]
                                        obj['cnum'] = pStrArr[4]
                                        obj['bnum'] = pStrArr[5]
                                    }
                                    // obj[propName] = xlsData[ele + i].v
                                } else {
                                    obj[propName] = xlsData[ele + i].v
                                }
                            }
                        }
                    });
                    obj.name ? createDoc.push(create_json) : ''
                    obj.name ? createArr.push(obj) : ''
                }
                console.log(createDoc, createArr)
                createDoc.forEach((ele, i) => {
                    local_api._create('document', ele, $.cookie('appkey'), function (res) {
                        var _tree_path = i_tree_path + ',' + res.id;
                        var fid = res.id;
                        local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                            var docJson = createArr[i];
                            docJson.fid = fid;
                            local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
                                if (i == createDoc.length - 1) {
                                    treeData(pid)
                                    showTips('ok', '导入' + name + '成功')
                                }
                            })
                        })
                    })
                })
                return { createDoc, createArr }
                // console.log(xlsData,xlsDataLength)
            }



            // console.log(getIndex(xlsData['!ref']))






            // createDoc.forEach((ele, i) => {
            //     local_api._create('document', ele, $.cookie('appkey'), function (res) {
            //         var _tree_path = tree_path + ',' + res.id;
            //         var fid = res.id;
            //         local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
            //             var docJson = createArr[i];
            //             docJson.fid = fid;
            //             local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
            //                 if (i == createDoc.length - 1) {
            //                     treeData(pid)
            //                 }
            //             })
            //         })
            //     })
            // })

            // console.log(createArr, createDoc)
        }
    }

};
function doc_path(doc_paths) {
    var tArr = doc_paths.split(',').filter(e => e != '');
    var uploadPath = '';
    tArr.forEach(ele => {
        docDatas.forEach(e => {
            if (ele == e.id) {
                uploadPath += e.name + '/'
            }
        })
    })
    return uploadPath
}
//获取导入台账的最大数字
function getIndex(refs) {
    var refArr = refs.split('');
    var _i = 0;
    var _index = '';
    for (var i = refArr.length - 1; i > 0; i--) {
        if (/^[A-Z]+$/.test(refArr[i])) {
            _i = i + 1
            break
        }
    }
    for (var i = _i; i < refArr.length; i++) {
        _index += refArr[i]
    }
    return parseInt(_index)
}



// var uploadLiArr = [];
// var uploadFileArr = [];
// var taskUl = $('.task-list-cont');
// var cancalIndexArr = [];
// var _g = getSearch();
// var tree_path = '';
// var u_path = $.cookie('tree_path');
// var scrollTop;
// var pid = 0;
// var contentfileId = $.cookie('contentId');
// var moveItem = [];
// var movetoTarget = null;
// var docDatas;
// var sortString = 'did|type|name|id'
// _readyFun()
// function _readyFun() {
//     u_path = $.cookie('tree_path');



//     /* 主要内容区高度自适应 */

//     var header = tools.$('.header')[0];
//     var weiyunContent = tools.$('.weiyun-content')[0];
//     var headerH = header.offsetHeight;
//     var content = tools.$('.content')[0];
//     var fileList = tools.$('.file-list')[0]; // 文件展示区容器
//     var docProId;
//     /* 渲染文件展示区、树形导航区和文件路径区 */

//     var datas, childrenDatas;
//     console.log(data)
//     var treeMenu = tools.$('.tree-menu')[0]; // 树形导航区容器
//     var pathNav = tools.$('.path-nav')[0]; // 文件路径导航区容器
//     var empty = tools.$('.g-empty')[0]; // 文件展示区空白提醒
//     // var parentId = 0; // 父级id，默认为0


//     // var isfinish = false;
//     var uid = $.cookie('uid');

//     // 封装改变高度函数
//     function changeHeight() {
//         var viewH = document.documentElement.clientHeight;
//         weiyunContent.style.height = viewH - headerH + 'px';
//         content ? content.style.height = viewH - headerH - 62 + 'px' : '';
//         fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : ''
//     }

//     // 初始化
//     changeHeight();
//     // 窗口改变时，重新计算可视区高度
//     window.onresize = changeHeight;


//     function setOption() {
//         var positionNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9];;
//         var str = '';
//         positionNumber.forEach(ele => {
//             str += `<option value="${ele}">${ele}</option>`
//         })
//         return str
//     }
//     $('#qnum').empty().append(setOption())
//     $('#lnum').empty().append(setOption())
//     $('#jnum').empty().append(setOption())
//     $('#cnum').empty().append(setOption())

//     var customArr = [];
//     //固定属性
//     var fixPropArr = ['id', 'fid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname"]
//     $('#divDocPro').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         buttons: {
//             "保存": function () {
//                 if (isbatch) {
//                     // console.log(this)
//                     saveBatchProp()
//                 } else {
//                     saveDocPro();
//                 }

//             },
//             "取消": function () {
//                 $('#divDocPro').dialog("close");
//             }
//         }
//     })
//     $('#selectProp').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         title: '选择自定义属性',
//         buttons: {
//             "确定": function () {
//                 $('#selectProp').dialog("close");
//             }
//         }
//     })
//     $('#newCustomProp').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         title: '添加新属性',
//         buttons: {
//             "确定": function () {
//                 saveNewPro();
//             },
//             "取消": function () {
//                 $('#newCustomProp').dialog("close");
//             }
//         }
//     })

//     //选择已创建好的属性
//     $('#someProp').on('change', function (e) {
//         console.log(this.value)
//         if (this.value != 0) {
//             if (customArr.indexOf(this.value) == -1) {
//                 customArr.push(this.value)
//                 appendUlLI(this.value);
//                 // this.value = 0;
//             } else {
//                 showTips('err', `该属性已存在`);
//             }
//         }
//     })

//     //打开新增属性弹框
//     $('#newProp').click(function () {
//         $('#newCustomProp').dialog('open')
//     })

//     //打开选择自定义属性弹框
//     $('#addCustom').click(function () {
//         $('#selectProp').dialog("open");
//     })


//     //添加新属性
//     function saveNewPro() {
//         var name = $('#newPropname').val();
//         var size = 50;
//         local_api._createColumn('docProp', { name: name, size: size }, '', function (res) {
//             createOperate('添加自定义属性');
//             if (res.err) {
//                 showTips('err', `添加属性失败`);
//                 return;
//             }
//             appendUlLI(name);
//             customArr.push(name)
//             $('#someProp').append(`<option value="${name}">${name}</option>`)
//             $('#newCustomProp').dialog('close')
//         })
//     }

//     //插入到设置属性弹框
//     function appendUlLI(name) {
//         var li = document.createElement('li');
//         li.style.marginTop = '10px';
//         li.dataset = name
//         var lis = ` 
//             <label class="ellipsis" title="${name}">${name}</label>
//             <input value="" class="form-control" style="width:50%"/>
//             <button class="btn btn-primary newBtn" style="">删除</button>
//         `
//         li.innerHTML = lis;
//         $('#newPropLi').append(li);
//         console.log($(li))
//         $('button', li).on('click', function (e) {
//             console.log(name)
//             customArr.splice(customArr.indexOf(name), 1)
//             $(e.target).parent().remove()
//         })
//     }

//     var isbatch = false;
//     var fileidArr = [];
//     var fileTree = [];
//     var fileTitleArr = [];
//     var fileDocProId = [];
//     $('#someProo').on('click', function () {
//         isbatch = true;
//         fileidArr = [];
//         fileTree = [];
//         fileTitleArr = [];
//         fileDocProId = [];
//         console.log(getCheckedFile())
//         // get
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文件！');
//         } else {

//             getCheckedFile().forEach(ele => {
//                 if ($('.item', ele).data().type != 3) {
//                     fileidArr.push($('.item', ele).data().fileId);
//                     fileTree.push('^' + $('.item', ele).data().tree_path);
//                     fileTitleArr.push($('.item .file-title', ele).text())
//                 }
//             })
//             console.log(fileidArr, fileTree, fileTitleArr);
//             batchSetPro()
//         }
//     })

//     //初始化批量设置属性
//     function batchSetPro() {
//         local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
//             if (!colum.err) {
//                 customArr = [];
//                 $('#someProp').empty();
//                 $('#newPropLi').empty();
//                 $('#someProp').append(`<option value="${0}">${'可选属性'}</option>`)
//                 colum.row.forEach(ele => {
//                     if (fixPropArr.indexOf(ele.Field) == -1)
//                         $('#someProp').append(`<option value="${ele.Field}">${ele.Field}</option>`)
//                 })
//             }
//             local_api._list('document', { tree_path: fileTree.join('|'), type: 2 }, '', '', 1, -1, $.cookie('appkey'), function (res) {
//                 $('#name').val('');
//                 $('#saveExpireIn').val('');
//                 $('#createdAt').val('');
//                 $('#num').val('');
//                 $('#page').val('');
//                 $('#did').val('');
//                 $('#qnum').val(1);
//                 $('#lnum').val(1);
//                 $('#jnum').val(1);
//                 $('#cnum').val(1);
//                 $('#ce').val(0);
//                 $('#divDocPro').dialog("option", 'title', '批量设置属性');
//                 $('#divDocPro').dialog("open");
//                 res.data.forEach(ele => {
//                     fileDocProId.push(ele.id)
//                 })
//                 // console.log(res)
//             })
//         })
//     }
//     //批量设置属性保存
//     function saveBatchProp() {
//         console.log(fileDocProId);
//         if (!fileDocProId.length) {
//             showTips('err', '该档案下没有案卷可设置');
//             return;
//         }
//         // file
//         var createBatch = [];
//         var create_json = {
//             u_path: u_path,
//             name: $('#name').val(),
//             saveExpireIn: $('#saveExpireIn').val(),
//             createdAt: $('#createdAt').val(),
//             did: $('#did').val(),
//             num: $('#num').val(),
//             page: $('#page').val(),
//             qnum: $('#qnum').val(),
//             lnum: $('#lnum').val(),
//             jnum: $('#jnum').val(),
//             cnum: $('#cnum').val(),
//             ce: $('#ce').val(),
//         }
//         var liArr = $('#newPropLi li');
//         var customJson = {}
//         for (var i = 0; i < liArr.length; i++) {
//             var li = liArr[i];
//             customJson[$('label', li).text()] = $('input', li).val()
//         }
//         fileDocProId.forEach(ele => {
//             var newObj = Object.assign({}, create_json, customJson);
//             newObj.fid = ele
//             createBatch.push(newObj)
//         })
//         if (confirm('批量设置属性会覆盖案卷原有属性，是否批量设置属性')) {
//             local_api._delete('docProp', { fid: fileDocProId.join('|') }, $.cookie('appkey'), function (del) {
//                 console.log(del)
//                 local_api._createBatch('docProp', { data: JSON.stringify({ data: createBatch }) }, $.cookie('appkey'), function (res) {
//                     createOperate('批量设置案卷属性')
//                     // console.log(res)
//                     $('#divDocPro').dialog("option", 'title', '属性');
//                     $('#divDocPro').dialog("close");
//                 })
//             })
//         }
//         console.log(createBatch)
//     }

//     //初始化单个设置属性
//     var isNewProp = false; //是否设置属性
//     function setDocPro(ev) {

//         isbatch = false;
//         docProId = ev.id.slice('docPro_'.length, ev.id.length);
//         console.log(docProId)
//         local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
//             if (!colum.err) {
//                 customArr = [];
//                 $('#someProp').empty();
//                 $('#newPropLi').empty();
//                 $('#someProp').append(`<option value="${0}">${'可选属性'}</option>`)
//                 colum.row.forEach(ele => {
//                     if (fixPropArr.indexOf(ele.Field) == -1)
//                         $('#someProp').append(`<option value="${ele.Field}">${ele.Field}</option>`)
//                 })
//             }
//             local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
//                 console.log(res)
//                 if (res.status == 0) {
//                     if (res.data) {
//                         isNewProp = false;
//                         $('#name').val(res.data.name);
//                         $('#saveExpireIn').val(res.data.saveExpireIn);
//                         $('#createdAt').val(res.data.createdAt);
//                         $('#num').val(res.data.num);
//                         $('#page').val(res.data.page);
//                         $('#did').val(res.data.did);
//                         $('#qnum').val(res.data.qnum);
//                         $('#lnum').val(res.data.lnum);
//                         $('#jnum').val(res.data.jnum);
//                         $('#cnum').val(res.data.cnum);
//                         $('#ce').val(res.data.ce);
//                         $('#newPropLi').empty()
//                         for (var i in res.data) {
//                             if (fixPropArr.indexOf(i) == -1) {
//                                 if (res.data[i]) {
//                                     var li = document.createElement('li');
//                                     li.style.marginTop = '10px';
//                                     li.dataset = i
//                                     var lis = ` 
//                                         <label class="ellipsis" title="${i}">${i}</label>
//                                         <input value="${res.data[i]}" class="form-control" style="width:60%"/>
//                                     `
//                                     li.innerHTML = lis;
//                                     $('#newPropLi').append(li);
//                                 }

//                             }
//                         }
//                     } else {
//                         isNewProp = true;
//                         $('#name').val('');
//                         $('#saveExpireIn').val('');
//                         $('#createdAt').val('');
//                         $('#num').val('');
//                         $('#page').val('');
//                         $('#did').val('')
//                         $('#qnum').val(1);
//                         $('#lnum').val(1);
//                         $('#jnum').val(1);
//                         $('#cnum').val(1);
//                         $('#ce').val(0);
//                     }
//                     $('#divDocPro').dialog("open");
//                 }
//             })
//         })
//     }
//     //保存单个属性
//     function saveDocPro() {
//         createOperate('单个设置属性')
//         if (isNewProp) {
//             var create_json = {
//                 name: $('#name').val(),
//                 fid: docProId,
//                 u_path: u_path,
//                 saveExpireIn: $('#saveExpireIn').val(),
//                 createdAt: $('#createdAt').val(),
//                 num: $('#num').val(),
//                 did: $('#did').val(),
//                 page: $('#page').val(),
//                 qnum: $('#qnum').val(),
//                 lnum: $('#lnum').val(),
//                 jnum: $('#jnum').val(),
//                 cnum: $('#cnum').val(),
//                 ce: $('#ce').val()
//             }
//             var liArr = $('#newPropLi li');
//             var customJson = {}
//             for (var i = 0; i < liArr.length; i++) {
//                 var li = liArr[i];
//                 customJson[$('label', li).text()] = $('input', li).val()
//             }
//             Object.assign(create_json, customJson)
//             console.log(create_json)
//             local_api._create('docProp', create_json, $.cookie('appkey'), function (res) {
//                 local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
//                     $('#divDocPro').dialog("close");
//                 })

//             })
//         } else {
//             var update_json = {
//                 name: $('#name').val(),
//                 saveExpireIn: $('#saveExpireIn').val(),
//                 createdAt: $('#createdAt').val(),
//                 num: $('#num').val(),
//                 did: $('#did').val(),
//                 page: $('#page').val(),
//                 qnum: $('#qnum').val(),
//                 lnum: $('#lnum').val(),
//                 jnum: $('#jnum').val(),
//                 cnum: $('#cnum').val(),
//                 ce: $('#ce').val()
//             }
//             var query_json = {
//                 fid: docProId
//             }
//             var liArr = $('#newPropLi li');
//             var customJson = {}
//             for (var i = 0; i < liArr.length; i++) {
//                 var li = liArr[i];
//                 customJson[$('label', li).text()] = $('input', li).val()
//             }
//             Object.assign(update_json, customJson)

//             console.log(update_json)
//             local_api._update('docProp', query_json, update_json, $.cookie('appkey'), function (res) {
//                 local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
//                     $('#divDocPro').dialog("close");
//                 })
//             })
//         }
//     }

//     //审核弹框初始化
//     $('#divDocAudit').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         title: '文档审核',
//         buttons: {
//             "确定": function () {
//                 saveAudits()
//             },
//             "取消": function () {
//                 $('#divDocAudit').dialog("close");
//             }
//         }
//     })

//     //文档审核
//     $('#passDoc').on('click', function () {
//         fileDocProId = [];
//         fileTree = [];
//         // console.log(getCheckedFile())
//         // get
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文件！');
//         } else {
//             getCheckedFile().forEach(ele => {
//                 fileidArr.push($('.item', ele).data().fileId);
//                 fileTree.push('^' + $('.item', ele).data().tree_path);
//             })
//             console.log(fileidArr, fileTree);
//             $('#divDocAudit').dialog('open')
//             // docAudits()
//         }
//         // 
//     })


//     function saveAudits() {
//         // debugger;
//         createOperate('文档审核')
//         var upobj = { ispass: $('#divDocAudit input[name]:checked').val() }
//         var obj = { tree_path: fileTree.join('|') };
//         local_api._update('document', obj, upobj, $.cookie('appkey'), function (res) {
//             console.log(res)
//             showTips('ok', '审核成功！');
//             $('#divDocAudit').dialog('close')
//         })

//     }

//     //加锁弹框初始化
//     $('#divDocLock').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         title: '文档加锁',
//         buttons: {
//             "确定": function () {
//                 saveLock()
//             },
//             "取消": function () {
//                 $('#divDocLock').dialog("close");
//             }
//         }
//     })
//     //文档加锁
//     $('#lockDoc').on('click', function () {
//         fileDocProId = [];
//         fileTree = [];
//         // console.log(getCheckedFile())
//         // get
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文档！');
//         } else {
//             getCheckedFile().forEach(ele => {
//                 fileidArr.push($('.item', ele).data().fileId);
//                 fileTree.push('^' + $('.item', ele).data().tree_path);
//             })
//             console.log(fileidArr, fileTree);
//             $('#divDocLock').dialog('open')
//             // docAudits()
//         }
//     })

//     function saveLock() {
//         // createOperate('文档加锁')
//         var upobj = { islock: parseInt($('#divDocLock input[name]:checked').val()) }
//         var obj = { tree_path: fileTree.join('|') };
//         local_api._update('document', obj, upobj, $.cookie('appkey'), function (res) {
//             // console.log(res)
//             if (res.status == 0) {
//                 showTips('ok', '加锁成功！');
//                 $('#divDocLock').dialog('close');
//                 renderFilesPathTree(contentfileId)
//             } else {
//                 showTips('err', '加锁失败！');
//             }
//         })
//     }

//     //打印二维码
//     $('#printCode').on('click', function (ev) {
//         ev.stopPropagation();
//         createOperate('打印二维码')
//         fileDocProId = [];
//         fileTree = [];
//         fileTitleArr = []
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文件！');
//             return;
//         }
//         getCheckedFile().forEach(ele => {
//             fileidArr.push($('.item', ele).data().fileId);
//             fileTree.push('^' + $('.item', ele).data().tree_path);
//         })
//         console.log(fileidArr, fileTree)
//         Qrcode(fileTree)

//     })

//     function Qrcode(fileTree) {
//         var query_json = { tree_path: fileTree.join('|'), type: 2, did: '>0' }
//         local_api._list('document', query_json, 'did,name', 'did', 1, -1, $.cookie('appkey'), function (res) {
//             var data = res.data;
//             //    .remove();
//             var div = $('#qrcodePrint')[0] || document.createElement('div');
//             div.id = 'qrcodePrint'
//             var ul = `<ul class="qrcodePrint">`

//             data.forEach(ele => {
//                 ul += `<li><img src="http://h5.bibibaba.cn/pay/wicare/wxpayv3/qrcode.php?data=${ele.did}"><span>${ele.did}</span></li>`
//             })
//             ul += `</ul>`
//             div.innerHTML = ul;
//             if (!$('#qrcodePrint')[0]) {
//                 $('body').append(div)
//             } else {
//                 $(div).empty();
//                 $(div).append(ul)
//             }

//             var bdhtml = window.document.body.innerHTML;

//             var prnhtml = $('#qrcodePrint').html();
//             window.document.body.innerHTML = prnhtml; //把需要打印的指定内容赋给body.innerHTML
//             // window.print(); //调用浏览器的打印功能打印指定区域
//             _print(bdhtml)



//             // console.log(res)
//         })
//     }

//     function _print(bdhtml) {
//         var t_img; // 定时器
//         var isLoad = true; // 控制变量（判断图片是否 加载完成）

//         isImgLoad(function () {//判断全部打印图片加载完成
//             window.print()
//             window.document.body.innerHTML = bdhtml;//重新给页面内容赋值；
//             _readyFun()
//             // 加载完成
//         });

//         //判断图片加载的函数
//         function isImgLoad(callback) {
//             // 查找所有打印图，迭代处理
//             $('.qrcodePrint img').each(function () {
//                 // 找到为0就将isLoad设为false，并退出each
//                 console.log(this.height)
//                 if (this.height === 0) {
//                     isLoad = false;
//                     return false;
//                 }
//             });
//             // 为true，没有发现为0的。加载完毕
//             if (isLoad) {
//                 clearTimeout(t_img); // 清除定时器
//                 // 回调函数
//                 callback();
//                 // 为false，因为找到了没有加载完成的图，将调用定时器递归
//             } else {
//                 isLoad = true;
//                 t_img = setTimeout(function () {
//                     isImgLoad(callback); // 递归扫描
//                 }, 500); // 我这里设置的是500毫秒就扫描一次，可以自己调整
//             }
//         }
//     }

//     //移动弹框初始化
//     $('#divDocumentAssign').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         buttons: {
//             "确定": function () {
//                 movesubmit()
//             },
//             "取消": function () {
//                 $('#divDocumentAssign').dialog("close");
//             }
//         }
//     })



//     //移动
//     $('.move').on('click', function (ev) {
//         // console.log(getCheckedFile())
//         if (getCheckedFile().length) {
//             // console.log()
//             // if (!selectMoveItem()) {
//             //     showTips('err', '只支持移动案卷或文档');
//             //     return;
//             // }
//             console.log(getMovetree_path())
//             $('#divDocumentAssign').dialog('option', 'title', '移动')
//             $('#divDocumentAssign').dialog('open')
//         } else {
//             showTips('err', '请选择需要移动的案卷或分类')
//         }
//         // console.log(ev)
//     })
//     function getMovetree_path() {
//         var data = getCheckedFile();
//         var obj;
//         var obj = { tree_path: [], id: [] }
//         for (var i = 0; i < data.length; i++) {
//             obj.tree_path.push('^' + $('.item', data[i]).data().tree_path)
//             obj.id.push($('.item', data[i]).data().fileId)
//         }
//         return obj
//     }
//     // function selectMoveItem() {
//     //     var data = getCheckedFile();
//     //     var istrue = false;
//     //     for (var i = 0; i < data.length; i++) {
//     //         if ($('.item', data[i]).data().type == 2 || $('.item', data[i]).data().type == 3) {
//     //             istrue = true
//     //         } else {
//     //             istrue = false;
//     //             break;
//     //         }
//     //     }
//     //     return istrue
//     // }



//     //移动确认
//     function movesubmit() {
//         createOperate('移动')
//         var _tree_path = getMovetree_path().tree_path;
//         var idArr = getMovetree_path().id
//         console.log(assignFid, assignTreePath, assignU_path);
//         var updateArr = [];
//         local_api._list('document', { tree_path: _tree_path.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
//             res.data.forEach(ele => {
//                 var obj = {};
//                 obj[ele.id] = {};
//                 if (idArr.indexOf(ele.id) > -1) {
//                     obj[ele.id].pid = assignFid;
//                     var startIndex = ele.tree_path.indexOf(ele.id);
//                     var endIndex = ele.tree_path.length;
//                     var _tree_path = assignTreePath + ',' + ele.tree_path.slice(startIndex, endIndex)
//                     obj[ele.id].oldtree_path = ele.tree_path;
//                     obj[ele.id].tree_path = _tree_path;
//                     obj[ele.id].olePath = doc_path(ele.tree_path);
//                     obj[ele.id].newPath = doc_path(_tree_path);
//                     obj[ele.id].u_path = assignU_path;
//                     obj[ele.id].name = ele.name;
//                     obj[ele.id].type = ele.type;
//                     updateArr.push(obj)
//                     childData(ele.id, _tree_path)
//                     function childData(id, _tree_path) {
//                         var data = dataControl.getChildById(res.data, id);
//                         if (data.length) {
//                             data.forEach(e => {
//                                 var obj1 = {};
//                                 obj1[e.id] = {};
//                                 obj1[e.id].pid = id
//                                 obj1[e.id].oldtree_path = e.tree_path;
//                                 var _tree_path1 = _tree_path + ',' + e.id
//                                 obj1[e.id].tree_path = _tree_path1
//                                 obj1[e.id].olePath = doc_path(e.tree_path);
//                                 obj1[e.id].newPath = doc_path(_tree_path1);
//                                 obj1[e.id].u_path = assignU_path;
//                                 obj1[e.id].name = e.name;
//                                 obj1[e.id].type = e.type;
//                                 // console.log(e)
//                                 updateArr.push(obj1)
//                                 childData(e.id, _tree_path1)
//                             })
//                         }
//                     }
//                 }
//             })
//             // console.log(res)
//             console.log(updateArr)
//             var i = 0;
//             $('#divDocumentAssign').dialog('close')
//             movoFile(updateArr, i)
//         })
//     }
//     //递归移动
//     function movoFile(updateArr, i) {
//         console.log(updateArr[i]);
//         var obj = updateArr[i];
//         for (var o in obj) {
//             if (obj[o].type == 3) {
//                 var handle_json = {
//                     oldPath: obj[o].olePath,
//                     newPath: obj[o].newPath,
//                     name: obj[o].name,
//                     type: 2
//                 }
//                 local_api._rename(handle_json, $.cookie('appkey'), function (res) {
//                     if (res.status == 0) {
//                         var update_json = {
//                             path: '/upload/' + obj[o].newPath + res.name,
//                             tree_path: obj[o].tree_path,
//                             pid: obj[o].pid,
//                             u_path: obj[o].u_path,
//                             name: res.name
//                         };
//                         var query_json = { id: o }
//                         local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
//                             i++;
//                             showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
//                             if (updateArr[i]) {
//                                 movoFile(updateArr, i)
//                             }
//                             if (i == updateArr.length) {
//                                 treeData(pid)
//                             }
//                         })
//                     } else {
//                         i++;
//                         showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
//                         if (updateArr[i]) {
//                             movoFile(updateArr, i)
//                         }
//                         if (i == updateArr.length) {
//                             treeData(pid)
//                         }
//                     }
//                 })
//             } else {
//                 var update_json = {
//                     path: '/upload/' + obj[o].newPath,
//                     tree_path: obj[o].tree_path,
//                     pid: obj[o].pid,
//                     u_path: obj[o].u_path,
//                 };
//                 var query_json = { id: o }
//                 local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
//                     i++;
//                     showTips('ok', `正在移动目录和文件${i}/${updateArr.length}`)
//                     if (i == updateArr.length) {
//                         treeData(pid);
//                     }
//                     if (updateArr[i]) {
//                         movoFile(updateArr, i)
//                     }
//                 })
//             }
//         }


//     }



//     // $('.openPro').on('mousedown',function(ev){
//     //     ev.stopPropagation();
//     //     openPro(ev)
//     // })

//     //打开密集柜
//     var appInterval
//     function openPro(ev) {
//         createOperate('打开密集柜')
//         var docProId = ev.id.slice('openProo_'.length, ev.id.length);
//         local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
//             if (res.data) {
//                 var qu = parseInt(res.data.qnum || 0);
//                 var lie = parseInt(res.data.lnum || 0);
//                 var jie = parseInt(res.data.jnum || 0);
//                 var ceng = parseInt(res.data.cnum || 0);
//                 var ce = parseInt(res.data.ce || 0);
//                 var bh = parseInt(res.data.bnum || 1);
//                 if (qu > 0 && lie > 0 && jie > 0 && ceng > 0 && ce >= 0) {
//                     var create_json = {
//                         qu, lie, jie, ceng, ce, bh,
//                         name: res.data.did,
//                         status: 1
//                     }
//                     local_api._delete('playApp', { id: '>0' }, $.cookie('appkey'), function (del) {
//                         local_api._create('playApp', create_json, $.cookie('appkey'), function (create) {
//                             var _Id = create.id;
//                             // showTips('err', '打开失败，请重新打开！')
//                             if (appInterval) {
//                                 clearInterval(appInterval)
//                             }
//                             appInterval = setInterval(() => {
//                                 local_api._get('playApp', { id: _Id }, '', $.cookie('appkey'), function (status) {
//                                     if (status.data.status != 1) {
//                                         clearInterval(appInterval);
//                                         if (status.data.status == 2) {
//                                             showTips('ok', '打开成功！')
//                                         } else if (status.data.status == 3) {
//                                             showTips('err', '密集柜连接失败，请检查是否已连接！')
//                                         } else {
//                                             showTips('err', '打开失败，请重新打开！')
//                                         }
//                                     }
//                                 })
//                             }, 1000)
//                         })
//                     })
//                 } else {
//                     showTips('err', '无位置信息，无法打开密集柜！')
//                 }
//             } else {
//                 showTips('err', '无位置信息，无法打开密集柜！')
//             }
//         })
//         console.log(docProId)
//     }

//     // window.tree_path = tree_path;
//     // parentAllData()
//     function parentAllData(callback) {
//         local_api._list('document', { type: '0|1|2|4' }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
//             docDatas = res.data;
//             callback ? callback() : null
//         })
//     }

//     //获取目录树
//     function treeData(pid) {
//         parentAllData()
//         local_api._list('document', { type: '0|1|2|4', u_path: '^' + $.cookie('tree_path') }, '', sortString, 1, -1, $.cookie('appkey'), function (res) {
//             if (res.status == 0) {
//                 if (res.total) {
//                     datas = res.data;
//                     pid = pid || res.data[0].pid;
//                     contentfileId = _g.fileId || contentfileId || res.data[0].id
//                     tree_path = tree_path || res.data[0].tree_path;
//                     u_path = u_path || res.data[0].u_path;
//                     if (_g.fileId) {
//                         local_api._get('document', { id: _g.fileId }, '', $.cookie('appkey'), function (ts) {
//                             if (ts.data) {
//                                 tree_path = ts.data.tree_path;
//                                 u_path = ts.data.u_path
//                             }
//                         })
//                     }
//                     _g.fileId = null;
//                     // console.log(dataControl.getLeveById(datas, _g.fileId))
//                     getDocumentPlay(pid)
//                 }
//             }
//         })
//     }
//     treeData(pid)

//     //点击文件展示区事件
//     var fileLIstFun = function (ev) {
//         console.log(ev.currentTarget, 'filelist')
//         if (isrename) {//重命名
//             return;
//         }
//         var target = tools.getTarget(ev);

//         if (target.className.indexOf('docProo') > -1) {
//             setDocPro(ev.target)
//         }
//         if (target.className.indexOf('openProo') > -1) {
//             openPro(ev.target)
//         }
//         if (target.className.indexOf('folder') > -1 || getCurrentClick(ev)) {
//             // 找到class为item的父级,设置为ev.target
//             scrollTop = $('.file-list').scrollTop();
//             if (tools.parents(target, '.item')) {
//                 target = tools.parents(target, '.item');
//                 // 获取父级的自定义属性file-id，渲染子数据
//                 var fileId = target.dataset.fileId;
//                 contentfileId = fileId;
//                 $.cookie('contentId', contentfileId)
//                 var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
//                 var node = treeObj.getNodeByParam("id", contentfileId, null);
//                 if (node) {
//                     tree_path = node.treePath;
//                     u_path = node.u_path;
//                     treeObj.selectNode(node);
//                 }
//                 renderFilesPathTree(fileId);
//             }
//         } else {
//             console.log($('.item', ev.currentTarget).data())
//             var dataset = $('.item', ev.currentTarget).data();
//             var path = `/js/pdf/generic/web/viewer.html?file=${target.dataset.filepath}`
//             if (dataset.type == 3) {
//                 path = '/pdfView?fileid=' + dataset.fileId;
//                 window.open(path, '_blank')


//                 // target.dataset.filepath ? window.open(path, '_blank') : null;
//             }
//             // console.log(target)
//             // var path = `/docshow?path=${target.dataset.filepath}`

//         }
//     }

//     //点击导航事件
//     var pathNavFun = function (ev) {
//         var target = tools.getTarget(ev);
//         if (tools.parents(target, 'a')) {
//             var fileId = target.dataset.fileId;
//             contentfileId = fileId;
//             $.cookie('contentId', contentfileId)
//             var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
//             var node = treeObj.getNodeByParam("id", contentfileId, null);
//             if (node) {
//                 // $.cookie('_treePath',)
//                 tree_path = node.treePath;
//                 u_path = node.u_path;
//                 // $.cookie('_treePath', u_path)
//                 treeObj.selectNode(node);
//             }
//             renderFilesPathTree(fileId);
//         }
//     }

//     // var treeMenuFun = function (ev) {
//     //     var target = tools.getTarget(ev);
//     //     if (tools.parents(target, '.tree-title')) {
//     //         var isShow = tools.parents(target, '.tree-title').nextElementSibling.style.display == 'none' ? true : false;
//     //         if (target.className.indexOf('ico') > -1) {
//     //             target.className = isShow ? 'ico' : 'ico act'
//     //             tools.parents(target, '.tree-title').nextElementSibling.style.display = isShow ? 'block' : 'none'
//     //             return;
//     //         }
//     //         target = tools.parents(target, '.tree-title');
//     //         var fileId = target.dataset.fileId;
//     //         contentfileId = fileId;
//     //         tree_path = target.dataset.tree_path;
//     //         u_path = target.dataset.u_path;
//     //         renderFilesPathTree(fileId);
//     //     }
//     // }
//     //移除事件
//     var removeClicks = function () {
//         $(document).off('click', `.file-list .file-item`, fileLIstFun)
//         // tools.removeEvent(fileList, 'click', fileLIstFun);
//         // tools.removeEvent(treeMenu, 'click', treeMenuFun);
//         tools.removeEvent(pathNav, 'click', pathNavFun);
//     }

//     function getDocumentPlay(pid) {
//         $('.file-list').empty();
//         $('#tree-menu').empty();
//         removeClicks();
//         // 渲染文件展示区html结构，默认最外层
//         fileList.innerHTML = createFilesHtml(datas, contentfileId);
//         // 给文件展示区每个文件注册点击事件
//         // tools.addEvent(fileList, 'click', fileLIstFun);
//         $(document).on('click', `.file-list .file-item`, fileLIstFun)

//         // 渲染树形导航区html结构，默认都展开
//         showTree(datas)
//         // treeMenu.innerHTML = createTreeHtml(datas, pid);
//         // // 给树形导航区每个文件注册点击事件
//         // tools.addEvent(treeMenu, 'click', treeMenuFun);

//         // 渲染文件路径导航区html结构，默认渲染第一层
//         pathNav.innerHTML = createPathNavHtml(datas, contentfileId);
//         // 树形导航区默认定位到最外层
//         // positionTreeById(contentfileId);
//         renderFilesPathTree(contentfileId)
//         // 给文件路径导航区每个文件注册点击事件
//         tools.addEvent(pathNav, 'click', pathNavFun);
//     }

//     var icons = {
//         0: './img/icon-file-s.svg',
//         1: './img/icon-file-s.svg',
//         2: './img/icon-file-s1.svg',
//         4: './img/icon-file-s2.svg',
//     }
//     //显示目录树
//     function showTree(data) {
//         var names = [];
//         customers = data;
//         for (var i = 0; i < data.length; i++) {
//             names.push(data[i].name);
//         }

//         var onCustomerSelectClick = function (event, treeId, treeNode) {
//             if (parseInt(treeNode.id) > -1) {
//                 contentfileId = treeNode.id;
//                 $.cookie('contentId', contentfileId)
//                 tree_path = treeNode.treePath;
//                 u_path = treeNode.u_path;
//                 renderFilesPathTree(contentfileId);
//             }
//         };

//         var onCustomerAssignClick = function (event, treeId, treeNode) {
//             if (parseInt(treeNode.id) > -1) {
//                 assignFid = treeNode.id;
//                 assignTreePath = treeNode.treePath;
//                 // assignName = treeNode._name;
//                 assignU_path = treeNode.u_path;
//                 assignPath = treeNode.path;
//                 // assing
//             }
//         };

//         var setting = {
//             view: { showIcon: true },
//             check: { enable: false, chkStyle: "checkbox" },
//             data: { simpleData: { enable: true } },
//             callback: { onClick: onCustomerSelectClick }
//         };
//         var settingAssign = {
//             view: { showIcon: true },
//             check: { enable: false, chkStyle: "checkbox" },
//             data: { simpleData: { enable: true } },
//             callback: { onClick: onCustomerAssignClick }
//         };

//         var fileArray = [];
//         var selectArray = [];


//         // 创建三个分类的根节点
//         for (var i = 0; i < data.length; i++) {
//             fileArray.push({
//                 open: false,
//                 id: data[i]['id'],
//                 treePath: data[i]['tree_path'],
//                 pId: data[i]['pid'],
//                 name: data[i]['name'],
//                 u_path: data[i]['u_path'],
//                 icon: icons[data[i]['type']],
//                 path: data[i]['path']
//             });
//             selectArray.push({
//                 open: false,
//                 id: data[i]['id'],
//                 treePath: data[i]['tree_path'],
//                 pId: data[i]['pid'],
//                 name: data[i]['name'],
//                 u_path: data[i]['u_path'],
//                 icon: icons[data[i]['type']],
//                 path: data[i]['path']
//             });
//         }

//         $.fn.zTree.init($("#tree-menu"), setting, fileArray);
//         $.fn.zTree.init($("#documentTreeAssign"), settingAssign, selectArray);

//         if (contentfileId >= 0) {
//             var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
//             var node = treeObj.getNodeByParam("id", contentfileId, null);
//             if (node) {
//                 tree_path = node.treePath;
//                 u_path = node.u_path;
//                 // cust_name = node.name;
//                 treeObj.selectNode(node);
//             }
//             // else {
//             //     uid = $.cookie('uid');
//             //     u_path = $.cookie('tree_path');
//             //     node = treeObj.getNodeByParam("id", uid, null);
//             //     tree_path = node.treePath;
//             //     cust_name = node.name;
//             //     treeObj.selectNode(node);
//             // }
//         }
//     }

//     function getCurrentClick(ev) {
//         var type = parseInt(ev.target.dataset.type);

//         if ([0, 1, 2, 4].indexOf(type) > -1) {
//             return true;
//         }
//         if (ev.target.className == 'file-title') {
//             var ptype = parseInt(ev.target.parentNode.parentNode.dataset.type);
//             if ([0, 1, 2, 4].indexOf(ptype) > -1) {
//                 return true;
//             }
//         }
//         if (ev.target.className == 'file-title-box') {
//             var ptype = parseInt(ev.target.parentNode.dataset.type);
//             if ([0, 1, 2, 4].indexOf(ptype) > -1) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     // $('.file-list').scroll(function(re){
//     //     // console.log($(this).scrollTop())
//     //     scrollTop = $(this).scrollTop();
//     // })



//     // 在树形导航区定位到传入id的文件
//     function positionTreeById(fileId) {
//         var ele = document.querySelector('.tree-title[data-file-id="' + fileId + '"]');
//         tools.addClass(ele, 'tree-nav');
//     }

//     // 渲染文件展示区、树形导航区和文件路径区数据
//     function renderFilesPathTree(fileId) {
//         if (scrollTop) {
//             // $(".file-list").animate({scrollTop:scrollTop},"slow");
//             setTimeout(() => {
//                 $(".file-list")[0].scrollTop = scrollTop
//             }, 1000)

//         }
//         // var treeNav = tools.$('.tree-nav', treeMenu)[0]; // 当前定位的文件
//         childrenDatas = [];
//         datas.forEach(ele => {
//             if (ele.id == fileId) {
//                 if (ele.type == 1 || ele.type == 0) {
//                     $('#folder1').show();
//                     $('#folder2').show();
//                     $('#folder3').hide();
//                 } else {
//                     $('#folder1').hide();
//                     $('#folder2').hide();
//                     $('#folder3').show();
//                 }
//                 childrenDatas.push(ele);
//             }
//         })
//         var json = { pid: fileId, u_path: '^' + u_path };
//         if (roleArr.indexOf('访问加锁文档') == -1) {
//             json['islock'] = '<>2'
//         }
//         local_api._list('document', json, '', sortString, 1, -1, $.cookie('appkey'), function (res) {
//             $('.file-list').empty();
//             // $('.tree-menu').empty();
//             // var hasChild = dataControl.hasChrildren(datas, fileId); // 是否有子级
//             var hasChild = res.total ? true : false;
//             childrenDatas = childrenDatas.concat(res.data)
//             // datas = res.data
//             console.log(hasChild)

//             // 判断是否有子数据，再渲染文件展示区
//             if (hasChild) {
//                 empty.style.display = 'none';
//                 fileList.innerHTML = createFilesHtml(childrenDatas, fileId);
//             } else {
//                 empty.style.display = 'block';
//                 fileList.innerHTML = '';
//             }

//             // 渲染文件路径导航区
//             pathNav.innerHTML = createPathNavHtml(datas, fileId);

//             // 定位树形导航区当前文件
//             // tools.removeClass(treeNav, 'tree-nav');
//             // positionTreeById(fileId);

//             // 获取所有渲染后的文件，再给这些文件绑定事件
//             fileItem = tools.$('.file-item', fileList);
//             tools.each(fileItem, function (item, index) {
//                 fileHandle(item);
//             })

//             // 重新渲染后取消全选按钮勾选
//             tools.removeClass(checkedAll, 'checked');

//             // 重新渲染后保存当前父级id
//             // parentId = fileId;
//             contentfileId = fileId;
//             $.cookie('contentId', contentfileId)
//             // console.log($('.file-list .checkbox'))
//             // $('.file-list .checkbox').on('click',function(e){
//             //     console.log(e)
//             // })

//         })

//         // console.log(treeNav)

//     }


//     //内容展示布局 列表/缩略图
//     tools.addEvent(tools.$('.mod-action-wrap')[1], 'mouseover', function (ev) {
//         if (ev.target.className == "action-item") {
//             return;
//         }
//         if (ev.target.className == "action-item-con") {
//             btnConBack();
//             ev.target.style.background = '#f5f6f9';
//             ev.target.children[1].style.display = 'inline-block';
//             tools.addEvent(document, 'mouseover', btnChange)
//             return
//         }

//     })
//     var btnChange = function (evt) {
//         // console.log(evt.target.className, 'document')
//         if (evt.target.className != 'action-item-con') {
//             if (evt.target.className.indexOf('icon-') > -1) {
//                 return
//             }
//             btnConBack()
//             tools.removeEvent(document, 'mouseover', btnChange)
//         }
//     }

//     function btnConBack() {
//         tools.$('#btn-change .action-item-con').forEach(ele => {
//             ele.style.background = '#fff'
//         });
//         tools.$('#btn-change .act-txt').forEach(ele => {
//             ele.style.display = 'none'
//         });
//     }

//     for (var i = 0; i < tools.$('.mod-action-wrap')[1].children.length; i++) {
//         tools.addEvent(tools.$('.mod-action-wrap')[1].children[i], 'click', function (ev) {
//             // console.log(this)
//             // console.log(this == tools.$('.mod-action-wrap')[1].children[0])
//             console.log(tools.hasClass(this, 'act'))
//             if (this == tools.$('.mod-action-wrap')[1].children[0]) {
//                 if (!tools.hasClass(this, 'act')) {
//                     this.className = this.className + ' act';
//                     tools.$('.mod-action-wrap')[1].children[1].className = 'action-item';
//                     tools.addClass(tools.$('.file-list')[0], 'f_detail')
//                 }
//             } else {
//                 if (!tools.hasClass(this, 'act')) {
//                     this.className = this.className + ' act';
//                     tools.$('.mod-action-wrap')[1].children[0].className = 'action-item';
//                     tools.removeClass(tools.$('.file-list')[0], 'f_detail')
//                 }
//             }
//         })
//     }


//     /* 鼠标移入移除、全选和单选 */

//     var fileItem = tools.$('.file-item', fileList); // 文件展示区所有文件
//     var checkedAll = tools.$('.cheched-all')[0]; // 全选按钮
//     var allCheckbox = tools.$('.checkbox', fileList); // 当前文件展示区所有的checkbox

//     // 给每个文件初始化事件绑定
//     tools.each(fileItem, function (item, index) {
//         fileHandle(item);
//     });

//     console.log($('.file-list .checkbox'))
//     // $('.checkbox',fileList).on('click',function(e){
//     //     console.log(e)
//     // })  

//     // 给全选按钮添加事件
//     tools.addEvent(checkedAll, 'click', function (ev) {
//         // 获取最新的文件和所有的checkbox
//         fileItem = tools.$('.file-item', fileList);
//         allCheckbox = tools.$('.checkbox', fileList);

//         // 判断checkbox是否已经勾选
//         var isAddClass = tools.toggleClass(this, 'checked');

//         if (isAddClass) {
//             tools.each(fileItem, function (item, index) {
//                 tools.addClass(item, 'file-checked');
//                 tools.addClass(allCheckbox[index], 'checked');
//             });
//         } else {
//             tools.each(fileItem, function (item, index) {
//                 tools.removeClass(item, 'file-checked');
//                 tools.removeClass(allCheckbox[index], 'checked');
//             })
//         }
//     });

//     // 单独给一个文件添加事件处理
//     function fileHandle(item) {
//         var checkbox = tools.$('.checkbox', item)[0];

//         // 每个文件添加鼠标移入事件
//         tools.addEvent(item, 'mouseenter', function () {
//             tools.addClass(this, 'file-checked');
//         });

//         // 每个文件添加鼠标移出事件
//         tools.addEvent(item, 'mouseleave', function () {
//             if (!tools.hasClass(checkbox, 'checked')) {
//                 tools.removeClass(this, 'file-checked');
//             }
//         });

//         // 给checkbox添加点击事件，并阻止事件冒泡
//         tools.addEvent(checkbox, 'click', function (ev) {
//             // 获取最新的allCheckbox
//             console.log(ev, 'thischeck')
//             allCheckbox = tools.$('.checkbox', fileList);
//             // toggleClass返回一个布尔值，有这个class则为true
//             var isAddClass = tools.toggleClass(this, 'checked');
//             if (isAddClass) {
//                 // 判断是否所有的checkbox都有checked
//                 if (getCheckedFile().length == allCheckbox.length) {
//                     tools.addClass(checkedAll, 'checked');
//                 }
//             } else {
//                 // 只要没有checked这个class就说明没有全选
//                 tools.removeClass(checkedAll, 'checked');
//             }
//             tools.stopPropagation(ev);
//         });
//     }

//     // 获取所有checkbox被勾选的文件
//     function getCheckedFile() {
//         var arr = [];
//         tools.each(allCheckbox, function (checkbox, index) {
//             if (tools.hasClass(checkbox, 'checked')) {
//                 arr.push(fileItem[index]);
//             }
//         });
//         return arr;
//     }

//     // 文件(夹)操作
//     tools.addEvent(tools.$('.mod-action-wrap')[0], 'mouseover', function (ev) {
//         if (ev.target.className == "action-item") {
//             return;
//         }
//         if (ev.target.className == "action-item-con") {
//             itemConBack();
//             ev.target.style.background = '#f5f6f9';
//             ev.target.children[1].style.display = 'inline-block';
//             tools.addEvent(document, 'mouseover', itemDocument)
//             return
//         }

//     })
//     var itemDocument = function (evt) {
//         // console.log(evt.target.className, 'document')
//         if (evt.target.className != 'action-item-con') {
//             if (evt.target.className.indexOf('icon-') > -1) {
//                 return
//             }
//             itemConBack()
//             tools.removeEvent(document, 'mouseover', itemDocument)
//         }
//     }

//     function itemConBack() {
//         tools.$('.mod-nav .action-item-con').forEach(ele => {
//             ele.style.background = '#fff'
//         });
//         tools.$('.mod-nav .act-txt').forEach(ele => {
//             ele.style.display = 'none'
//         });
//     }

//     // tools.addEvent(document


//     /* 框选功能 */
//     var newDiv = null;
//     var newDiv2 = null;
//     var disX = 0, disX = 0;

//     tools.addEvent(tools.$('.main')[0], 'mousedown', function (ev) {
//         var target = tools.getTarget(ev);
//         if (tools.parents(target, '.nav-a')) return;
//         disX = ev.clientX;
//         disY = ev.clientY;

//         // moveItem = [];
//         // console.log(getCheckedFile(), 'aa')

//         // fileItem = tools.$('.file-item', fileList);
//         // allCheckbox = tools.$('.checkbox', fileList);

//         // if(moveItem.length){

//         // }
//         // 鼠标移动
//         tools.addEvent(document, 'mousemove', mouseMove)

//         // 鼠标抬起
//         tools.addEvent(document, 'mouseup', mouseUp)

//         // 阻止默认行为
//         ev.preventDefault();
//     })



//     var issecondmove = false;
//     var newDiv2;
//     function moveItemFun(ev) {
//         console.log(ev.target)
//         movetoTarget = ev.target
//         if (!newDiv2) {
//             newDiv2 = document.createElement('div');
//             document.body.appendChild(newDiv2);
//             var cssobj = { position: 'fixed', width: '150px', height: '40px' }
//             $(newDiv2).css(cssobj);
//             var newDiv2Content =
//                 `<div class="selectboxMoveone">
//                         <div>
//                             <span></span>
//                             <span class="ellipsis">${$('.file-title', getCheckedFile()[0]).text()}</span>
//                         </div>
//                         <span class="moveleng">${getCheckedFile().length}</span>
//                     </div>
//                     ${getCheckedFile().length > 1 ? `<div class="selectboxMovemore"></div>` : ''}
//                     `
//             $(newDiv2).append(newDiv2Content)
//         }
//         $(newDiv2).css({ top: ev.clientY + 2, left: ev.clientX + 2 })
//     }
//     // 鼠标移动
//     function mouseMove(ev) {
//         // console.log(ev.target)
//         // targetNode(ev.target)
//         if (newDiv2) {
//             moveItemFun(ev)
//             return
//         }
//         // console.log(getCheckedFile().indexOf(ev.target.parentNode))
//         if (issecondmove) {
//             if (getCheckedFile().indexOf(ev.target.parentNode) > -1) {
//                 moveItemFun(ev)
//             } else {
//                 _targetNode(ev.target, 'file-item', function (ele) {
//                     console.log(ele, 'paen')
//                     if (ele) {
//                         if (getCheckedFile().indexOf(ele) > -1) {
//                             moveItemFun(ev)
//                         } else {
//                             issecondmove = false;
//                             moveSelect()
//                         }
//                     } else {
//                         issecondmove = false;
//                         moveSelect()
//                     }
//                 })
//             }
//         } else {
//             moveSelect()
//         }
//         // moveselect()

//         fileItem = tools.$('.file-item', fileList);
//         allCheckbox = tools.$('.checkbox', fileList);

//         function moveSelect() {
//             if (Math.abs(ev.clientX - disX) > 20 || Math.abs(ev.clientY - disY) > 20) {
//                 // 只生成一个div
//                 if (!newDiv) {
//                     newDiv = document.createElement('div');
//                     document.body.appendChild(newDiv);
//                     newDiv.className = 'select-box';
//                 }
//                 console.log(newDiv, 'hi')
//                 newDiv.style.display = 'block';
//                 newDiv.style.width = Math.abs(ev.clientX - disX) + 'px';
//                 newDiv.style.height = Math.abs(ev.clientY - disY) + 'px';
//                 newDiv.style.left = Math.min(ev.clientX + 2, disX - 2) + 'px';
//                 newDiv.style.top = Math.min(ev.clientY + 2, disY - 2) + 'px';

//                 // 拖选框碰撞检测，如果碰上文件，就勾选文件
//                 tools.each(fileItem, function (item, index) {
//                     if (tools.collisionRect(newDiv, item)) {
//                         tools.addClass(item, 'file-checked');
//                         tools.addClass(allCheckbox[index], 'checked');
//                     } else {
//                         tools.removeClass(item, 'file-checked');
//                         tools.removeClass(allCheckbox[index], 'checked');
//                     }
//                 });

//                 // 如果全部选中，勾选全选按钮
//                 if (getCheckedFile().length == allCheckbox.length) {
//                     tools.addClass(checkedAll, 'checked');
//                 } else {
//                     tools.removeClass(checkedAll, 'checked');
//                 }
//             } else {
//                 if (newDiv) {
//                     newDiv.style.display = 'none';
//                 }
//             }
//         }

//     }
//     // 鼠标抬起
//     function mouseUp(ev) {
//         tools.removeEvent(document, 'mousemove', mouseMove);
//         tools.removeEvent(document, 'mouseup', mouseUp);
//         if (newDiv) {
//             newDiv.style.display = 'none';
//         }
//         // moveItem = getCheckedFile();
//         issecondmove = !issecondmove;
//         if (newDiv2) {
//             issecondmove = true;
//             $(newDiv2).remove()
//             newDiv2 = null;
//             finallyMove(ev);
//         } else {
//             console.log(moveItem)
//             if (!newDiv) {
//                 //点击空白地方清除选中
//                 var pClassName = ev.target.parentNode.className;
//                 if (pClassName == 'nav' || pClassName == 'file-show' || pClassName == 'content clearfix') {
//                     tools.each(fileItem, function (item, index) {
//                         tools.removeClass(item, 'file-checked');
//                         tools.removeClass(allCheckbox[index], 'checked');
//                     })
//                     tools.removeClass(checkedAll, 'checked');
//                     issecondmove = false;
//                 }
//             } else {
//                 $(newDiv).remove();
//                 newDiv = null;
//             }
//         }
//     }

//     //最后移动到目录树进行移动
//     function finallyMove(ev) {
//         // console.log(ev.target.id.split('_'))
//         if (ev.target.id.indexOf('tree-menu') > -1) {
//             var idArr = ev.target.id.split('_');
//             var idStr = idArr[0] + '_' + idArr[1];
//             var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
//             var treeNode = treeObj.getNodeByParam('tId', idStr, null);
//             if (treeNode) {
//                 assignFid = treeNode.id;
//                 assignTreePath = treeNode.treePath;
//                 assignU_path = treeNode.u_path;
//                 assignPath = treeNode.path;
//                 movesubmit()
//             }


//         }


//     }

//     function _targetNode(target, name, callback) {
//         var callback = callback;
//         var eleName = $(target).parent()[0]
//         if (eleName.nodeName == 'BODY') {
//             callback(false)
//         } else if (eleName.className.indexOf(name) > -1) {
//             callback(eleName)
//         } else {
//             _targetNode(eleName, name, callback)
//         }
//     }








//     /* 新建文件 */

//     var create = tools.$('.create')[0];
//     // tools.addEvent(create, 'mouseup', function () {

//     // })
//     $('.create').on('click', function () {
//         // if(!isfinish){
//         $('.create_file').toggleClass('act')
//         // }

//     })

//     $(document).on('mousedown', function () {
//         if ($('.create_file').hasClass('act')) {
//             $('.create_file').toggleClass('act')
//         }
//     })

//     var fileType;
//     $('#folder1').on('mousedown', function (ev) {
//         // console.log(ev.target);
//         ev.stopPropagation();
//         $('.create_file').toggleClass('act');
//         fileType = 1;
//         createDoc(1)
//     })
//     $('#folder2').on('mousedown', function (ev) {
//         // console.log(ev.target)
//         ev.stopPropagation();
//         $('.create_file').toggleClass('act');
//         fileType = 2;
//         createDoc(2)
//     })
//     $('#folder3').on('mousedown', function (ev) {
//         // console.log(ev.target)
//         ev.stopPropagation();
//         $('.create_file').toggleClass('act');
//         fileType = 4;
//         createDoc(4)
//     })

//     function createDoc(type) {
//         empty.style.display = 'none';
//         var firstElement = fileList.firstElementChild;
//         var newElement = createFileElement({
//             title: '',
//             id: new Date().getTime(),
//             type: type,
//             name: ''


//         })
//         fileList.insertBefore(newElement, firstElement);
//         var fileTitle = $('.file-title', newElement);
//         var ftext = '';
//         var fileEditorHtml = `<span class="file-edtor"> <input type="text" value="${ftext}" class="edtor" autofocus="autofocus"></span>`
//         fileTitle.css('display', 'none');
//         fileTitle.parent().append(fileEditorHtml);
//         var editor = $('.edtor', newElement);
//         editor.focus();
//         $('.file-edtor', newElement).on('mousedown', function (ev) {
//             ev.stopPropagation();//阻止拖拽事件发生
//         })
//         $(editor).on('keyup', function (e) {
//             // console.log(e.keyCode)
//             if (e.keyCode == 13) {
//                 createFile()
//             }
//         })
//         // $('input.',)
//         create.isCreateFile = true;// 添加一个状态，表示正在创建文件
//         // 给document添加mousedown事件，鼠标在其他地方点击时，确定创建文件
//         tools.addEvent(document, 'mousedown', createFile)
//     }

//     function createFile(ev) {
//         // debugger;
//         createOperate('新建')
//         if (create.isCreateFile) {
//             var firstElement = fileList.firstElementChild;
//             var edtor = tools.$('.edtor', firstElement)[0];
//             var value = edtor.value.trim();

//             // 没有输入文件名。则创建不成功
//             if (value === '') {
//                 fileList.removeChild(firstElement);
//                 if (fileList.innerHTML === '') {
//                     empty.style.display = 'block';
//                 }
//             } else {
//                 // 输入框有内容时，文件创建成功时
//                 var fileTitle = tools.$('.file-title', firstElement)[0];
//                 // var fileEdtor = tools.$('.file-edtor', firstElement)[0];
//                 var fileEdtor = $('.file-edtor', firstElement);
//                 console.log(firstElement)

//                 // 显示文件名，隐藏输入框
//                 fileTitle.style.display = 'block';
//                 // fileEdtor.style.display = 'none';
//                 fileTitle.innerHTML = value;
//                 fileEdtor.remove();
//                 var create_json = {
//                     createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                     pid: contentfileId,
//                     name: value,
//                     type: fileType,
//                     u_path: u_path,
//                     // uid: $.cookie('uid')
//                 };
//                 local_api._create('document', create_json, $.cookie('appkey'), function (res) {
//                     var _tree_path = tree_path + ',' + res.id
//                     local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (res) {
//                         treeData(pid)
//                         if (fileType == 2) {
//                             showTips('ok', '新建案卷成功!');
//                         } else if (fileType == 1) {
//                             showTips('ok', '新建分类成功!');
//                         } else if (fileType == 4) {
//                             showTips('ok', '新建组成功!');
//                         }

//                     })
//                 })
//             }
//             //无论创建成不成功，状态都要设为false
//             create.isCreateFile = false;
//             tools.removeEvent(document, 'mousedown', createFile)
//         }
//     }




//     /* 重命名 */
//     // 需要完善
//     var rename = tools.$('.rename')[0];
//     var isrename = false;
//     tools.addEvent(rename, 'mouseup', function () {
//         fileItem = tools.$('.file-item', fileList);
//         allCheckbox = tools.$('.checkbox', fileList);
//         createOperate('重命名')
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文件！');
//             return;
//         } else if (getCheckedFile().length > 1) {
//             showTips('err', '只能对单个文件重命名！');
//             return;
//         } else {
//             var fileTitle = $('.file-checked .file-title');
//             var upId = $('.file-checked .item').data().fileId;
//             var uptree_path = $('.file-checked .item').data().tree_path;
//             var uptype = $('.file-checked .item').data().type;
//             console.log($('.file-checked .item').data())
//             if ($('.file-checked .item').data().type == 0) {
//                 showTips('err', '无法对客户文件夹进行重命名!');
//                 return;
//             }
//             isrename = true;
//             var text = fileTitle.attr('title');
//             var fileEditorHtml = `<span class="file-edtor"> <input type="text" value="${text}" class="edtor"></span>`
//             fileTitle.css('display', 'none');
//             // console.log(upId)
//             fileTitle.parent().append(fileEditorHtml);
//             var editor = $('.file-checked .edtor');
//             var fileEdtor = $('.file-checked .file-edtor')[0];
//             editor.select();
//             $('.file-checked .file-edtor').on('mousedown', function (ev) {
//                 ev.stopPropagation();//阻止拖拽事件发生
//             })

//             editor.on('keypress', function (e) {
//                 if (e.keyCode == 13) {
//                     changeFun()
//                 }
//             })


//             function changeFun(ev) {
//                 ev.stopPropagation();
//                 ev.preventDefault()
//                 if (ev) {
//                     if (ev.target.parentNode == fileEdtor) {
//                         return;
//                     }
//                 }

//                 // console.log(1)
//                 var value = editor.val().trim();
//                 if (value == '') {
//                     showTips('err', '请输入文件名！');
//                     // console.log()
//                 } else {
//                     // debugger;
//                     var path = doc_path(uptree_path);
//                     var oldPath, newPath;
//                     if (uptype == 3) {
//                         oldPath = path + text;
//                         newPath = path + value;
//                     } else {
//                         oldPath = path
//                         newPath = path.slice(0, path.lastIndexOf(text)) + value
//                     }
//                     console.log(path)
//                     var handle_json = {
//                         type: 1,
//                         oldPath: oldPath,
//                         newPath: newPath
//                     }
//                     local_api._rename(handle_json, $.cookie('appkey'), function (han) {
//                         console.log(han)
//                         setTimeout(() => isrename = false, 2000)
//                         if (han.status == 0) {
//                             local_api._update('document', { id: upId }, { name: value }, $.cookie('appkey'), function (res) {
//                                 if (res.status == 0) {
//                                     showTips('ok', '重命名成功')
//                                     treeData(pid);

//                                 }
//                             })
//                         } else {
//                             showTips('err', han.message)
//                             treeData(pid)
//                         }
//                     })

//                 }
//                 tools.removeEvent(document, 'mousedown', changeFun)
//             }
//             tools.addEvent(document, 'mousedown', changeFun)
//         }
//     })






//     //左侧菜单
//     tools.addEvent(tools.$('.nav-box')[0], 'click', function (ev) {
//         // console.log(ev)
//         // ev.stopPropagation();
//         console.log(tools.getTarget(ev));
//         console.log(tools.getTarget(ev).parentNode);
//         if (tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list')) {
//             tools.each(tools.$('.nav-list.nav-current'), function (ele) {
//                 console.log(ele.className)
//                 tools.removeClass(ele, 'nav-current')
//             });
//             tools.addClass(tools.getTarget(ev).parentNode, 'nav-current')
//         }
//         console.log(tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list'))

//     })
//     tools.addEvent(tools.$('#search')[0], 'focus', function () {
//         var searchBar = tools.$('#_search_bar')[0];
//         tools.addClass(searchBar, 'focus')
//     })
//     tools.addEvent(tools.$('#search')[0], 'blur', function () {
//         var searchBar = tools.$('#_search_bar')[0];
//         setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)

//     })

//     //检索
//     $('#search').on('keypress', function (e) {
//         createOperate('文件检索')
//         if (e.keyCode == 13) {
//             e.target.value.trim() != '' ? location.href = '/hightSearch?query=' + e.target.value.trim() : null
//         }
//     })

//     //文件上传
//     var isupload = false
//     $('.upload').on('click', function (ev) {
//         ev.stopPropagation();
//         uploadFiles()
//     })
//     //文件上传
//     $('.upload-file').on('click', function (ev) {
//         ev.stopPropagation();
//         // console.log(ev.target.parentNode)
//         var pNode = ev.target.parentNode;
//         var ppNode = ev.target.parentNode.parentNode;
//         var cNode = $('.upload-file').children().children();
//         if (pNode == cNode[0] || ppNode == cNode[0]) {
//             // console.log(1)
//             uploadFiles()
//         }
//         // if (pNode == cNode[1] || ppNode == cNode[1]) {
//         //     console.log(2)
//         // }
//     })
//     var tree_address = '';
//     //文件上传
//     function uploadFiles() {
//         createOperate('文件上传')
//         var input = document.createElement('input');
//         input.type = 'file';
//         input.multiple = "multiple"
//         // input.onclick = function (e) {
//         //     console.log(e)
//         // }
//         $(input).change(function (ev) {
//             console.log(this.files)
//             var fileList = this.files;
//             var fileIndex = uploadFileArr.length + 0;
//             $('.mod-tasks .tasks-header').removeClass('result-succt').addClass('tasking-nor')
//             // debugger;
//             // console.log()
//             var tArr = tree_path.split(',');
//             var uploadPathArr = dataControl.getParents(docDatas, tArr[tArr.length - 1]).reverse()
//             var uploadPath = '';
//             uploadPathArr.forEach(ele => {
//                 uploadPath += ele.name + '/'
//             })
//             tree_address = uploadPath

//             Array.prototype.forEach.call(fileList, function (file, index) {
//                 console.log(file)
//                 $('.mod-tasks').show();
//                 var newLi = uploadHtml(0, file, fileIndex + index);
//                 liClick(newLi)
//                 uploadLiArr.push(newLi);
//                 uploadFileArr.push(file);
//                 taskUl.append(newLi);
//             })

//             function liClick(li) {
//                 $(li).on('click', function (e) {
//                     console.log(e);
//                     var _thisIndex = e.currentTarget.dataset.file_id;
//                     console.log(_thisIndex)
//                     if ($(e.currentTarget).hasClass('waiting')) {
//                         if ($(e.target).hasClass('btn-icon')) {
//                             cancalIndexArr.push(parseInt(_thisIndex));
//                             replaceLiHtml(3, _thisIndex)
//                         }
//                     }

//                     if ($(e.currentTarget).hasClass('cancel')) {
//                         if ($(e.target).hasClass('btn-icon')) {

//                         }
//                     }
//                 })
//             }

//             function replaceLiHtml(type, index) {
//                 var file = uploadFileArr[index]
//                 var replaceLi = uploadHtml(type, file, index);
//                 liClick(replaceLi)
//                 $(uploadLiArr[index], taskUl).replaceWith(replaceLi);
//                 uploadLiArr.splice(index, 1, replaceLi)
//             }

//             function isFileExist() {
//                 var file = uploadFileArr[fileIndex]
//                 if (cancalIndexArr.indexOf(fileIndex) > -1) {
//                     fileIndex++;
//                     isFileExist();
//                     return;
//                 }

//                 // console.log(uploadFileArr.length == fileIndex)
//                 if (uploadFileArr.length == fileIndex) {//最后
//                     $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ')
//                     $('.mod-tasks .summary-wrapper .txt').text(`任务已完成`)
//                 } else {
//                     var scaleXVal = (fileIndex / uploadFileArr.length).toFixed(1)
//                     // $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ')
//                     $('.mod-tasks .summary-wrapper .before').css('transform', `scaleX(${scaleXVal})`)
//                     $('.mod-tasks .summary-wrapper .txt').text(`${fileIndex}/${uploadFileArr.length}项任务进行中`)
//                 }
//                 // if(uploadFileArr.length == fileIndex)
//                 if (file) {
//                     start(file, fileIndex, function (res) {
//                         console.log($(uploadLiArr[fileIndex], taskUl), fileIndex, '22')
//                         if (res.id) {
//                             replaceLiHtml(1, fileIndex) //成功
//                         } else {
//                             replaceLiHtml(2, fileIndex) //失败
//                         }
//                         fileIndex++;
//                         if (!res.name) {
//                             // renderFilesPathTree(contentfileId)
//                             treeData(pid)
//                         }
//                         isFileExist()
//                     })
//                 }
//             }
//             isFileExist()

//             function start(file, index, callback) {
//                 get_filemd5sum(file, function (res) {

//                     var filename = file.name;
//                     function createDocAndZu(filname, callback) {
//                         var first_i = filename.indexOf('【');
//                         var last_i = filename.indexOf('】');

//                         if (first_i > -1 && last_i > 0) {
//                             var first_name = filename.slice(first_i + 1, last_i);
//                             var last_name = filename.slice(last_i + 1, filename.length)
//                             var first_name_arr = first_name.split('_');
//                             var searchObj = { did: first_name_arr[0], name: first_name_arr[0] + first_name_arr[1], tree_path: '^' + tree_path, pid: contentfileId };
//                             // debugger;
//                             // return;
//                             local_api._get('document', searchObj, '', $.cookie('appkey'), function (existobj) {
//                                 if (existobj.status == 0 && existobj.data) {//存在案卷
//                                     if (first_name_arr[2]) { //组别
//                                         var searchObj = { name: first_name_arr[2], tree_path: '^' + existobj.data.tree_path, pid: existobj.data.id };
//                                         local_api._get('document', searchObj, '', $.cookie('appkey'), function (zobj) {
//                                             if (zobj.data) { //在案卷组别上传
//                                                 callback(Object.assign(zobj.data, { last_name: last_name }))
//                                             } else { //创建组别
//                                                 var create_json = {
//                                                     name: first_name_arr[2],
//                                                     type: 4,
//                                                     createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                                                     pid: existobj.data.id,
//                                                     u_path: u_path,
//                                                 }
//                                                 local_api._create('document', create_json, $.cookie('appkey'), function (res) {
//                                                     var _tree_path = existobj.data.tree_path + ',' + res.id;
//                                                     var cres = { id: res.id, tree_path: _tree_path, last_name: last_name }
//                                                     local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                                                         callback(cres)
//                                                     })
//                                                 })
//                                             }
//                                         })
//                                     } else {//在案卷中上传
//                                         callback(Object.assign(existobj.data, { last_name: last_name }))
//                                     }
//                                 } else { //创建案卷
//                                     var create_json = {
//                                         name: first_name_arr[0] + first_name_arr[1],
//                                         did: first_name_arr[0],
//                                         type: 2,
//                                         createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                                         pid: contentfileId,
//                                         u_path: u_path,
//                                     }
//                                     local_api._create('document', create_json, $.cookie('appkey'), function (res) {
//                                         var _tree_path = tree_path + ',' + res.id;
//                                         var dcres = { id: res.id, tree_path: _tree_path, last_name: last_name }
//                                         local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                                             // callback(cres)

//                                             if (first_name_arr[2]) { //组别
//                                                 //创建组别
//                                                 var create_json = {
//                                                     name: first_name_arr[2],
//                                                     type: 4,
//                                                     createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                                                     pid: dcres.id,
//                                                     u_path: u_path,
//                                                 }
//                                                 local_api._create('document', create_json, $.cookie('appkey'), function (res) {
//                                                     var _tree_path = dcres.tree_path + ',' + res.id;
//                                                     var cres = { id: res.id, tree_path: _tree_path, last_name: last_name }
//                                                     local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                                                         callback(cres)
//                                                     })
//                                                 })

//                                             }

//                                         })
//                                     })
//                                 }
//                             })
//                         } else {
//                             var cres = { id: contentfileId, tree_path: tree_path, last_name: filename }
//                             callback(cres)
//                         }

//                     }

//                     createDocAndZu(filename, function (creaobj) {
//                         parentAllData(function () {
//                             var firstname = '', lastname = creaobj.last_name, finame = '';
//                             var i = 0;
//                             if (lastname.lastIndexOf('.') > -1) {
//                                 firstname = lastname.slice(0, lastname.lastIndexOf('.'))
//                                 finame = lastname.slice(lastname.lastIndexOf('.'))
//                             } else {
//                                 firstname = lastname;
//                                 finame = ''
//                             }
//                             var fmd5 = res;
//                             if (fmd5 != -1) {
//                                 loadGet()//重命名
//                                 function loadGet() {
//                                     i++;
//                                     var query_json = {
//                                         name: lastname,
//                                         tree_path: '^' + creaobj.tree_path,
//                                         type: 3,
//                                     }
//                                     local_api._get('document', query_json, '', $.cookie('appkey'), function (getr) {
//                                         if (getr.status == 0 && getr.data) {
//                                             // var _tree_path = getr.data.tree_path.slice(0, getr.data.tree_path.lastIndexOf(','));
//                                             if (getr.data.f_md5 == fmd5) { //同名同内容
//                                                 // if (_tree_path != creaobj.tree_path) { //不同文件夹
//                                                 //     creaobj.last_name = lastname
//                                                 //     renameSucc(creaobj, fmd5, file, callback)
//                                                 // } else {
//                                                 callback(getr.data)
//                                                 // }
//                                             } else { //同名不同内容
//                                                 lastname = firstname + '(' + i + ')' + finame;
//                                                 loadGet()
//                                             }
//                                         } else if (getr.status == 0 && !getr.data) { //不同名
//                                             creaobj.last_name = lastname
//                                             renameSucc(creaobj, fmd5, file, callback)
//                                         }
//                                     })
//                                 }
//                             }
//                         })//获取alldata

//                     })
//                 })
//             }
//             //重命名上传
//             function renameSucc(creaobj, fmd5, file, callback) {
//                 var formData = new FormData();
//                 formData.append(creaobj.last_name, file);
//                 var url = '/upload?path=' + encodeURI(doc_path(creaobj.tree_path))
//                 var xhr = http({
//                     type: 'POST',
//                     url: url,
//                     data: formData,
//                     onProgress: function (event) {
//                         console.log(event.percent);
//                         console.log($(uploadLiArr[fileIndex]), fileIndex, '23')
//                     },
//                     onSuccess: function (data) {
//                         console.log(data)
//                         data.fmd5 = fmd5;
//                         if (data.status == 0) {
//                             uploadSuccess(data, creaobj, function (res) {
//                                 callback(res)
//                             })
//                         } else {
//                             callback(data)
//                         }
//                     },
//                     onError: function (err) {
//                         callback(res)
//                     }
//                 })
//                 // console.log()
//             }

//             // 上传成功
//             function uploadSuccess(data, creaobj, callback) {
//                 var query_json = {
//                     pid: creaobj.id,
//                     size: data.file.size,
//                     type: 3,
//                     name: data.file.filename
//                 }
//                 local_api._get('document', query_json, '', $.cookie('appkey'), function (getres) {
//                     if (getres.status == 0 && !getres.data) {
//                         var filetype = data.file.mimetype.indexOf('image') > -1 ? 'png' : 'txt';
//                         var create_json = {
//                             size: data.file.size,
//                             createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                             pid: creaobj.id,
//                             type: 3,
//                             filetype: filetype,
//                             name: data.file.filename,
//                             path: '/upload/' + doc_path(creaobj.tree_path) + data.file.filename,
//                             f_md5: data.fmd5,
//                             u_path: u_path,
//                             ispass: 1,
//                             islock: 1
//                         }
//                         local_api._create('document', create_json, $.cookie('appkey'), function (res) {
//                             var _tree_path = creaobj.tree_path + ',' + res.id;
//                             var cres = { id: res.id, tree_path: _tree_path }
//                             local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                                 callback(cres)
//                             })
//                         })
//                     } else if (getres.status == 0 && getres.data) {
//                         var cres = { id: getres.data.id, tree_path: getres.data.tree_path };
//                         callback(cres)
//                     }
//                 })
//             }
//             // 当上传的数据为 file 类型时，请求的格式类型自动会变为 multipart/form-data, 如果头部格式有特定需求，在我的 http 函数中传入 headers<Object> 即可，大家可自己查看，我这里没有什么特殊处理所以就不传了
//         })
//         input.click();
//     }



//     //删除文件
//     $('.delete').on('click', function (ev) {
//         console.log(getCheckedFile())
//         var selectData = getCheckedFile();
//         if (!getCheckedFile().length) {
//             showTips('err', '请选择文件或档案！');
//             return;
//         }
//         var treeArr = [];
//         var nodelete = [];
//         var typeobj = {};
//         var typeArr = [];
//         var deleteObj = [];
//         selectData.forEach(ele => {
//             // treeArr.push('^' + $('.item', ele).data().tree_path);
//             var type = $('.item', ele).data().type;
//             var dobj = {};
//             if (type != 0) {
//                 treeArr.push('^' + $('.item', ele).data().tree_path);
//                 if (type == 3) {
//                     dobj.tree_path = '^' + $('.item', ele).data().tree_path;
//                     dobj.path = $('.item', ele).data().filepath
//                 } else {
//                     dobj.tree_path = '^' + $('.item', ele).data().tree_path;
//                     dobj.path = doc_path($('.item', ele).data().tree_path)
//                 }
//                 deleteObj.push(dobj)
//             } else {
//                 nodelete.push('^' + $('.item', ele).data().tree_path)
//             }

//             // if(deleteObj)
//             if (!typeobj[type]) {
//                 typeobj[type] = 1;
//                 var typeStr = type == 1 ? '分类' : type == 2 ? '案卷' : type == 3 ? '文件' : '';
//                 typeArr.push(typeStr)
//             }

//         })
//         debugger
//         createOperate('文件删除')
//         console.log(deleteObj)
//         if (nodelete.length > 0) {
//             showTips('err', '无法对客户文件夹进行删除操作')
//             // return false
//         }
//         // typeobj
//         var confirmStr = `确定要删除${selectData.length > 1 ? '这些' : '这个'}${typeArr.join('/')}？`
//         if (treeArr.length) {
//             if (confirm(confirmStr)) {
//                 // console.log(treeArr)
//                 deleteObj.forEach((ele, i) => {
//                     local_api._fsDelete({ curPath: ele.path }, $.cookie('appkey'), function (res) {
//                         if (res.status == 0) {
//                             local_api._delete('document', { tree_path: ele.tree_path }, $.cookie('appkey'), function (dres) {
//                                 if (i == deleteObj.length - 1) {
//                                     treeData(pid)
//                                     showTips('ok', `删除${typeArr.join('/')}成功!`);
//                                 }
//                             })
//                         }
//                     })
//                 })
//             }
//         }

//     })

//     $('.logout').on('mousedown', function (ev) {
//         ev.stopPropagation()
//         // console.log(1)
//         location.href = '/logout'
//     })


//     $('#showList').click(function () {
//         $('.mod-tasks').toggleClass('expand')
//     })

//     //隐藏上传进度条
//     $('#hideList').click(function () {
//         $('.mod-tasks').hide();
//         uploadLiArr = [];
//         uploadFileArr = [];
//         taskUl.empty();
//         fileIndex = 0;
//     })


//     //合并
//     $('#divCombind').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         buttons: {
//             "确定": function () {
//                 combindSubmit()
//             },
//             "取消": function () {
//                 $('#divCombind').dialog("close");
//             }
//         }
//     })
//     $('#combind').on('click', function () {
//         $('#divCombind').dialog("open");
//     })

//     function combindSubmit() {
//         // console.log(getCheckedFile())
//         var obj = {
//             handle_json: { input: {}, output: '' },
//             update: { path: '', name: '', size: '' },
//             query: { id: '' },
//             delete_j: { id: '' }
//         };
//         var objData = [];
//         var pdfData = getCheckedFile();
//         if (pdfData.length) {
//             pdfData.forEach((ele) => {
//                 var dataSet = $('.item', ele).data();
//                 dataSet.name = $('.item .file-title', ele).text();
//                 // console.log($('.item ul>li:nth-child(1)',ele).text())
//                 dataSet.size = backFileSize($('.item ul>li:nth-child(1)', ele).text())
//                 objData.push(dataSet)
//             })
//         } else {
//             showTips('err', '请选择pdf文件进行合并！')
//         }
//         if (!objData.length) {
//             showTips('err', '请选择pdf文件进行合并！');
//             return;
//         }
//         var _size = 0;
//         var deleteArrId = [];
//         objData.forEach((ele, i) => {
//             _size += ele.size
//             obj.handle_json.input[i] = doc_path(ele.tree_path) + ele.name;
//             if (i == 0) {
//                 obj.query['id'] = ele.fileId;
//                 obj.update['name'] = $('#renameCombind').val().trim() + '.pdf';
//                 obj.update['path'] = '/upload/' + doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf'
//                 obj.handle_json.output = doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf'
//             } else {
//                 deleteArrId.push(ele.fileId)
//             }
//         })
//         obj.delete_j['id'] = deleteArrId.join('|');
//         obj.update['size'] = _size;

//         createOperate('合并文件')
//         if (confirm('确定合并已选择的文件')) {
//             local_api._fsCombind(obj.handle_json, $.cookie('appkey'), function (res) {
//                 if (res.status == 0) {
//                     local_api._update('document', obj.query, obj.update, $.cookie('appkey'), function (res) {
//                         local_api._delete('document', obj.delete_j, $.cookie('appkey'), function (res) {
//                             showTips('ok', '合并成功!');
//                             $('#divCombind').dialog("close");
//                             renderFilesPathTree(contentfileId);
//                         })
//                     })
//                 } else {
//                     showTips('err', '合并失败!');
//                     $('#divCombind').dialog("close");
//                 }
//             })
//         } else {
//             $('#divCombind').dialog("close");
//         }

//     }



//     $('#divDocSort').dialog({
//         width: 400,
//         maxHeight: 400,
//         autoOpen: false,
//         buttons: {
//             "确定": function () {
//                 sortSubmit()
//             },
//             "取消": function () {
//                 $('#divDocSort').dialog("close");
//             }
//         }
//     })

//     //排序
//     $('#sort').on('click', function () {
//         // console.log('排序')
//         changeSort()
//         $('#divDocSort').dialog("open");
//     })

//     function sortSubmit() {
//         treeData(pid)
//         $('#divDocSort').dialog("close");
//     }


//     function changeSort() {
//         var sortArr = sortString.split('|');
//         sortArr.forEach(ele => {
//             var _ele = ele;
//             if (ele.indexOf('-') > -1) { //倒序
//                 _ele = ele.slice(1, ele.length)
//             }
//             var id = '__' + _ele;
//             $(`#${id}`).prop('checked', true)
//             var text
//             if (ele.indexOf('-') > -1) { //倒序
//                 text = $('label', $(`#${id}`).parent()).attr('value') + '↑'
//             } else {
//                 text = $('label', $(`#${id}`).parent()).attr('value') + '↓'
//             }
//             $('label', $(`#${id}`).parent()).text(text)
//         })

//         var nocheck = $("#divDocSort input:not(:checked) ").not('input[name="sort"]')
//         var sortValue = $("#divDocSort input:radio:checked").val();
//         nocheck.each((i, ele) => {
//             var text
//             if (sortValue == 2) {
//                 text = $('label', $(ele).parent()).attr('value') + '↓'
//             } else if (sortValue == 1) {
//                 text = $('label', $(ele).parent()).attr('value') + '↑'
//             }
//             $('label', $(ele).parent()).text(text)
//         })
//     }
//     $('#divDocSort input').change(function () {
//         // console.log(1)
//         var sortArr = sortString.split('|');
//         var sortValue = $("#divDocSort input:radio:checked").val();
//         if ($(this).attr('name') !== 'sort') {
//             if ($(this).attr('checked')) { //选中
//                 if (sortValue == 2) {
//                     sortArr.push($(this).val())
//                 } else if (sortValue == 1) {
//                     sortArr.push('-' + $(this).val())
//                 }
//             } else { //移除
//                 var index = sortArr.indexOf($(this).val()) > -1 ? sortArr.indexOf($(this).val()) : sortArr.indexOf('-' + $(this).val())
//                 console.log(index)
//                 sortArr.splice(index, 1)
//             }
//         }
//         sortString = sortArr.join('|')
//         console.log(sortArr, sortString, 'dd')
//         changeSort()
//     })



//     //导入
//     $('#export').click(function () {
//         var input = document.createElement('input');
//         input.type = 'file';
//         $(input).change(function (e) {
//             // console.log(e)
//             var files = $(this)[0].files;
//             oneExc(files)
//         })
//         input.click();
//     })

//     $('#exportPorp').click(function () {
//         var input = document.createElement('input');
//         input.type = 'file';
//         $(input).change(function (e) {
//             // console.log(e)
//             var files = $(this)[0].files;
//             // oneExc(files)
//         })
//         input.click();
//     })

//     var oneExc = function (files) {
//         createOperate('导入台账')
//         var reader = new FileReader();
//         reader.readAsBinaryString(files[0]);
//         reader.onload = function (evt) {
//             var data = evt.target.result;
//             var wb = XLSX.read(data, {
//                 type: 'binary'
//             });
//             // console.log(wb)

//             // console.log(wb.Sheets, wb['SheetNames'])


//             var SheetNamesArr = wb['SheetNames'];
//             var importobj = {};
//             // if (SheetNamesArr.length > 1) {
//             var filterData = docDatas.filter(ele => ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1);
//             SheetNamesArr.forEach((ele, i) => {
//                 filterData.forEach(fil => {
//                     if (ele.trim() == fil.name) {
//                         console.log(fil)
//                         importobj[ele] = {
//                             'tree_path': fil.tree_path,
//                             'id': fil.id,
//                             createArr: [],
//                             createDoc: []
//                         };
//                     }
//                 })
//             })
//             // console.log(importobj)
//             // } else {

//             // }

//             // importobj
//             for (var o in importobj) {
//                 // if(o == '兴围社区'){
//                 // var d = getimportData(o, importobj[o].id, importobj[o].tree_path);
//                 // }
//                 // updateData(o, importobj[o].id, importobj[o].tree_path)
//                 // importobj[o].createArr = d.createArr;
//                 // importobj[o].createDoc = d.createDoc;

//             }
//             console.log(importobj)

//             function updateData(name, id, i_tree_path) {
//                 var xlsData = wb.Sheets[name];
//                 var xlsDataLength = getIndex(xlsData['!ref']);

//                 var letter = [];
//                 for (var x in xlsData) {
//                     var _x = x.split('');
//                     var strArr = []
//                     _x.forEach(ele => {
//                         /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
//                     })
//                     if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
//                         letter.push(strArr.join(''));
//                 }

//                 var createArr = [];
//                 var createDoc = [];
//                 var colums = ['did', 'name', '位置']
//                 for (var i = 5; i < xlsDataLength + 1; i++) {
//                     var obj = { u_path: u_path };
//                     var create_json = {
//                         createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                         pid: id,
//                         type: 2,
//                         u_path: u_path
//                     };
//                     letter.forEach(ele => {
//                         if (xlsData[ele + i]) {
//                             var propName = xlsData[ele + 3] ? xlsData[ele + 3].v : xlsData[ele + 4] ? xlsData[ele + 4].v : '';
//                             switch (propName) {
//                                 case '建档时间': propName = 'createdAt';
//                                     break;
//                                 case '保管期限': propName = 'saveExpireIn';
//                                     break;
//                                 case '页数': propName = 'page';
//                                     break;
//                                 case '文书份数': propName = 'num';
//                                     break;
//                                 case '企业名称': propName = 'name';
//                                     break;
//                                 case '档号': propName = 'did';
//                                     break;
//                                 case '档案编号': propName = 'did';
//                                     break;

//                             }
//                             if (propName == 'name') {
//                                 create_json.name = xlsData[ele + i].v
//                             }
//                             if (propName == 'did') {
//                                 create_json.did = xlsData[ele + i].v
//                             }
//                             if (colums.indexOf(propName) > -1) {
//                                 if (propName == '位置') {
//                                     var pStr = xlsData[ele + i].v;
//                                     var pStrArr = pStr.split('_');
//                                     if (pStrArr.length == 6) {
//                                         obj['qnum'] = pStrArr[0];
//                                         obj['lnum'] = pStrArr[1]
//                                         obj['ce'] = pStrArr[2]
//                                         obj['jnum'] = pStrArr[3]
//                                         obj['cnum'] = pStrArr[4]
//                                         obj['bnum'] = pStrArr[5]
//                                     }
//                                     // obj[propName] = xlsData[ele + i].v
//                                 } else {
//                                     obj[propName] = xlsData[ele + i].v
//                                 }
//                             }
//                         }
//                     });
//                     obj.name ? createDoc.push(create_json) : ''
//                     obj.name ? createArr.push(obj) : ''
//                 }
//                 console.log(createDoc, createArr)
//                 var _thisCreateDoc = docDatas.filter(ele => ele.type == 2 && ele.tree_path.indexOf(i_tree_path) > -1);
//                 console.log(_thisCreateDoc)
//                 createArr.forEach(ele => {
//                     _thisCreateDoc.forEach(_ele => {
//                         if (ele.did == _ele.did) {
//                             console.log(ele, _ele)
//                             var handle_json = {
//                                 type: 1,
//                                 oldPath: doc_path(_ele.tree_path).slice(0, -1),
//                                 newPath: doc_path(i_tree_path) + ele.did + ele.name
//                             }
//                             console.log(handle_json)
//                             // local_api._rename(handle_json, $.cookie('appkey'), function (han) {
//                             // console.log(han.status)
//                             // if (han.status == 0) {
//                             // local_api._update('document', { id: _ele.id }, { name: ele.did + ele.name }, $.cookie('appkey'), function (res) {
//                             //     console.log(res)
//                             // })
//                             // }
//                             // })
//                             // local_api._update('docProp', { did: ele.did }, ele, $.cookie('appkey'), function (res) {
//                             //     console.log(res)
//                             // })
//                         }
//                     })
//                 })
//                 // createDoc.forEach((ele, i) => {
//                 //     local_api._create('document', ele, $.cookie('appkey'), function (res) {
//                 //         var _tree_path = i_tree_path + ',' + res.id;
//                 //         var fid = res.id;
//                 //         local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                 //             var docJson = createArr[i];
//                 //             docJson.fid = fid;
//                 //             local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
//                 //                 if (i == createDoc.length - 1) {
//                 //                     treeData(pid)
//                 //                     showTips('ok', '导入' + name + '成功')
//                 //                 }
//                 //             })
//                 //         })
//                 //     })
//                 // })
//                 return { createDoc, createArr }
//             }

//             function getimportData(name, id, i_tree_path) {

//                 var xlsData = wb.Sheets[name];
//                 var xlsDataLength = getIndex(xlsData['!ref']);

//                 var letter = [];
//                 for (var x in xlsData) {
//                     var _x = x.split('');
//                     var strArr = []
//                     _x.forEach(ele => {
//                         /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
//                     })
//                     if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
//                         letter.push(strArr.join(''));
//                 }


//                 // var letter1 = ["B", "C", "D", "F", "G", "I", "J", "K", "L", "AD"]
//                 // console.log(letter, 'letter')
//                 // console.log(xlsData)
//                 var createArr = [];
//                 var createDoc = [];
//                 var colums = ['createdAt', 'saveExpireIn', 'page', 'num', 'did', 'name', '具体地址', '位置', '社区单位编号', '是否建档', '经营状态']
//                 for (var i = 5; i < xlsDataLength; i++) {
//                     var obj = { u_path: u_path };
//                     var create_json = {
//                         createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//                         pid: id,
//                         type: 2,
//                         u_path: u_path
//                     };
//                     letter.forEach(ele => {
//                         if (xlsData[ele + i]) {
//                             var propName = xlsData[ele + 3] ? xlsData[ele + 3].v : xlsData[ele + 4] ? xlsData[ele + 4].v : '';
//                             switch (propName) {
//                                 case '建档时间': propName = 'createdAt';
//                                     break;
//                                 case '保管期限': propName = 'saveExpireIn';
//                                     break;
//                                 case '页数': propName = 'page';
//                                     break;
//                                 case '文书份数': propName = 'num';
//                                     break;
//                                 case '企业名称': propName = 'name';
//                                     break;
//                                 case '档号': propName = 'did';
//                                     break;
//                                 case '档案编号': propName = 'did';
//                                     break;

//                             }
//                             if (propName == 'name') {
//                                 create_json.name = xlsData[ele + i].v
//                             }
//                             if (propName == 'did') {
//                                 create_json.did = xlsData[ele + i].v
//                             }
//                             if (colums.indexOf(propName) > -1) {
//                                 if (propName == '位置') {
//                                     var pStr = xlsData[ele + i].v;
//                                     var pStrArr = pStr.split('_');
//                                     if (pStrArr.length == 6) {
//                                         obj['qnum'] = pStrArr[0];
//                                         obj['lnum'] = pStrArr[1]
//                                         obj['ce'] = pStrArr[2]
//                                         obj['jnum'] = pStrArr[3]
//                                         obj['cnum'] = pStrArr[4]
//                                         obj['bnum'] = pStrArr[5]
//                                     }
//                                     // obj[propName] = xlsData[ele + i].v
//                                 } else {
//                                     obj[propName] = xlsData[ele + i].v
//                                 }
//                             }
//                         }
//                     });
//                     obj.name ? createDoc.push(create_json) : ''
//                     obj.name ? createArr.push(obj) : ''
//                 }
//                 console.log(createDoc, createArr)
//                 createDoc.forEach((ele, i) => {
//                     local_api._create('document', ele, $.cookie('appkey'), function (res) {
//                         var _tree_path = i_tree_path + ',' + res.id;
//                         var fid = res.id;
//                         local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//                             var docJson = createArr[i];
//                             docJson.fid = fid;
//                             local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
//                                 if (i == createDoc.length - 1) {
//                                     treeData(pid)
//                                     showTips('ok', '导入' + name + '成功')
//                                 }
//                             })
//                         })
//                     })
//                 })
//                 return { createDoc, createArr }
//                 // console.log(xlsData,xlsDataLength)
//             }



//             // console.log(getIndex(xlsData['!ref']))






//             // createDoc.forEach((ele, i) => {
//             //     local_api._create('document', ele, $.cookie('appkey'), function (res) {
//             //         var _tree_path = tree_path + ',' + res.id;
//             //         var fid = res.id;
//             //         local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
//             //             var docJson = createArr[i];
//             //             docJson.fid = fid;
//             //             local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
//             //                 if (i == createDoc.length - 1) {
//             //                     treeData(pid)
//             //                 }
//             //             })
//             //         })
//             //     })
//             // })

//             // console.log(createArr, createDoc)
//         }
//     }

// };
// function doc_path(doc_paths) {
//     var tArr = doc_paths.split(',').filter(e => e != '');
//     var uploadPath = '';
//     tArr.forEach(ele => {
//         docDatas.forEach(e => {
//             if (ele == e.id) {
//                 uploadPath += e.name + '/'
//             }
//         })
//     })
//     return uploadPath
// }
// //获取导入台账的最大数字
// function getIndex(refs) {
//     var refArr = refs.split('');
//     var _i = 0;
//     var _index = '';
//     for (var i = refArr.length - 1; i > 0; i--) {
//         if (/^[A-Z]+$/.test(refArr[i])) {
//             _i = i + 1
//             break
//         }
//     }
//     for (var i = _i; i < refArr.length; i++) {
//         _index += refArr[i]
//     }
//     return parseInt(_index)
// }