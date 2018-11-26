// /**用户名点击 */
var userName = tools.$('.act-item-txt')[0];
var showPanel = tools.$('.mod-bubble-menu-info')[0];
tools.addEvent(userName, 'click', userNameChange);
var roleArr = $.cookie('role').split(',');



function userNameChange(ev) {
    console.log(ev.target);
    console.log(ev.currentTarget.nodeName)
    console.log(ev.type);
    var isAccClass = userName.parentNode.className;
    var pClass = ev.target.parentNode.className
    console.log(userName.parentNode.className);

    if (ev.currentTarget.nodeName == "#document" && isAccClass.indexOf('act-item act-item-acc act') > -1) {
        if (pClass == 'user-info' || pClass == "mode-user" || pClass == "act-item-txt") {
            return;
        }
    }

    if (isAccClass.indexOf('act-item act-item-acc act') == -1) {
        // userName.parentNode.className = isAccClass + ' act ';
        $('.act-item-txt').parent().toggleClass('act');
        $('.mod-bubble-menu-info').show()
        // showPanel.style.display = 'block';
        tools.addEvent(document, 'mousedown', userNameChange)
    } else {
        $('.act-item-txt').parent().toggleClass('act');
        $('.mod-bubble-menu-info').hide()
        tools.removeEvent(document, 'mousedown', userNameChange)
    }
}

$('.logout').on('mousedown', function (ev) {
    ev.stopPropagation()
    // console.log(1)
    location.href = '/logout'
})

$('#usermanage').on('mousedown', function (ev) {
    ev.stopPropagation();
    location.href = '/user'
})

$('#sysCopy').on('mousedown', function (ev) {
    ev.stopPropagation();
    location.href = '/sysCopy'
})

// 提醒信息函数
function showTips(className, text) {
    var fullTipBox = $('.full-tip-box');
    var tipText = $('.text', fullTipBox);
    fullTipBox.addClass(className);
    tipText.text(text)

    // 每次调用都从-32px到0的位置运动
    fullTipBox.css('top', '-32px');
    fullTipBox.css('transition', 'none');

    // 显示提示信息
    setTimeout(function () {
        fullTipBox.css('top', '0px');
        fullTipBox.css('transition', '.3s');
    }, 0);

    // 2s后隐藏
    clearTimeout(fullTipBox.timer);
    fullTipBox.timer = setTimeout(function () {
        fullTipBox.css('top', '-32px');
        fullTipBox.css('transition', 'none');
        fullTipBox.removeClass(className);
    }, 2000);
}


if (roleArr.indexOf('首页') == -1) {
    $('.summary').remove();
}
if (roleArr.indexOf('目录') == -1) {
    $('.file').remove();
}
if (roleArr.indexOf('检索') == -1) {
    $('#search').attr('disabled', 'disabled')
    $('.hightSearch').remove();
}
if (roleArr.indexOf('用户管理') == -1) {
    $('#usermanage').remove();
}
if (roleArr.indexOf('报表') == -1) {
    $('.report ').remove();
}

if (roleArr.indexOf('系统备份') == -1) {
    $('#sysCopy').remove();
}

if (roleArr.indexOf('上传') == -1) {
    $('.upload-ff').remove();
}
if (roleArr.indexOf('新建') == -1) {
    $('.create_file').remove();
}
if (roleArr.indexOf('下载') == -1) {
    $('.mod-nav .download').remove();
}
if (roleArr.indexOf('移动') == -1) {
    $('.mod-nav .move').remove();
}
if (roleArr.indexOf('重命名') == -1) {
    $('.mod-nav .rename').remove();
}
if (roleArr.indexOf('删除') == -1) {
    $('.mod-nav .delete').remove();
}
if (roleArr.indexOf('设置属性') == -1) {
    $('.nav-prop').remove();
}
if (roleArr.indexOf('文档审核') == -1) {
    $('.nav-audit').remove();
}
if (roleArr.indexOf('打印二维码') == -1) {
    $('.nav-printCode').remove();
}

if (roleArr.indexOf('合并') == -1) {
    $('.nav-combind').remove();
}

if (roleArr.indexOf('导入台账') == -1) {
    $('.nav-export').remove();
}

$('#divPassword').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    buttons: {
        "保存": function () {
            repasswordSubmit()
        },
        "取消": function () {
            $('#divPassword').dialog("close");
        }
    }
})

$('#passSet').on('mousedown', function (ev) {
    ev.stopPropagation();
    $('.act-item-txt').parent().toggleClass('act');
    $('.mod-bubble-menu-info').hide()
    tools.removeEvent(document, 'mousedown', userNameChange)
    // userName.parentNode.className = isAccClass.slice(0, isAccClass.indexOf(' act '));
    // showPanel.style.display = 'none';
    $('#divPassword').dialog("open");

})


function repasswordSubmit() {
    createOperate('重置密码')
    var oldpassword = $('#oldPsd').val().trim();
    var newPsd = $('#newPsd').val().trim();
    var newPsd2 = $('#newPsd2').val().trim();
    var account = $.cookie('account');
    var uid = $.cookie('accountId');
    if (newPsd.length < 6) {
        showTips('err', '密码不能少于6个字符');
        return;
    }
    oldpassword = hex_md5(oldpassword);
    newPsd = hex_md5(newPsd)
    newPsd2 = hex_md5(newPsd2);

    if (newPsd != newPsd2) {
        showTips('err', '两次输入密码不一致');
        return;
    }

    local_api._repassword(account, oldpassword, newPsd, uid, $.cookie('appkey'), function (res) {
        console.log(res)
        if (res.status == 0) {
            showTips('ok', '修改密码成功，请重新登陆');
            // setTimeout(() => { location.href = '/logout' }, 500)
            setTimeout(function () { location.href = '/logout' }, 500)
        }
    })

}


$('.weiyun-content').show();


function createOperate(operate) {
    var create_json = {
        uid: $.cookie('accountId'),
        account: $.cookie('account'),
        name: $.cookie('name'),
        operate: operate,
        createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
        u_path: $.cookie('tree_path')
    }
    local_api._create('syslog', create_json, $.cookie('appkey'), function (res) { console.log(res) })
}

tools.addEvent(tools.$('#search')[0], 'focus', function () {
    var searchBar = tools.$('#_search_bar')[0];
    tools.addClass(searchBar, 'focus')
})
tools.addEvent(tools.$('#search')[0], 'blur', function () {
    var searchBar = tools.$('#_search_bar')[0];
    // setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)
    setTimeout(function () { tools.removeClass(searchBar, 'focus') }, 200)

})

window.createOperate = createOperate
window.repasswordSubmit = repasswordSubmit
window.userNameChange = userNameChange
window.showTips = showTips
window.roleArr = roleArr
window.showPanel = showPanel
window.userName = userName