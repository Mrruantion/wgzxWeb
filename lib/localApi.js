var http = require("http");
var url = require("url");

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

var fileSize = function (size) {
    var size = parseFloat(size);
    // var reSize;
    if (isNaN(size)) {
        return '-'
    }
    if (size < 1024) {
        return size + 'B'
    } else if (size < (1024 * 1024)) {
        return (size / 1024).toFixed(2) + 'KB'
    } else if (size < (1024 * 1024 * 1024)) {
        return (size / 1024 / 1024).toFixed(2) + 'MB'
    } else {
        return (size / 1024 / 1024 / 1024).toFixed(2) + 'G'
    }
}

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

// var _get = function (path, callback) {
//     var obj = {
//         type: "GET", url: path, data: {}, success: function (obj) {
//             callback(obj);
//         }, error: function (obj) {
//             callback(null);
//         }
//     };
//     var datas = JSON.stringify(obj.data);
//     $.ajax({
//         url: obj.url,
//         type: obj.type,
//         dataType: "json",
//         data: obj.data,
//         async: true,
//         timeout: 30000,
//         success: obj.success,
//         error: obj.error
//     });
// };
// var _post = function (path, data, callback) {
//     var obj = {
//         type: "POST", url: path, data: data, success: function (obj) {
//             callback(obj);
//         }, error: function (obj) {
//             callback(obj);
//         }
//     };
//     var datas = JSON.stringify(obj.data);
//     $.ajax({
//         url: obj.url,
//         type: obj.type,
//         dataType: "json",
//         data: datas,
//         contentType: "application/json; charset=utf-8",
//         async: true,
//         timeout: 30000,
//         success: obj.success,
//         error: obj.error
//     });
// };
// var host = '127.0.0.1';
// var port = 8888;

function localApi() {
    this.path = '/rest?';
}
localApi.prototype.init = function () {
    this.path = '/rest?';
    this.sign_obj = {};
}

localApi.prototype._get = function (table, query_json, fields, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.get';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    // this.sign_obj.sign = this.sign();
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, function (obj) {
        callback(obj);
    });
}

localApi.prototype._list = function (table, query_json, fields, sorts, page_no, limit, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.list';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.limit = limit;
    this.sign_obj.page_no = page_no;
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, callback);

}
localApi.prototype._vlist = function (table, query_json, fields, sorts, page_no, limit, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.vlist';
    this.sign_obj.access_token = access_token;
    // for (var key in query_json) {
    //     this.sign_obj[key] = query_json[key];
    // }
    this.sign_obj.fields = fields;
    this.sign_obj.sorts = sorts;
    this.sign_obj.limit = limit;
    this.sign_obj.page_no = page_no;
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _post(path, query_json, callback);

}

localApi.prototype._delete = function (table, query_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.delete';
    this.sign_obj.access_token = access_token;
    for (var key in query_json) {
        this.sign_obj[key] = query_json[key];
    }
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, function (obj) {
        callback(obj);
    });
}

localApi.prototype._create = function (table, create_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.create';

    this.sign_obj.access_token = access_token;
    for (var key in create_json) {
        this.sign_obj[key] = create_json[key];
    }

    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, function (obj) {
        callback(obj);
    });
};

localApi.prototype._createPost = function (table, create_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.create';

    this.sign_obj.access_token = access_token;

    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _post(path, create_json, function (obj) {
        callback(obj);
    });
};

localApi.prototype._createBatch = function (table, create_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.createBatch';

    this.sign_obj.access_token = access_token;

    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _post(path, create_json, function (obj) {
        callback(obj);
    });
};

localApi.prototype._createColumn = function (table, create_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.createColumn';

    this.sign_obj.access_token = access_token;

    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _post(path, create_json, function (obj) {
        callback(obj);
    });
};

localApi.prototype._createColumns = function (table, create_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.createColumns';

    this.sign_obj.access_token = access_token;

    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _post(path, create_json, function (obj) {
        callback(obj);
    });
};

localApi.prototype._update = function (table, query_json, update_json, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.update';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    for (var key in query_json) {
        this.sign_obj["_" + key] = query_json[key];
    }
    for (var key in update_json) {
        this.sign_obj[key] = update_json[key];
    }
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, callback)
}

localApi.prototype.getTableColumns = function (table, access_token, callback) {
    this.init();
    this.sign_obj.method = table + '.getColumns';
    this.sign_obj.access_token = access_token;
    //this.sign_obj.cust_id = cust_id;
    // for (var key in query_json) {
    //     this.sign_obj["_" + key] = query_json[key];
    // }
    // for (var key in update_json) {
    //     this.sign_obj[key] = update_json[key];
    // }
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, callback)
}
localApi.prototype._login = function (account, password, callback) {
    this.init();
    this.sign_obj.method = 'user.login';
    this.sign_obj.account = account;
    this.sign_obj.password = password;
    var params = raw2(this.sign_obj);
    var path = this.path + params;
    _get(path, callback)
}

function _get(file_url, callback) {
    var result;
    // console.log(url.parse(file_url))
    var host = '127.0.0.1:' + (process.env.PORT || '15050');
    var _file_url = host +  file_url
    http.get(_file_url, function (res) {
        // console.log("Got response: " + res.statusCode);
        res.setEncoding('utf8');
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        res.on('end', function () {
            try {
                var resultObject = JSON.parse(responseString);
                result = resultObject;
            } catch (e) {
                result = responseString;
            }
            callback(result);
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
        var resultObject = {
            status_code: 0x1001,
            content: e.toString()
        };
        result = resultObject;
        callback(result);
    });
}

module.exports = localApi