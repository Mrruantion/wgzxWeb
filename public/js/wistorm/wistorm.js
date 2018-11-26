/**
 * Created with JetBrains WebStorm.
 * User: 1
 * Date: 14-1-2
 * Time: 下午4:38
 * test wistorm rest api
 *
 * 除了customer表有一些比较特殊的操作,比如登陆,注册,重置密码之外,
 * 大部分的数据表都具有create,update,delete,list,get五个通用操作, 根据数据表, 传入字段名key及字段值value即可实现相应操作.
 * create接口参数格式:
 *      新增参数: key=value, 比如cust_name=测试&address=测试
 * update接口参数格式:
 *      条件参数: _key=value, 比如_obj_id=1, 如果value为json对象,则 _key.field=value
 *      更新参数: 如果key的值为json对象,则更新对象中某字段的格式为: key.$.field=value
 *          一般更新: key=value, 比如obj_name=修改
 *          计数更新: key=+n或者-n, 比如read_count=+1, 计数加1;  read_count=-1, 计数减1,  由于转移的问题+号需传%2B
 *          数组更新: key=+value/json或者-value/json, 比如seller_ids=+1286, 新增1286, seller_id=-1286, 删除1286, 由于转移的问题+号需传%2B
 * delete接口参数格式:
 *      条件参数: key=value, 比如obj_id=1
 * get接口参数格式:
 *      条件参数: key=value, 比如obj_id=1
 *      fields: 返回字段, 格式为key1,key2,key3, 比如cust_id,cust_name
 * list接口参数格式:
 *      查询参数:
 *          一般格式: key=value
 *          模糊搜索: key=^value, 比如obj_name=^粤B1234
 *          比较搜索: key=>value, <value, <=value, >=value, <>value(不等于)
 *          时间段: key=begin_time@end_time, 比如create_time=2015-11-01@2015-12-01
 *          数组搜索: key=~[value]
 *          或搜索: key=value1|value2|value3|...|value, 每个值都支持以上各种搜索方式
 *      fields: 返回字段, 格式为key1,key2,key3, 比如cust_id,cust_name
 *      sorts: 排序字段, 格式为key1,key2,key3, 如果为倒序在字段名称前加-, 比如-key1,key2
 *      page: 分页字段, 一般为数据表的唯一ID
 *      min_id: 本页最小分页ID, 0表示不起作用
 *      max_id: 本页最大分页ID, 0表示不起作用
 *      limit: 返回数量, -1表示不限制返回数量, 开放接口limit最大值为100
 *
 * 访问信令access_token:
 *      除了个别接口, 大部分的接口是需要传入access_token, 开发者需要在登录之后保存access_token,
 *      之后在调用其他接口的时候传入, access_token的有效期为24小时, 过期之后需要重新获取.
 *
 * 开发者访问自定义表时需传入开发者devKey, 该key在注册成开发者的时候自动生成
 */
var API_URL = "http://wop-api.chease.cn"; //test
var _get = function (path, callback) {
    var obj = {
        type: "GET", url: path, data: {}, success: function (obj) {
            callback(obj);
        }, error: function (obj) {
            callback(null);
        }
    };
    var datas = JSON.stringify(obj.data);
    $.ajax({
        url: obj.url,
        type: obj.type,
        dataType: "json",
        data: obj.data,
        async: true,
        timeout: 30000,
        success: obj.success,
        error: obj.error
    });
};

var _post = function (path, data, callback) {
    var obj = {
        type: "POST", url: path, data: data, success: function (obj) {
            callback(obj);
        }, error: function (obj) {
            callback(obj);
        }
    };
    var datas = JSON.stringify(obj.data);
    $.ajax({
        url: obj.url,
        type: obj.type,
        dataType: "json",
        data: datas,
        contentType: "application/json; charset=utf-8",
        async: true,
        timeout: 30000,
        success: obj.success,
        error: obj.error
    });
    // ajax_function(obj);
    // $.post(path, data, callback);
};

var download = function (path, data, callback) {
    var url = path;
    var xhr = new XMLHttpRequest();
    var dataSting = JSON.stringify(data);

    xhr.open('POST', url, true);    // 也可以使用POST方式，根据接口

    xhr.responseType = "blob";  // 返回类型blob
    // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
    xhr.onload = function () {
        // 请求完成
        console.log(this)
        if (this.status === 200) {
            // 返回200
            callback(this.response)
        }
    };
    // 发送ajax请求
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(dataSting)
}


Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        if (k != 'sign') {
            if (typeof (args[k]) == 'object') {
                string += k + JSON.stringify(newArgs[k]);
            } else {
                string += k + newArgs[k];
            }
        }
    }
    return string;
};

// 产生url后面的拼接字符串
var raw2 = function (args) {
    var string = '';
    for (var k in args) {
        if (typeof (args[k]) == 'object') {
            string += '&' + k + '=' + encodeURIComponent(JSON.stringify(args[k]));
        } else {
            string += '&' + k + '=' + encodeURIComponent(args[k]);
        }
    }
    string = string.substr(1);
    return string;
};

