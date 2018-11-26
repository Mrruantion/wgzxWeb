$(document).ready(function () {


    var account = localStorage.getItem("account")
    var password = localStorage.getItem('password');

    $('#account').val(account)
    $('#password').val(password)

    $('#submit').on('click', function () {
        var account = $('#account').val();
        var password = $('#password').val();
        // if($('#isjz'))
        if($('#isjz').is(':checked')){
            localStorage.setItem("account",account)
            localStorage.setItem("password",password)
        }else {
            localStorage.setItem("account",'')
            localStorage.setItem("password",'')
        }
        if (account == '') {
            return;
        }
        if (password == '') {
            return;
        }
        password = hex_md5(password);
        local_api._login(account, password, function (res) {
            if (res.status == 0) {
                $.cookie('account', res.data.user.account);
                $.cookie('name', res.data.user.name);
                $.cookie('accountId', res.data.user.id);
                $.cookie('appkey', res.data.app_key);
                $.cookie('uid', res.data.user.id);
                $.cookie('pId', res.data.user.pid);
                $.cookie('tree_path', res.data.user.tree_path);
                $.cookie('role', res.data.user.role)
                $.cookie("userType",res.data.user.userType)

                local_api._get("document",{u_path:res.data.user.tree_path},"",res.data.app_key,function(docr){
                    console.log(docr,"docr")
                    $.cookie('docId', docr.data.id);
                    // debugger
                    var page = { '首页': '/summary', '目录': '/file', '检索': '/hightSearch', '用户管理': '/user' }
                    var roleArr = res.data.user.role ? res.data.user.role.split(',') : [];
                    var href = page[roleArr[0]] || '/logout';
                    location.href = href

                })
               
                // if( res.data.user.id == 5){
                //     location.href = '/hightSearch'
                // }else {
                //     location.href = '/summary'
                // }

            } else {
                alert('账号或密码不正确，请输入正确的账号和密码！')
            }

            console.log(res)
        })

    })


    $(".inset input").keypress(function (e) {
        if (e.which == 13) {// 判断所按是否回车键  
            // console.log(e)
            var inputs = $(".inset input"); // 获取表单中的所有输入框  
            var idx = inputs.index(this); // 获取当前焦点输入框所处的位置  
            // console.log(idx)
            if (idx == inputs.length - 1) {// 判断是否是最后一个输入框  

                $('#submit').click()
            } else {
                inputs[idx + 1].focus(); // 设置焦点  
                inputs[idx + 1].select(); // 选中文字  
            }
            return false;// 取消默认的提交行为  
        }
    });

})