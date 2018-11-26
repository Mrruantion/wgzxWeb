
var customer_table;
var edit_username = '';
var uid;
var tree_path;
var pid;
var userquery;
var editoradd;
var cust_id;
var cust_name;
var dPid, dtree_path;
var aduserType = $.cookie("userType")
var title = '';
var _titleName = '';
$(document).ready(function () {

    $(window).resize(function () {
        windowResize();
    });
    function windowResize() {
        var height = window.innerHeight || $(window).height() - 113;
        $('#user_list_wrapper').css('height', height + 'px')
    }
    // setTimeout(() => {  }, 500)
    // windowResize();

    var customerQuerySuccess = function (json) {
        var names = [];
        customers = json.data;
        if (json.data.length > 0) {
            uid = uid || json.data[0].uid;
            tree_path = json.data[0].treePath;
        }
        if ($.cookie('uid')) {
            uid = uid || $.cookie('uid');
            tree_path = $.cookie('tree_path');
        }

        for (var i = 0; i < json.data.length; i++) {
            names.push(json.data[i].name);
        }

        var onCustomerSelectClick = function (event, treeId, treeNode) {
            //        alert(treeNode.tree_path);
            if (parseInt(treeNode.id) > 0) {
                uid = treeNode.id;
                tree_path = treeNode.treePath;
                _titleName = treeNode.titleName
                var uA = tree_path.split(',');
                var uA2 = []
                title = ''
                for (var i = 2; i < uA.length; i++) {
                    uA2.push(uA[i])
                }
                local_api._list('user', { id: uA2.join('|') }, "name", "", 0, -1, $.cookie('appkey'), function (titleR) {
                    titleR.data.forEach(function (e) {
                        title += e.name
                    })
                    console.log(title, "title")
                })

                // local_api._list("user")
                if (tree_path == $.cookie("tree_path") && aduserType == 2) {
                    uid = $.cookie("uid")
                }
                selectNode = treeNode;
                // $.cookie('uid', uid);
                cust_name = treeNode.name;
                $('#selCustName').html(cust_name);
                getAllCustomer(uid);
                getParentDoc({ name: cust_name })
            }
        };

        var onCustomerAssignClick = function (event, treeId, treeNode) {
            //        alert(treeNode.tree_path);
            if (parseInt(treeNode.id) > 100) {
                assignUid = treeNode.id;
                assignTreePath = treeNode.treePath;
                assignName = treeNode._name;
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

        var customerArray = [];
        var selectArray = [];


        // 创建三个分类的根节点
        for (var i = 0; i < json.data.length; i++) {
            customerArray.push({
                open: false,
                id: json.data[i]['id'],
                treePath: json.data[i]['tree_path'],
                pId: json.data[i]['pid'],
                name: json.data[i]['name'],
                titleName: json.data[i]['titleName'],
                icon: '/img/person_icon.png'
            });
            selectArray.push({
                open: false,
                id: json.data[i]['id'],
                treePath: json.data[i]['tree_path'],
                pId: json.data[i]['pid'],
                name: json.data[i]['name'],
                titleName: json.data[i]['titleName'],
                icon: '/img/person_icon.png'
            });
        }
        // debugger;
        $.fn.zTree.init($("#userTree"), setting, customerArray);

        if (uid > 0) {
            var treeObj = $.fn.zTree.getZTreeObj("userTree");
            var node = treeObj.getNodeByParam("id", uid, null);
            if (node) {
                tree_path = node.treePath;
                cust_name = node.name;
                _titleName = node.titleName
                $('#selCustName').html(cust_name);
                treeObj.selectNode(node);

                var uA = tree_path.split(',');
                var uA2 = []
                title = ''
                for (var i = 2; i < uA.length; i++) {
                    uA2.push(uA[i])
                }
                local_api._list('user', { id: uA2.join('|') }, "name", "", 0, -1, $.cookie('appkey'), function (titleR) {
                    titleR.data.forEach(function (e) {
                        title += e.name
                    })
                    console.log(title, "title")
                })

            } else {
                // uid = $.cookie('uid');
                tree_path = $.cookie('tree_path');
                node = treeObj.getNodeByParam("treePath", tree_path, null);
                tree_path = node.treePath;
                cust_name = node.name;
                _titleName = node.titleName
                // uid = node.id
                $('#selCustName').html(cust_name);
                treeObj.selectNode(node);

                var uA = tree_path.split(',');
                var uA2 = []
                title = ''
                for (var i = 2; i < uA.length; i++) {
                    uA2.push(uA[i])
                }
                local_api._list('user', { id: uA2.join('|') }, "name", "", 0, -1, $.cookie('appkey'), function (titleR) {
                    titleR.data.forEach(function (e) {
                        title += e.name
                    })
                    console.log(title, "title")
                })
            }
            if (typeof getAllCustomer != "undefined") {
                getAllCustomer(uid);
                getParentDoc({ name: cust_name })
            }
        }
    };

    userquery = function () {


        local_api._list('user', { id: '>0', userType: 1, tree_path: '^' + $.cookie('tree_path') + ',|' + $.cookie('tree_path') }, '', '', 1, -1, $.cookie('appkey'), customerQuerySuccess)
    }
    userquery()

    var getAllCustomer = function (uid) {
        var key = '';
        if ($('#userKey').val() !== '') {
            key = $('#userKey').val().trim();
        }
        var query_json = {};
        // query_json.custType = "<>14"
        if (key !== "") {
            var searchType = $('#searchType').val();
            if ($('#allNode').is(':checked')) {
                // query_json = {
                //     treePath: '^' + tree_path,
                //     // custType: '<>14'
                // };
                // // setLoading("vehicle_list");
                // query_json[searchType] = '^' + key;
                // wistorm_api._list('customer', query_json, 'uid', 'uid', '-createdAt', 0, 0, 1, -1, auth_code, true, function (json) {
                //     var uids = [];
                //     uids.push(uid.toString());
                //     for (var i = 0; i < json.data.length; i++) {
                //         uids.push(json.data[i].uid);
                //     }
                //     query_json = {
                //         uid: uids.join('|')
                //     };
                //     query_json[searchType] = '^' + key;
                //     wistorm_api._list('customer', query_json, 'custType,uid,name,other,createdAt,contact,tel,parentId', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, querySuccess);
                // });
            } else {

                if ($('#userTypeSel').val() == 2) {
                    if (aduserType == 2 && uid == $.cookie("uid")) {
                        query_json = {
                            tree_path: tree_path,
                            pid: uid,
                            userType: $('#userTypeSel').val(),
                        }
                    } else {
                        query_json = {
                            tree_path: tree_path,
                            userType: $('#userTypeSel').val(),
                        }
                    }
                } else {
                    query_json = {
                        pid: uid,
                        userType: $('#userTypeSel').val(),
                    }
                }

                query_json[searchType] = '^' + key;
            }
        } else {
            if ($('#userTypeSel').val() == 2) {
                if (aduserType == 2 && uid == $.cookie("uid")) {
                    query_json = {
                        tree_path: tree_path,
                        pid: uid,
                        userType: $('#userTypeSel').val(),
                    }
                } else {
                    query_json = {
                        tree_path: tree_path,
                        userType: $('#userTypeSel').val(),
                    }
                }
            } else {
                query_json = {
                    pid: uid,
                    userType: $('#userTypeSel').val(),
                }
            }


        }
        // wistorm_api._list('customer', query_json, 'objectId,name,treePath,parentId,uid,custType,other', 'custType,name', '-createdAt', 0, 0, 1, -1, auth_code, true, customerQuerySuccess)
        local_api._list('user', query_json, 'id,name,createdAt,roleId,pid,titleName', '-createdAt', 1, -1, $.cookie('appkey'), querySuccess);
    };

    var querySuccess = function (json) {
        names = [];
        json.data = json.data.filter(function (e) { return e.id != uid })
        for (var i = 0; i < json.data.length; i++) {
            json.data[i].createdAt = new Date(json.data[i].createdAt);
            json.data[i].createdAt = json.data[i].createdAt.format("yyyy-MM-dd");
            names.push(json.data[i].name);
        }

        var _columns = [
            {
                "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                    return "<input type='checkbox' value='" + obj.aData.id + "'>";
                }
            },
            { "mData": "name", "sClass": "ms_left" },
            { "mData": "createdAt", "sClass": "center" },
            {
                "mData": null, "sClass": "center", "bSortable": false, "fnRender": function (obj) {
                    return "<a href='#' title='" + '编辑' + "'><i class='icon-edit' cust_id='" + obj.aData.id + "'></i></a>&nbsp&nbsp<a href='#' title='" + '权限' + "'><i class='icon-key' cust_id='" + obj.aData.id + "'></i></a>&nbsp&nbsp<a href='#' title='" + '删除' + "'><i class='icon-remove' cust_id='" +
                        obj.aData.id + "' cust_name='" + obj.aData.name + "'></i></a>";
                }
            }
        ];
        var objTable = {
            "bInfo": false,
            "bLengthChange": false,
            "bProcessing": true,
            "bServerSide": false,
            "bFilter": false,
            "bScrollCollapse": true,
            "aaData": json.data,
            "aoColumns": _columns,
            "sDom": "<'row'r>t<'row'<'pull-right'p>>",
            "sPaginationType": "bootstrap",
            "oLanguage": { "sUrl": 'css/' + 'lang' + '.txt' }
        };

        if (customer_table) {
            customer_table.fnClearTable();
            customer_table.fnAddData(json.data);
        } else {
            customer_table = $("#user_list").dataTable(objTable);

        }
    };

    var id = setInterval(function () {

        // $("#users .icon-remove").on("click", function () {
        //     cust_id = parseInt($(this).attr("cust_id"));
        //     cust_name = $(this).attr("cust_name");
        //     userDelete(cust_id, cust_name)
        //     console.log(cust_id)
        // });

        $('#userKey').on('keypress', function (e) {
            if (e.keyCode == 13) {
                getAllCustomer(uid)
            }
        })
        $('#userTypeSel').on('change', function () {
            getAllCustomer(uid)
        })

        $(document).on('click', '#user_list .icon-remove', function () {
            cust_id = parseInt($(this).attr("cust_id"));
            cust_name = $(this).attr("cust_name");
            userDelete(cust_id, cust_name)
            console.log(cust_id)
        })

        $(document).on("click", "#user_list  .icon-edit", function () {
            cust_id = parseInt($(this).attr("cust_id"));

            var query = { id: cust_id };
            getUser(query, '', function (res) {
                var account = res.data.account;
                var name = res.data.name;
                var userType = res.data.userType;
                var createdAt = new Date(res.data.createdAt).format('yyyy-MM-dd hh:mm:ss');
                var titleName = res.data.titleName
                initfrmUser(1, account, userType, name, createdAt, titleName);
            })
            // $()
            $('#divaddUser').dialog("option", 'title', '修改用户');
            $('#divaddUser').dialog("open");

            console.log(cust_id)
        });
        $(document).on('click', "#user_list  .icon-key", function () {
            cust_id = parseInt($(this).attr("cust_id"));
            var query = { id: cust_id };
            getUser(query, '', function (res) {
                $('#frmKeyUser input').prop('checked', false)
                if (res.data.role) {
                    showRole(res.data.role)
                }
                $('#divKeyUser').dialog('option', 'title', '设置权限');
                $('#divKeyUser').dialog('open')
                // console.log(res)
            })

            console.log(cust_id)
        })

        $('#username').on('input', function (e) {
            if ($('#userType').val() == 1) {
                $('#sTitleName').val(title + e.target.value + '电子档案管理系统')
            } else {
                $('#sTitleName').val(_titleName)
            }
        })
        $('#userType').change(function (e) {
            if (e.target.value == 2) {
                $('#sTitleName').val(_titleName)
            } else {
                $('#sTitleName').val(title + $('#username').val() + '电子档案管理系统')
            }
        })


        var menukeyArr = ['首页', '目录', '检索', '用户管理', '系统备份', '报表'];
        $('#menukey1').on('click', function () {
            // $('#menukey input').prop("checked", $('#menukey1').prop("checked"));//全选
            $('#menukey input').each(function (i, e) {
                if ($(e).val() != '' && roleArr.indexOf($(e).val()) > -1) {
                    $(e).prop("checked", $('#menukey1').prop("checked"))
                }
            })
            // console.log($('#menukey input'))
        })

        $('#menukey input').change(function () {
            keyFun($('#menukey input'), $('#menukey1'), menukeyArr)
        })
        var dockeyArr = ['上传', '新建', '移动', '重命名', '删除', '设置属性', '文档审核', '打印二维码', '合并', '导入台账'];
        // $('#dockey1').on('click', function () {
        //     $('#dockey input').prop("checked", $('#dockey1').prop("checked"));//全选
        // })

        $('#dockey input').change(function () {
            keyFun($('#dockey input'), $('#dockey1'), dockeyArr)
        })
        $('#dockey1').on('click', function () {
            // $('#dockey input').prop("checked", $('#dockey1').prop("checked"));//全选
            $('#dockey input').each(function (i, e) {
                if ($(e).val() != '' && roleArr.indexOf($(e).val()) > -1) {
                    $(e).prop("checked", $('#dockey1').prop("checked"))
                }
            })
        })

        var ohterkeyArr = ['调用密集柜', '文档加锁', '访问加锁文档'];
        $('#otherkey input').change(function () {
            keyFun($('#otherkey input'), $('#otherkey1'), ohterkeyArr)
        })
        $('#otherkey1').on('click', function () {
            // $('#otherkey input').prop("checked", $('#otherkey1').prop("checked"));//全选
            $('#otherkey input').each(function (i, e) {
                if ($(e).val() != '' && roleArr.indexOf($(e).val()) > -1) {
                    $(e).prop("checked", $('#otherkey1').prop("checked"))
                }
            })
        })

        function keyFun(sel1, sel2, arr) {
            var obj = [];
            for (var i = 0; i < sel1.length; i++) {
                if ($(sel1[i]).prop("checked")) {
                    obj.push($(sel1[i]).val())
                }
            }
            if (obj.length == arr.length) {
                sel2.prop("checked", true);
            } else {
                sel2.prop("checked", false);
            }
        }


        //没有的权限不能赋予给下级
        $('.ikey').each(function (i, e) {
            if ($(e).val() != '' && roleArr.indexOf($(e).val()) == -1) {
                $(e).attr("disabled", true)
            }
        })



        windowResize();
        clearInterval(id);
    }, 1000)


    function userDelete(id, name) {
        if (confirm(`你确认删除用户${name}及所有名下信息吗？`)) {
            local_api._list('user', { tree_path: '^' + id, id: '<>' + id }, 'id', '', 1, -1, $.cookie('appkey'), function (count) {
                if (count.total > 0) {
                    showTips('err', '该客户下有客户记录，无法删除！')
                } else {
                    local_api._delete('user', { id: id }, $.cookie('appkey'), function (res) {
                        if (res.status == 0) {
                            var delobj = {
                                u_path: '^' + id
                            }
                            deleteDoc(delobj, function (del) {
                                showTips('ok', '删除成功！')
                                userquery()
                            })
                            // userquery()
                        }
                    })
                }
            })

        }

    }

    // $('#addUser').dialog({

    // })
    var buttons = {

    }
    buttons['确认'] = function () {
        if ($('#frmUser').valid()) {
            if (editoradd == 2) {
                addUser()
            } else if (editoradd == 1) {
                editUser(cust_id);
            }

        }
    }
    buttons['取消'] = function () {
        $('#divaddUser').dialog("close");
    }
    $('#divaddUser').dialog({
        width: 500,
        maxWidth: 'auto',
        maxHeight: 400,
        autoOpen: false,
        buttons: buttons
    })

    $('#addUser').on('click', function () {
        $('#divaddUser').dialog("option", 'title', '新增用户');
        $('#divaddUser').dialog("open");
        initfrmUser(2, '', 1, '', '', '')
        // validator_customer.resetForm()
    })
    buttons = {};
    buttons['确认'] = function () {
        saveRole()
    }
    buttons['取消'] = function () {
        $('#divKeyUser').dialog("close");
    }
    $('#divKeyUser').dialog({
        width: 600,
        maxHeight: 400,
        autoOpen: false,
        buttons: buttons
    })

    // $('tr i').on('click',function(){
    //     console.log(this.cust_id)
    // })

    // $(document).on("click", "#customer_list .icon-remove", function () {
    //     cust_id = parseInt($(this).attr("cust_id"));
    //     cust_name = $(this).attr("cust_name");
    //     if (CloseConfirm(i18next.t("customer.msg_delete_customer", { name: cust_name }))) {
    //         customerDelete(cust_id, uid);
    //     }
    // });






    validator_customer = $('#frmUser').validate(
        {
            // debug: true,
            rules: {
                useraccount: {
                    minlength: 3,
                    required: true,
                    remote: {
                        url: "/exists", //后台处理程序
                        type: "get", //数据发送方式
                        dataType: "json", //接受数据格式
                        data: {
                            auth_code: function () {
                                return $.cookie('appkey');
                            },
                            query_type: function () {
                                return 1;
                            },
                            value: function () {
                                return $('#useraccount').val();
                            }
                        }
                    }
                },
                password: {
                    minlength: 6,
                    required: true
                },
                password2: {
                    minlength: 6,
                    required: true,
                    equalTo: "#password"
                },
                username: {
                    minlength: 3,
                    required: true,
                    remote: {
                        url: "/exists", //后台处理程序
                        type: "get", //数据发送方式
                        dataType: "json", //接受数据格式
                        data: {
                            auth_code: function () {
                                return $.cookie('appkey');
                            },
                            query_type: function () {
                                return 2;
                            },
                            old_value: function () {
                                return edit_username;
                            },
                            value: function () {
                                return $('#username').val().trim();
                            }
                        }
                    }
                },
            },
            messages: {
                useraccount: { minlength: "登陆账号必须超过3个字符", required: "请输入登陆账号", remote: "登陆账号已存在" },
                password: { minlength: "登录密码必须超过6个字符", required: "请输入登录密码" },
                password2: { required: "请输入确认密码", minlength: "确认密码必须超过6个字符", equalTo: "两次输入密码不一致" },
                username: { minlength: "客户名称必须超过3位", required: "请输入客户名称", remote: "客户名称已存在" },
            },
            highlight: function (element) {
                console.log(element)
                // $(element).closest('.control-group').removeClass('success').addClass('error');
            },
            success: function (element) {
                // console.log(element)
                // element
                //     .text('OK!').addClass('valid')
                //     .removeClass('error').addClass('success');
                element
                    .text('OK!').addClass('valid')
                    .closest('li').removeClass('error').addClass('success');
                //alert('success');
            }
        });
})


// type 1修改 2增加
var initfrmUser = function (type, account, userType, name, createdAt, titleName) {
    validator_customer.resetForm();
    editoradd = type;
    edit_username = name;
    var password = '*********';

    if (type == 1) {

        $('#useraccount').attr('disabled', 'disabled')
        $('#password').attr('disabled', 'disabled')
        $('#userType').attr("disabled", "disabled")
        $('#password').val(password);
        $('#password2').val(password);
        $('#password2').parent().hide()
        $('#repassword').show();
        $('#createdAt').parent().show()
        $('#createdAt').attr('disabled', 'disabled')

    } else {
        if (aduserType == 2) {//账号
            $('#userType').attr("disabled", "disabled")
            setTimeout(function () { $('#userType').val("2") }, 1000)
        } else {
            $('#userType').removeAttr("disabled")
        }
        $('#useraccount').removeAttr('disabled')
        $('#password').removeAttr('disabled')

        $('#password').val('');
        $('#password2').val('');
        $('#password2').parent().show()
        $('#repassword').hide();
        $('#createdAt').parent().hide()
    }
    $('#useraccount').val(account);
    $('#userType').val(userType);
    $('#username').val(name);
    $('#createdAt').val(createdAt)
    $('#sTitleName').val(titleName)

}

function addUser() {
    createOperate('新增用户')
    var account = $('#useraccount').val();
    var password = $('#password').val();
    var md5Password = hex_md5(password);
    var userType = $('#userType').val();
    var name = $('#username').val();
    var titleName = $('#sTitleName').val()
    // var tree_path = '';

    var createdAt = new Date().format('yyyy-MM-dd hh:mm:ss')
    var create_obj = {
        name: name,
        account: account,
        password: md5Password,
        userType: userType,
        tree_path: tree_path,
        createdAt: createdAt,
        pid: uid,
        titleName: titleName
    }
    // var createDoc = {
    //     name: name,
    //     // pid:
    // }
    local_api._create('user', create_obj, $.cookie('appkey'), function (res) {
        if (userType == 1) {
            var _tree_path = tree_path + ',' + res.id
            local_api._update('user', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (res) {
                var createDoc = {
                    u_path: _tree_path,
                    type: 0,
                    createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    name: name,
                    pid: dPid,
                }
                //创建客户名下的文件夹
                createDocFnc(createDoc, function (res) {
                    showTips('ok', `新增客户成功!`);
                    userquery();
                    $('#divaddUser').dialog("close");
                })
            })
        } else {
            showTips('ok', `新增账户成功!`);
            userquery();
            $('#divaddUser').dialog("close");
        }
    })
}

$('#repassword').on('click', function (res) {
    // var password = $('#password').val();
    var md5Password = hex_md5('123456');
    $('#password').val(md5Password)
    showTips('ok', '重置密码为123456，请点击确认后保存生效!')
    // console.log('res')
})

function editUser(id) {
    createOperate('修改用户信息')
    var userType = $('#userType').val();
    var name = $('#username').val();
    var titleName = $('#sTitleName').val()
    var obj = {
        name: name,
        userType: userType,
        titleName: titleName
    }
    if ($('#password').val() != '*********') {
        obj['password'] = $('#password').val()
    }
    if (userType == 1) {
        obj['tree_path'] = tree_path + ',' + id
    } else {
        obj['tree_path'] = tree_path
    }
    // debugger;
    local_api._update('user', { id: id }, obj, $.cookie('appkey'), function (res) {
        console.log(res)
        if (res.status == 0) {
            showTips('ok', `编辑用户成功!`);
            $('#divaddUser').dialog("close");
            userquery()
        }
    })
}


function getUser(query, fileds, callback) {
    local_api._get('user', query, fileds, $.cookie('appkey'), function (res) {
        callback(res)
    })
}


function showRole(str) {
    var roleArr = str.split(',');
    var inputArr = $('#frmKeyUser input[name != "全选"]');
    for (var i = 0; i < roleArr.length; i++) {
        for (var j = 0; j < inputArr.length; j++) {
            if (roleArr[i] == $(inputArr[j]).val()) {
                $(inputArr[j]).prop("checked", true);
            }
        }
    }
}

function saveRole() {
    createOperate('设置权限')
    var inputArr = $('#frmKeyUser input[name != "全选"]:checked');
    var obj = [];
    for (var i = 0; i < inputArr.length; i++) {
        obj.push($(inputArr[i]).val())
    }
    local_api._update('user', { id: cust_id }, { role: obj.join(',') }, $.cookie('appkey'), function (res) {
        $('#divKeyUser').dialog('close')
        showTips('ok', `设置权限成功!`);
        // console.log(res)
    })
    // console.log(obj)
}

function getParentDoc(query) {
    local_api._get('document', query, '', $.cookie('appkey'), function (res) {
        if (res.status == 0 && res.data) {
            dPid = res.data.id;
            dtree_path = res.data.tree_path;
        }
    })
}

function createDocFnc(createDoc, callback) {

    local_api._create('document', createDoc, $.cookie('appkey'), function (res) {
        var _tree_path = dtree_path + ',' + res.id;
        local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
            callback(up)
        })
    })
}

function deleteDoc(delobj, callback) {
    local_api._delete('document', delobj, $.cookie('appkey'), function (del) {
        callback(del)
    })
}

// var createDoc = {
//     u_path: u_path,
//     type: 0,
//     createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
//     name: name,
//     pid: dPid,
// }
// function initRole() {
//     var inputArr = ;
//     for (var j = 0; j < inputArr.length; i++) {
//         $(nputArr[j]).prop("checked", true);

//     }
// }
// var isexists = false;
// $('#account').change(function(){
//     // console.log(this.value)
//     if(this.value < 3){
//         isexists = true;
//         console.log($('#account').parentNode)
//     }else {
//         isexists = false;
//     }

// })