// 调用API基础数据
function WiStormAPI(app_key, app_secret, format, v, sign_method, dev_key) {
    this.app_key = app_key;
    this.app_secret = app_secret;
    this.dev_key = dev_key;
    var timestamp = new Date();
    timestamp = timestamp.format("yyyy-MM-dd hh:mm:ss");
    this.timestamp = timestamp;
    this.format = format;
    this.v = v;
    this.sign_method = sign_method;
    this.method = "";
    this.sign_obj = {
        timestamp: timestamp,            //时间戳yyyy-mm-dd hh:nn:ss
        format: format,                  //返回数据格式
        app_key: app_key,                //app key
        v: v,                            //接口版本
        sign_method: sign_method         //签名方式
    };
}

WiStormAPI.prototype.sign = function () {
    var s = raw(this.sign_obj);
    var sign = hex_md5(encodeURI(this.app_secret + s + this.app_secret));
    sign = sign.toUpperCase();
    return sign;
};

WiStormAPI.prototype.init = function () {
    var timestamp = new Date();
    timestamp = timestamp.format("yyyy-MM-dd hh:mm:ss");
    this.timestamp = timestamp;
    this.sign_obj = {
        timestamp: timestamp,            	  //时间戳yyyy-mm-dd hh:nn:ss
        format: this.format,                  //返回数据格式
        app_key: this.app_key,                //app key
        v: this.v,                            //接口版本
        sign_method: this.sign_method         //签名方式
    };
};

// 注册
// 参数:
//    mobile: 手机(手机或者邮箱选其一)
//    email: 邮箱(手机或者邮箱选其一)
//    login_id: 微信登陆id
//    password: 加密密码(md5加密)
// 返回：
//    cust_id: 用户id
;

// 上传文件
// 参数:
// 返回：
//    cust_id: 用户id
WiStormAPI.prototype.upload = function (callbackurl) {
    this.init();
    this.sign_obj.method = 'wicare.file.upload';
    this.sign_obj.callbackurl = callbackurl;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = API_URL + "/router/rest?" + params;
    return path;
};


WiStormAPI.prototype.upload2=function(callback,file,updateProgress){
    this.init();
    this.sign_obj.method = 'wicare.file.upload';
	// OP.app_key=this.appKey;
	// Object.assign(OP,op);
	// OP.method="wicare.file.upload"; 
	this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var url = API_URL + "/router/rest?" + params;
	
	var oData = new FormData();
	oData.append("File",file,file.name);

	var oReq = new XMLHttpRequest();
	oReq.open("POST",url,true);
	
	if(updateProgress){
		oReq.upload.addEventListener("progress",function(event){
			if(event.lengthComputable){
			    var percentComplete = event.loaded / event.total;
			    updateProgress(percentComplete);
			}
		});
	}
	oReq.onload = function(oEvent) {
		if (oReq.status == 200) {
			var json;
			try{
				json=JSON.parse(oReq.responseText);
			}catch(e){
				//TODO handle the exception
				json=oReq.responseText;
			}
			callback(json);
		} else {
		  	callback("Error " + oReq.status + " occurred uploading your file.<br \/>");
		}
	};
	oReq.send(oData);
}
// 获取令牌
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
//      auth_type: 1 个人令牌, 2 企业令牌
// 返回：access_token: 访问令牌
//      valid_time: 有效时间
WiStormAPI.prototype.getToken = function (account, password, type, callback) {
    this.init();
    this.sign_obj.method = 'wicare.user.access_token';
    this.sign_obj.account = account;
    this.sign_obj.password = password;
    this.sign_obj.type = type;
    this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = API_URL + "/router/rest?" + params;
    _get(path, function (obj) {
        callback(obj);
    });
};

// 登陆测试
// 参数：account: 手机号码或者邮箱地址
//      passsword: md5(登陆密码)
// 返回：auth_code: api调用验证码
//      cust_id: 用户id


function d(str, pwd) {
    if (str == null || str.length < 8) {
        // alert("A salt value could not be extracted from the encrypted message because it's length is too short. The message cannot be decrypted.");
        return;
    }
    if (pwd == null || pwd.length <= 0) {
        // alert("Please enter a password with which to decrypt the message.");
        return;
    }
    var prand = "";
    for (var i = 0; i < pwd.length; i++) {
        prand += pwd.charCodeAt(i).toString();
    }
    var sPos = Math.floor(prand.length / 5);
    var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
    var incr = Math.round(pwd.length / 2);
    var modu = Math.pow(2, 31) - 1;
    var salt = parseInt(str.substring(str.length - 8, str.length), 16);
    str = str.substring(0, str.length - 8);
    prand += salt;
    while (prand.length > 10) {
        prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
    }
    prand = (mult * prand + incr) % modu;
    var enc_chr = "";
    var enc_str = "";
    for (var i = 0; i < str.length; i += 2) {
        enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255));
        enc_str += String.fromCharCode(enc_chr);
        prand = (mult * prand + incr) % modu;
    }
    return enc_str;
}

var _pwd = new Date(new Date().format('yyyy-MM-dd hh:mm:00')).getTime();
// var _secret = $.cookie('_secret');
// _secret = d(_secret, _pwd);
// var parts = _secret.split(',');
var dev_key = "59346d400236ab95e95193f35f3df6a4";
var app_key = "96a3e23a32d4b81894061fdd29e94319";
var app_secret = "565975d7d7d01462245984408739804d";

var wistorm_api = new WiStormAPI(app_key, app_secret, 'json', '2.0', 'md5', dev_key);
// var otherWistorm_api = new WiStormAPI(app_key, app_secret, 'json', '2.0', 'md5', dev_key);