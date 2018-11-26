var uploadLiArr = [];
var uploadFileArr = [];
var taskUl = $('.task-list-cont');
var cancalIndexArr = [];
var _g = getSearch();
var tree_path = '';
var u_path = '';
var scrollTop;
(function () {


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
    var parentId = 0; // 父级id，默认为0
    var pid = 0;
    var contentfileId = 0;

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
    var fixPropArr = ['id', 'fid', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname"]
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
    $('#newProp').click(function () {
        $('#newCustomProp').dialog('open')
    })

    $('#addCustom').click(function () {
        $('#selectProp').dialog("open");
    })



    function saveNewPro() {
        var name = $('#newPropname').val();
        var size = 50;
        local_api._createColumn('docProp', { name: name, size: size }, '', function (res) {
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


    function appendUlLI(name) {
        var li = document.createElement('li');
        li.style.marginTop = '10px';
        li.dataset = name
        var lis = ` 
            <label class="ellipsis" title="${name}">${name}</label>
            <input id="page" value="" class="form-control" style="width:50%"/>
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



    function treeData(pid) {
        local_api._list('document', { type: '1|2', u_path: '^' + uid }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
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
                    getDocumentPlay(pid)
                }
            }
        })
    }
    treeData(pid)


    var fileLIstFun = function (ev) {
        var target = tools.getTarget(ev);

        if (target.className.indexOf('docProo') > -1) {
            setDocPro(ev.target)
        }
        if (target.className.indexOf('folder') > -1 || getCurrentClick(ev)) {
            // 找到class为item的父级,设置为ev.target
            scrollTop = $('.file-list').scrollTop();
            if (tools.parents(target, '.item')) {
                target = tools.parents(target, '.item');
                // 获取父级的自定义属性file-id，渲染子数据
                var fileId = target.dataset.fileId;
                tree_path = target.dataset.tree_path;
                u_path = target.dataset.u_path;
                contentfileId = fileId
                renderFilesPathTree(fileId);
            }
        } else {
            target.dataset.filepath ? window.open(target.dataset.filepath, '_blank') : null;
        }
    }


    var pathNavFun = function (ev) {
        var target = tools.getTarget(ev);
        if (tools.parents(target, 'a')) {
            var fileId = target.dataset.fileId;
            contentfileId = fileId;
            tree_path = target.dataset.tree_path;
            u_path = target.dataset.u_path;
            renderFilesPathTree(fileId);
        }
    }

    var treeMenuFun = function (ev) {
        var target = tools.getTarget(ev);
        if (tools.parents(target, '.tree-title')) {
            var isShow = tools.parents(target, '.tree-title').nextElementSibling.style.display == 'none' ? true : false;
            if (target.className.indexOf('ico') > -1) {
                target.className = isShow ? 'ico' : 'ico act'
                tools.parents(target, '.tree-title').nextElementSibling.style.display = isShow ? 'block' : 'none'
                return;
            }
            target = tools.parents(target, '.tree-title');
            var fileId = target.dataset.fileId;
            contentfileId = fileId;
            tree_path = target.dataset.tree_path;
            u_path = target.dataset.u_path;
            renderFilesPathTree(fileId);
        }
    }

    var removeClicks = function () {
        tools.removeEvent(fileList, 'click', fileLIstFun);
        tools.removeEvent(treeMenu, 'click', treeMenuFun);
        tools.removeEvent(pathNav, 'click', pathNavFun);
    }

    function getDocumentPlay(pid) {
        $('.file-list').empty();
        $('.tree-menu').empty();
        removeClicks();
        // 渲染文件展示区html结构，默认最外层
        fileList.innerHTML = createFilesHtml(datas, contentfileId);
        // 给文件展示区每个文件注册点击事件
        tools.addEvent(fileList, 'click', fileLIstFun);

        // 渲染树形导航区html结构，默认都展开
        treeMenu.innerHTML = createTreeHtml(datas, pid);
        // 给树形导航区每个文件注册点击事件
        tools.addEvent(treeMenu, 'click', treeMenuFun);

        // 渲染文件路径导航区html结构，默认渲染第一层
        pathNav.innerHTML = createPathNavHtml(datas, contentfileId);
        // 树形导航区默认定位到最外层
        positionTreeById(contentfileId);
        renderFilesPathTree(contentfileId)
        // 给文件路径导航区每个文件注册点击事件
        tools.addEvent(pathNav, 'click', pathNavFun);
    }


    function getCurrentClick(ev) {
        var type = parseInt(ev.target.dataset.type);

        if ([1, 2].indexOf(type) > -1) {
            return true;
        }
        if (ev.className == 'file-tilte') {
            var ptype = parseInt(ev.target.parentNode.parentNode.dataset.type);
            if ([1, 2].indexOf(ptype) > -1) {
                return true;
            }
        }
        return false;
    }


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
        var treeNav = tools.$('.tree-nav', treeMenu)[0]; // 当前定位的文件
        childrenDatas = [];
        datas.forEach(ele => {
            if (ele.id == fileId) {
                if (ele.type != 1) {
                    $('.create').hide()
                } else {
                    $('.create').show()
                }
                childrenDatas.push(ele);
            }
        })

        local_api._list('document', { pid: fileId, u_path: '^' + uid }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
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
            tools.removeClass(treeNav, 'tree-nav');
            positionTreeById(fileId);

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


    function batchSetPro() {
        local_api.getTableColumns('docProp', '', function (colum) {
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

    function saveBatchProp() {
        console.log(fileDocProId);
        if (!fileDocProId.length) {
            showTips('err', '该档案下没有案卷可设置');
            return;
        }
        // file
        var createBatch = [];
        var create_json = {
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
                    // console.log(res)
                    $('#divDocPro').dialog("option", 'title', '属性');
                    $('#divDocPro').dialog("close");
                })
            })
        }



        console.log(createBatch)
    }


    var isNewProp = false;
    function setDocPro(ev) {
        isbatch = false;
        docProId = ev.id.slice('docPro_'.length, ev.id.length);
        console.log(docProId)
        local_api.getTableColumns('docProp', '', function (colum) {
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
                                        <input id="page" value="${res.data[i]}" class="form-control" style="width:60%"/>
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


        // console.log(ev.id)
    }

    function saveDocPro() {
        if (isNewProp) {
            var create_json = {
                name: $('#name').val(),
                fid: docProId,
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
                // console.log(res)
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
            // console.log($('#newPropLi li'))
            var liArr = $('#newPropLi li');
            var customJson = {}
            for (var i = 0; i < liArr.length; i++) {
                var li = liArr[i];
                customJson[$('label', li).text()] = $('input', li).val()
            }
            Object.assign(update_json, customJson)

            console.log(update_json)
            local_api._update('docProp', query_json, update_json, $.cookie('appkey'), function (res) {
                // console.log(res)
                local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
                    $('#divDocPro').dialog("close");
                })
                // $('#divDocPro').dialog("close");
            })
        }
        // console.log(docProId)
    }
    
    //内容展示布局
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
    var disX = 0, disX = 0;

    tools.addEvent(tools.$('.main')[0], 'mousedown', function (ev) {
        var target = tools.getTarget(ev);
        if (tools.parents(target, '.nav-a')) return;
        disX = ev.clientX;
        disY = ev.clientY;

        // 鼠标移动
        tools.addEvent(document, 'mousemove', mouseMove)

        // 鼠标抬起
        tools.addEvent(document, 'mouseup', mouseUp)

        // 阻止默认行为
        ev.preventDefault();
    })

    // 鼠标移动
    function mouseMove(ev) {
        fileItem = tools.$('.file-item', fileList);
        allCheckbox = tools.$('.checkbox', fileList);
        if (Math.abs(ev.clientX - disX) > 20 || Math.abs(ev.clientY - disY) > 20) {
            // 只生成一个div
            if (!newDiv) {
                newDiv = document.createElement('div');
                document.body.appendChild(newDiv);
                newDiv.className = 'select-box';
            }
            newDiv.style.display = 'block';
            newDiv.style.width = Math.abs(ev.clientX - disX) + 'px';
            newDiv.style.height = Math.abs(ev.clientY - disY) + 'px';
            newDiv.style.left = Math.min(ev.clientX, disX) + 'px';
            newDiv.style.top = Math.min(ev.clientY, disY) + 'px';

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
        }
    }
    // 鼠标抬起
    function mouseUp() {
        tools.removeEvent(document, 'mousemove', mouseMove);
        tools.removeEvent(document, 'mouseup', mouseUp);
        if (newDiv) {
            newDiv.style.display = 'none';
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
                    u_path: u_path
                };
                local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                    var _tree_path = tree_path + ',' + res.id
                    local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (res) {
                        treeData(pid)
                        if (fileType == 2) {
                            showTips('ok', '新建案卷成功!');
                        } else if (fileType == 1) {
                            showTips('ok', '新建分类成功!');
                        }

                    })
                })
            }
            //无论创建成不成功，状态都要设为false
            create.isCreateFile = false;
            tools.removeEvent(document, 'mousedown', createFile)
        }
    }




    /* 提示信息 */

    var fullTipBox = tools.$('.full-tip-box')[0];
    var tipText = tools.$('.text', fullTipBox)[0];

    // 提醒信息函数
    function showTips(className, text) {
        tools.addClass(fullTipBox, className);
        tipText.innerHTML = text;

        // 每次调用都从-32px到0的位置运动
        fullTipBox.style.top = '-32px';
        fullTipBox.style.transition = 'none';

        // 显示提示信息
        setTimeout(function () {
            fullTipBox.style.top = 0;
            fullTipBox.style.transition = '.3s';
        }, 0);

        // 2s后隐藏
        clearTimeout(fullTipBox.timer);
        fullTipBox.timer = setTimeout(function () {
            fullTipBox.style.top = '-32px';
            fullTipBox.style.transition = 'none';
            tools.removeClass(fullTipBox, className);
        }, 2000);
    }


    /* 重命名 */
    // 需要完善
    var rename = tools.$('.rename')[0];

    tools.addEvent(rename, 'mouseup', function () {
        fileItem = tools.$('.file-item', fileList);
        allCheckbox = tools.$('.checkbox', fileList);

        if (!getCheckedFile().length) {
            showTips('err', '请选择文件！');
        } else if (getCheckedFile().length > 1) {
            showTips('err', '只能对单个文件重命名！');
        } else {
            var fileTitle = $('.file-checked .file-title');
            var upId = $('.file-checked .item').data().fileId;
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
           
            function changeFun(ev) {
                if (ev.target.parentNode == fileEdtor) {
                    // debugger
                    return;
                }
                // console.log(1)
                var value = editor.val().trim();
                if (value == '') {
                    showTips('err', '请输入文件名！');
                } else {
                    // debugger;
                    local_api._update('document', { id: upId }, { name: value }, $.cookie('appkey'), function (res) {
                        if (res.status == 0) {
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

    $('#search').on('keypress', function (e) {
        if (e.keyCode == 13) {
            e.target.value.trim() != '' ? location.href = '/hightSearch?query=' + e.target.value.trim() : null
        }
    })

    // tools.addEvent('')
    var isupload = false
    $('.upload').on('click', function (ev) {
        ev.stopPropagation();
        uploadFiles()
        // $('.upload-ff').toggleClass('act');
    })

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
    })
    var tree_address = '';
    function uploadFiles() {
        var input = document.createElement('input');
        input.type = 'file';
        input.multiple = "multiple"

        $(input).change(function (ev) {
            console.log(this.files)
            var fileList = this.files;
            var fileIndex = uploadFileArr.length + 0;
            $('.mod-tasks .tasks-header').removeClass('result-succt').addClass('tasking-nor')

            var tArr = tree_path.split(',');
            var uploadPathArr = dataControl.getParents(datas, tArr[tArr.length - 1]).reverse()
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
                // $()
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
                if (uploadFileArr.length == fileIndex) {//最后
                    $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ')
                    $('.mod-tasks .summary-wrapper .txt').text(`任务已完成`)
                } else {
                    var scaleXVal = (fileIndex / uploadFileArr.length).toFixed(1)
                    $('.mod-tasks .summary-wrapper .before').css('transform', `scaleX(${scaleXVal})`)
                    $('.mod-tasks .summary-wrapper .txt').text(`${fileIndex}/${uploadFileArr.length}项任务进行中`)
                }
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
                            renderFilesPathTree(contentfileId)
                        }
                        isFileExist()
                    })
                }
            }
            isFileExist()

            function start(file, index, callback) {
                get_filemd5sum(file, function (res) {
                    var filename = file.name;
                    var firstname = '', lastname = file.name, finame = '';
                    var i = 0;
                    if (filename.lastIndexOf('.') > -1) {
                        firstname = filename.slice(0, filename.lastIndexOf('.'))
                        finame = filename.slice(filename.lastIndexOf('.'))
                    } else {
                        firstname = filename;
                        finame = ''
                    }
                    var fmd5 = res;
                    if (fmd5 != -1) {
                        loadGet()
                        function loadGet() {
                            i++;
                            var query_json = {
                                name: lastname,
                                tree_path: '^' + tree_path,
                                type: 3,
                            }
                            local_api._get('document', query_json, '', $.cookie('appkey'), function (getr) {
                                if (getr.status == 0 && getr.data) {
                                    var _tree_path = getr.data.tree_path.slice(0, getr.data.tree_path.lastIndexOf(','));
                                    if (getr.data.f_md5 == fmd5) { //同名同内容
                                        if (_tree_path != tree_path) { //不同文件夹
                                            renameSucc(lastname, fmd5, file, callback)
                                        } else {
                                            // console.log(index + 'same')
                                            callback(getr.data)
                                        }
                                    } else { //同名不同内容
                                        lastname = firstname + '(' + i + ')' + finame;
                                        loadGet()
                                    }
                                } else if (getr.status == 0 && !getr.data) { //不同名
                                    renameSucc(lastname, fmd5, file, callback)
                                }
                            })
                        }
                    }
                })
                // callback(index)
            }

            function renameSucc(rename, fmd5, file, callback) {
                var formData = new FormData();
                formData.append(rename, file);
                // var path = tree_path;
                // console.log(tree_path)

                // console.log(dataControl.getParents(datas,188))
                // var url = '/upload?path=' + encodeURI(tree_address)
                var url = '/upload'
                var xhr = http({
                    type: 'POST',
                    url: url,
                    data: {formData,path:encodeURI(tree_address)},
                    onProgress: function (event) {
                        console.log(event.percent);
                        console.log($(uploadLiArr[fileIndex]), fileIndex, '23')
                        // debugger;
                        // if (event.percent == 100) {
                        //     // break;
                        // }
                    },
                    onSuccess: function (data) {
                        console.log(data)
                        data.fmd5 = fmd5;
                        if (data.status == 0) {
                            uploadSuccess(data, function (res) {
                                // console.log(res)
                                callback(res)
                            })
                        } else {
                            callback(data)
                        }
                        // console.log(index + 'succ')

                        // uploadSuccess(data)
                    },
                    onError: function (err) {
                        // alert(err)
                        callback(res)
                    }
                })
                // console.log()
            }

            function uploadSuccess(data, callback) {

                var query_json = {
                    pid: contentfileId,
                    size: data.file.size,
                    type: 3,
                    name: data.file.filename
                }
                local_api._get('document', query_json, '', $.cookie('appkey'), function (getres) {
                    if (getres.status == 0 && !getres.data) {
                        var filetype = data.file.mimetype.indexOf('image') > -1 ? 'png' : 'txt';
                        // var filetype = data.filename
                        var create_json = {
                            size: data.file.size,
                            createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                            pid: contentfileId,
                            type: 3,
                            filetype: filetype,
                            name: data.file.filename,
                            path: '/upload/' + tree_address + data.file.filename,
                            f_md5: data.fmd5,
                            u_path: u_path
                        }
                        local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                            var _tree_path = tree_path + ',' + res.id;
                            var cres = { id: res.id, tree_path: _tree_path }
                            local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                                // console.log(up)
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
        var typeobj = {};
        var typeArr = [];
        selectData.forEach(ele => {
            treeArr.push('^' + $('.item', ele).data().tree_path);
            var type = $('.item', ele).data().type;
            if (!typeobj[type]) {
                typeobj[type] = 1;
                var typeStr = type == 1 ? '分类' : type == 2 ? '案卷' : type == 3 ? '文件' : '';
                typeArr.push(typeStr)
            }

        })
        // typeobj
        var confirmStr = `确定要删除${selectData.length > 1 ? '这些' : '这个'}${typeArr.join('/')}？`
        if (confirm(confirmStr))
            local_api._delete('document', { tree_path: treeArr.join('|') }, $.cookie('appkey'), function (res) {
                treeData(pid)
                showTips('ok', `删除${typeArr.join('/')}成功!`);
            })
    })

    $('.logout').on('mousedown', function (ev) {
        ev.stopPropagation()
        // console.log(1)
        location.href = '/logout'
    })


    $('#showList').click(function () {
        $('.mod-tasks').toggleClass('expand')
    })

    $('#hideList').click(function () {
        $('.mod-tasks').hide();
        uploadLiArr = [];
        uploadFileArr = [];
        taskUl.empty();
        fileIndex = 0;
    })

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

    var oneExc = function (files) {
        var reader = new FileReader();
        reader.readAsBinaryString(files[0]);
        reader.onload = function (evt) {
            var data = evt.target.result;
            // console.log(data)
            // csvCardData = [];
            var wb = XLSX.read(data, {
                type: 'binary'
            });
            // console.log(wb['SheetNames'])
            var xlsData = wb.Sheets[wb['SheetNames'][6]];
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
            var letter1 = ["B", "C", "D", "F", "G", "I", "J", "K", "L", "AD"]
            console.log(letter)
            console.log(xlsData)
            // for(var i = 0;)letter1
            var createArr = [];
            var createDoc = [];

            for (var i = 5; i < 196; i++) {
                var obj = {};
                var create_json = {
                    createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    pid: contentfileId,
                    type: 2,
                    u_path: u_path
                };
                letter1.forEach(ele => {
                    if (xlsData[ele + i]) {
                        var propName = xlsData[ele + 3].v;
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
                                break

                        }
                        if (propName == 'name') {
                            create_json.name = xlsData[ele + i].v
                        }
                        obj[propName] = xlsData[ele + i].v
                    }

                    // console.log(xlsData[ele + i])
                });
                createDoc.push(create_json)
                createArr.push(obj)
            }

            createDoc.forEach((ele, i) => {
                local_api._create('document', ele, $.cookie('appkey'), function (res) {
                    var _tree_path = tree_path + ',' + res.id;
                    var fid = res.id;
                    local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                        var docJson = createArr[i];
                        docJson.fid = fid;
                        local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
                            if (i == createDoc.length - 1) {
                                treeData(pid)
                            }
                            // treeData(pid)
                        })
                    })
                })
            })

            console.log(createArr, createDoc)
        }
    }
}());