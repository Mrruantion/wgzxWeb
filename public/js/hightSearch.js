var header = tools.$('.header')[0];
var weiyunContent = tools.$('.weiyun-content')[0];
var headerH = header.offsetHeight;
var _g = getSearch();


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
    getUserDoc()//id
    function getUserDoc() {
        local_api._get("document", { u_path: $.cookie("tree_path") }, "id", $.cookie("appkey"), function (res) {
            console.log(res)
            local_api._list("document", { pid: res.data.id }, "", "id", 1, -1, $.cookie("appkey"), function (all) {
                console.log(all, "resall")
                $('#selD').empty()
                $('#selC').empty()
                for (var i = 0; i < all.data.length; i++) {
                    var option = `<option value="${all.data[i].tree_path}">${all.data[i].name}</option>`
                    $('#selD').append(option)
                }
                // var option = `<option value="1">${1}</option>`
                // $('#selD').append(option)
                if (all.data[0]) {
                    var _pidArr = all.data[0].tree_path.split(',');
                    var _pid = _pidArr[_pidArr.length - 1]
                    local_api._list("document", { pid: _pid }, "", "id", 1, -1, $.cookie("appkey"), function (allC) {
                        console.log(allC, "resall")
                        for (var i = 0; i < allC.data.length; i++) {
                            var option = `<option value="${allC.data[i].tree_path}">${allC.data[i].name}</option>`
                            $('#selC').append(option)
                        }

                    })
                }

            })

        })
    }
    $('#selD').change(function (e) {
        // console.log(e.target.value)
        var _pidArr = e.target.value.split(',');
        var _pid = _pidArr[_pidArr.length - 1]
        local_api._list("document", { pid: _pid }, "", "id", 1, -1, $.cookie("appkey"), function (allC) {
            console.log(allC, "resall")
            $('#selC').empty()
            for (var i = 0; i < allC.data.length; i++) {
                var option = `<option value="${allC.data[i].tree_path}">${allC.data[i].name}</option>`
                $('#selC').append(option)
            }

        })
    })


    var docColumns = [];
    if (_g.query && _g.query != '') {
        console.log(_g.query);
        $('#search').val(_g.query);
        createOperate('文件检索')
        vagueQuery(_g.query, function (fileIdArr) {
            // console.log(fileIdArr)
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

            var idObj = { id: filestr, ispass: 1 }
            if (roleArr.indexOf('访问加锁文档') == -1) {
                idObj['islock'] = '<>2'
            }
            local_api._list('document', idObj, '', '', 1, 10, $.cookie('appkey'), function (res) {
                console.log(res);
                if (res.data.length) {
                    showFileList(res.data)
                    initPaginator(res.total, 1, 10, idObj)
                } else {
                    $('.file-list').hide();
                    $('.g-empty').show();
                }

            })
        })
    }


    $('#query').click(function () {
        var name = $('#name').val().trim();
        var did = $('#onlyId').val().trim();
        var keyword = $('#keyword').val().trim();
        createOperate('文件检索')
        var obj = {
            type: 2
        }



        if (name || keyword) {
            obj['name'] = '^' + (name || keyword)
        }
        if (did) {
            obj['did'] = '^' + did
        }

        local_api._list('document', obj, '', '', 1, 500, $.cookie('appkey'), function (res) {
            // console.log(res)
            var str = []
            // res.data.forEach(ele => {
            //     str.push(ele.id);
            // })

            for (var i = 0; i < res.data.length; i++) {
                str.push(res.data[i].id);
            }

            var obj = { type: 3, ispass: 1 }
            if ($('#selC').val() != '') {
                obj["tree_path"] = '^' + $('#selC').val()
            }
            if (res.data.length) {
                obj['pid'] = str.join('|')
            }
            if (keyword) {
                obj['name'] = '^' + keyword
            }
            if (roleArr.indexOf('访问加锁文档') == -1) {
                idObj['islock'] = '<>2'
            }
            local_api._list('document', obj, '', '', 1, 10, $.cookie('appkey'), function (res) {
                if (res.data.length) {
                    showFileList(res.data)
                    initPaginator(res.total, 1, 10, obj)
                } else {
                    $('.file-list').hide();
                    $('.g-empty').show();
                }
            })

        })

        // })


        // var obj = {}
        // if(keyword){
        //     obj['keyword'] = 
        // }
    })


    function getDocuList(val, page) {
        local_api._list('document', val, '', '', page, 10, $.cookie('appkey'), function (res) {
            showFileList(res.data)
            // console.log(res)
            // initPaginator(res.total, 1, 10, res)
        })
    }
    var allData = [];
    function showFileList(data) {

        if (allData.length) {
            var pidArr = [];
            // data.forEach(ele => {
            //     ele.tree_addr = getNavTree(ele.pid, allData);
            //     ele.pfid = docParent(allData, ele.pid);
            //     pidArr.push(docParent(allData, ele.pid))
            // })

            for (var i = 0; i < data.length; i++) {
                data[i].tree_addr = getNavTree(data[i].pid, allData);
                data[i].pfid = docParent(allData, data[i].pid);
                pidArr.push(docParent(allData, data[i].pid))
            }
            local_api._list('docProp', { fid: pidArr.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (prop) {
                // data.forEach(ele => {
                //     prop.data.forEach(e => {
                //         if (e.fid == ele.pfid) {
                //             console.log(e)
                //             ele._postion = `${e.qnum}区${e.lnum}列${e.ce == 1 ? '左' : '右'}侧${e.jnum}节${e.cnum}层${e.bnum}本`
                //             // ele._postion_ = `${e.qnum}_${e.lnum}_${e.ce}_${e.jnum}_${e.cnum}_${e.bnum}`
                //         }
                //     })
                // })

                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < prop.data.length; j++) {
                        if (prop.data[j].fid == data[i].pfid) {
                            console.log(prop.data[j])
                            data[i]._postion = `${prop.data[j].lnum}列${prop.data[j].ce == 'l' ? '左' : '右'}侧${prop.data[j].onum || ''}`
                        }
                    }
                }
                $('.file-list').empty();
                $('.file-list').show();
                $('.g-empty').hide();
                $('.file-list').append(createFilesHtmls(data));
                $('.file-list .file-item>div').on('click', function (e) {
                    // debugger;
                    if (e.target.nodeName == 'BUTTON') {
                        openM(e)
                        return;
                    }
                    if (e.target.nodeName != 'A') {
                        linkfile(e)
                    }
                })
            })
        } else {
            local_api._list('document', { type: '0|1|2|4', u_path: '^' + $.cookie('tree_path') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
                allData = res.data;
                var pidArr = [];
                // data.forEach(ele => {
                //     ele.tree_addr = getNavTree(ele.pid, allData);
                //     ele.pfid = docParent(allData, ele.pid);
                //     pidArr.push(docParent(allData, ele.pid))
                // })
                for (var i = 0; i < data.length; i++) {
                    data[i].tree_addr = getNavTree(data[i].pid, allData);
                    data[i].pfid = docParent(allData, data[i].pid);
                    pidArr.push(docParent(allData, data[i].pid))
                }
                local_api._list('docProp', { fid: pidArr.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (prop) {
                    // data.forEach(ele => {
                    //     prop.data.forEach(e => {
                    //         if (e.fid == ele.pfid) {
                    //             console.log(e)
                    //             ele._postion = `${e.qnum}区${e.lnum}列${e.ce == 1 ? '左' : '右'}侧${e.jnum}节${e.cnum}层${e.bnum}本`
                    //             // ele._postion_ = `${e.qnum}_${e.lnum}_${e.ce}_${e.jnum}_${e.cnum}_${e.bnum}`
                    //         }
                    //     })
                    // })
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < prop.data.length; j++) {
                            if (prop.data[j].fid == data[i].pfid) {
                                console.log(prop.data[j])
                                data[i]._postion = `${prop.data[j].lnum}列${prop.data[j].ce == 'l' ? '左' : '右'}侧${prop.data[j].onum || ''}`
                            }
                        }
                    }
                    $('.file-list').empty();
                    $('.file-list').show();
                    $('.g-empty').hide();
                    $('.file-list').append(createFilesHtmls(data));
                    $('.file-list .file-item>div').on('click', function (e) {
                        // console.log(e)
                        // debugger;
                        if (e.target.nodeName == 'BUTTON') {
                            openM(e)
                            return;
                        }
                        if (e.target.nodeName != 'A') {
                            linkfile(e)
                        }

                    })
                    // console.log(prop)
                })
                // console.log(pidArr)

            })
        }

    }

    function linkfile(e) {
        var pid = e.currentTarget.dataset.filePid;
        var path = e.currentTarget.dataset.filepath;
        // path = `/js/pdf/generic/web/viewer.html?file=${path}`
        // window.open(path, '_blank')
        path = '/pdfView?fileid=' + e.currentTarget.dataset.fileId;
        window.open(path, '_blank')
    }
    function initPaginator(total, currentpage, numberOfPages, val) {
        var totalPages = Math.ceil(total / numberOfPages)
        $('#pageLimit').bootstrapPaginator({
            currentPage: currentpage,
            totalPages: totalPages,
            size: "normal",
            bootstrapMajorVersion: 3,
            alignment: "right",
            numberOfPages: 6,
            itemTexts: function (type, page, current) {
                switch (type) {
                    case "first": return "首页";
                    case "prev": return "上一页";
                    case "next": return "下一页";
                    case "last": return "末页";
                    case "page": return page;
                }
            },
            onPageClicked: function (event, originalEvent, type, page) {
                // console.log(page)
                getDocuList(val, page)
            }
        });
    }

    $('#search').on('keypress', function (e) {
        if (e.keyCode == 13) {
            var val = e.target.value.trim();
            if (val != '') {
                vagueQuery(val, function (fileIdArr) {
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
                    var idObj = { id: filestr, ispass: 1 }
                    if (roleArr.indexOf('访问加锁文档') == -1) {
                        idObj['islock'] = '<>2'
                    }
                    local_api._list('document', idObj, '', '', 1, 10, $.cookie('appkey'), function (res) {
                        console.log(res)
                        if (res.data.length) {
                            showFileList(res.data)
                            initPaginator(res.total, 1, 10, idObj)
                        } else {
                            $('.file-list').hide();
                            $('.g-empty').show();
                        }
                    })
                    // }
                    // console.log(res)
                })
            }
        }
    })

    function getNavTree(fileId, allData) {
        var parents = dataControl.getParentss(allData, fileId).reverse();
        var str = '';
        var str1 = ''
        // parents.forEach(el => {
        //     if (roleArr.indexOf('目录') == -1) {
        //         str += `<a href="#">${el.name}</a>` + '/'
        //     } else {
        //         str += `<a href="/file?fileId=${el.id}">${el.name}</a>` + '/';
        //     }
        //     str1 += `${el.name}` + '/'
        //     // console.log(e)
        // })

        for (var i = 0; i < parents.length; i++) {
            if (roleArr.indexOf('目录') == -1) {
                str += `<a href="#">${parents[i].name}</a>` + '/'
            } else {
                str += `<a href="/file?fileId=${parents[i].id}">${parents[i].name}</a>` + '/';
            }
            str1 += `${parents[i].name}` + '/'
            // console.log(e)
        }
        console.log(str)
        return { str, str1 }
    }

    function docParent(data, id) {
        var dd;
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == id && data[i].type == 2) {
                dd = data[i].id;
                break;
            } else if (data[i].id == id) {
                dd = docParent(data, data[i].pid);
                break;
            }
        }
        return dd
    }

    function vagueQuery(val, callback) {
        if (docColumns.length) {
            var obj = {};
            // docColumns.forEach(ele => {
            //     obj[ele] = val;
            // })
            for (var i = 0; i < docColumns.length; i++) {
                obj[docColumns[i]] = val;
            }
            queryRetrive(val, obj, callback)
        } else {
            var delColmn = ['id', 'fid', 'createdAt'];
            local_api.getTableColumns('docProp', $.cookie('appkey'), function (dcol) {
                var obj = {};
                // dcol.row.forEach(ele => {
                //     if (delColmn.indexOf(ele.Field) == -1) {
                //         docColumns.push(ele.Field);
                //         obj[ele.Field] = val;
                //     }

                // });
                for (var i = 0; i < dcol.row.length; i++) {
                    if (delColmn.indexOf(dcol.row[i].Field) == -1) {
                        docColumns.push(dcol.row[i].Field);
                        obj[dcol.row[i].Field] = val;
                    }
                }
                queryRetrive(val, obj, callback)
            })
        }
    }

    function queryRetrive(val, obj, callback) {
        var fileIdArr = [];
        local_api._vlist('docProp', obj, '', '', 1, 200, $.cookie('appkey'), function (res) {
            console.log(res.data)
            // res.data.forEach(ele => {
            //     fileIdArr.push(ele.fid);
            // })
            for (var i = 0; i < res.data.length; i++) {
                fileIdArr.push(res.data[i].fid);
            }
            var obj = {
                name: val,
                filetype: val,
                path: val,
                size: val,
                keyword: val,
            }
            local_api._vlist('document', obj, '', '', 1, 200, $.cookie('appkey'), function (res) {
                // console.log(res)
                // res.data.forEach(ele => {
                //     // fileIdArr.push(ele.id);
                //     if (ele.type == 3) {
                //         fileIdArr.push(ele.pid);
                //     } else {
                //         fileIdArr.push(ele.id);
                //     }
                // })
                for (var i = 0; i < res.data.length; i++) {
                    // fileIdArr.push(ele.id);
                    if (res.data[i].type == 3) {
                        fileIdArr.push(res.data[i].pid);
                    } else {
                        fileIdArr.push(res.data[i].id);
                    }
                }
                var idObj = { pid: fileIdArr.join('|'), type: 3 }
                local_api._list('document', idObj, '', '', 1, -1, $.cookie('appkey'), function (res) {
                    var fileIdArr = []
                    // res.data.forEach(ele => {
                    //     fileIdArr.push(ele.id);
                    // })
                    for (var i = 0; i < res.data.length; i++) {
                        fileIdArr.push(res.data[i].id);
                    }
                    callback(fileIdArr)
                })
            })

        })
        console.log(obj)
    }

    var appInterval;
    function openM(e) {
        console.log(e.target.dataset)
        var docProId = e.target.dataset.docprpid
        // if(_position.length >= 5){

        createOperate('打开密集柜')
        // var docProId = ev.id.slice('openProo_'.length, ev.id.length);
        local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
            if (res.data) {
                // var qu = parseInt(res.data.qnum || 0);
                var lie = parseInt(res.data.lnum || 0);
                // var jie = parseInt(res.data.jnum || 0);
                // var ceng = parseInt(res.data.cnum || 0);
                var ce = res.data.ce
                // var bh = parseInt(res.data.bnum || 1);
                if (lie > 0 && ce) {
                    if (ce == 'l') {
                        lie += 1;
                    }
                    $.ajax({
                        url: '/openApi?lie=' + lie,
                        type: 'get',
                        dataType: 'json',
                        success: function (oS) {
                            console.log(oS)
                            if(oS.status == '"0"'){
                                showTips('ok', '密集柜已打开！');
                            }else {
                                showTips('err', '密集柜打开失败！');
                            }
                        }
                    })
                } else {
                    showTips('err', '无位置信息，无法打开密集柜！');
                }
            } else {
                showTips('err', '无位置信息，无法打开密集柜！')
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


})

