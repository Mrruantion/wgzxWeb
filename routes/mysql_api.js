var hex_md5 = require('../lib/md5');
var fs = require('fs');
var fsHandle = require('./fsHandle').fsHandle;

var exec = require('child_process').exec;
var xlsx = require('node-xlsx');




var rest = function (req, res) {
    var query = req.query;
    // var body = req.body;
    var method = '', table = '', _fsHandle, table2;
    var islogin = req.session.isLogin || false;
    if (query['method']) {
        _fsHandle = query['method'].split('.')[2];
        table2 = _fsHandle;
        method = query['method'].split('.')[1];
        table = query['method'].split('.')[0]
    }
    var access_token = query['access_token']
    if (islogin) {
        if (access_token == req.session.app_key) {
            switch (method) {
                case 'sys': sysCopy(req, res, table) //数据库备份
                    break;
                case 'fs': fsHandle(req, res, _fsHandle); //操作文件
                    break;
                case 'get': _get(req, res, table); //获取单列数据
                    break;
                case 'list': _list(req, res, table); //获取多列数据
                    break;
                case 'vlist': _vagueList(req, res, table);
                    break;
                case 'delete': _delete(req, res, table); //删除数据
                    break;
                case 'deleteUnion': unionDelete(req, res, table, table2); //删除数据
                    break;
                case 'create': _create(req, res, table); //创建数据
                    break;
                case 'createBatch': createBatch(req, res, table); //创建多个数据
                    break
                case 'update': update(req, res, table); //更新数据
                    break;
                case 'createColumns': addcolumns(req, res, table); //创建多个表字段
                    break;
                case 'createColumn': addcolumn(req, res, table); //创建单个字段
                    break;
                case 'dropColumn': dropColumn(req, res, table);
                    break;
                case 'createTable': createTable(req, res, table); //创建表
                    break;
                case 'dropTable': dropTable(req, res, table); //删除表
                    break;
                case 'getTable': getTable(req, res, table); //获取数据库表
                    break;
                case 'editTableColumns': editTableColumns(req, res, table);
                    break;
                case 'getColumns': showColumns(req, res, table); //获取表字段
                    break;
                case 'union': tableUnion(req, res, table, table2); //两表查询
                    break;
                case 'login': login(req, res, 'user'); //登录
                    break;
                case 'repassword': repassord(req, res, 'user'); //重新设置密码
                    break;
                default:
                    break;
            }
        } else {
            res.send({ status: 301, message: 'appkey incorrect!' })
        }
    } else {
        if (method == 'login') {
            login(req, res, 'user')
        }
    }
}

function _get(req, res, table) {
    // console.log(req.___dirname)
    var query = req.query;
    var fields, query_json = {};
    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'fields': fields = query[i].trim() || '*'
                break;
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    var sql = `select ${fields} from ${table} ${wUrl(query_json)} limit 0,1`;
    // res.send({ sql: sql })
    db.query(sql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
            result.status = err.errno;
        }
        try {
            result.status = 0;
            result.data = row[0] || null;
            // res.json(result)
        } catch (err) {
            result.status = -1;
            // res.json(result)
        }
        res.json(result)
    })
}



function _vagueList(req, res, table, callback) {
    var query = req.query;
    var obj = req.body;
    var sorts, limit, fields, page_no, query_json = {};
    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'sorts': sorts = query[i].trim()
                break;
            case 'limit': limit = query[i]
                break;
            case 'fields': fields = query[i].trim() || '*'
                break;
            case 'page_no': page_no = query[i];
                break;
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    Object.assign(query_json, obj)
    // var sql = 'select * from ' + table + ' where ' + condition;
    var countsql = `select count(*) from ${table} ${wvUrl(query_json)}`
    console.log(countsql)

    var sorts = sorts ? sorts.split('|') : [];
    var sortstr = '';
    sorts.forEach(ele => {
        if (ele) {
            if (ele.indexOf('-') > -1) {
                var s = ele.slice(ele.indexOf('-') + 1)

                if (table == 'docProp' && s == '存放状态') {
                    sortstr += 'convert(docProp.存放状态 using gbk) collate gbk_chinese_ci desc,'
                } else {
                    sortstr += s + ' desc,'
                }
            } else {
                if (table == 'docProp' && ele == '存放状态') {
                    sortstr += 'convert(docProp.存放状态 using gbk) collate gbk_chinese_ci asc,'
                } else {
                    sortstr += ele + ' asc,'
                }

            }
        }
    })
    sortstr = sortstr.slice(0, sortstr.length - 1)


    db.query(countsql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
        }
        try {
            result.total = row[0]['count(*)'];
            var querySql = `select ${fields} from ${table} ${wvUrl(query_json)} ${sortstr ? `order by ${sortstr}` : ''} ${limit > 0 ? `limit ${(page_no - 1) * limit},${limit}` : ''}`
            db.query(querySql, function (err, rows) {
                if (err) {
                    result.message = err.message;
                    result.status = err.errno;
                } else {
                    try {
                        result.status = 0;
                        result.data = rows;
                    } catch (errors) {
                        result.status = err.errno;
                    }
                }
                if (callback) {
                    callback(result)
                } else {
                    res.json(result)
                }

            })
        } catch (error) {
            result.status = err.errno;
            if (callback) {
                callback(result)
            } else {
                res.json(result)
            }

        }
    })
}

function _vagueList2(req, res, table, otherquery, callback) {
    var query = req.query;
    var obj = req.body;
    var sorts, limit, fields, page_no, query_json = {};
    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'sorts': sorts = query[i].trim()
                break;
            case 'limit': limit = query[i]
                break;
            case 'fields': fields = query[i].trim() || '*'
                break;
            case 'page_no': page_no = query[i];
                break;
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    Object.assign(query_json, obj)
    var otherWhere = wUrl(otherquery);
    var otherand = '';
    var countsql = `select count(*) from ${table} ${wvUrl(query_json)}`
    if (otherWhere.length > 7) { //otherquery存在时
        otherand = otherWhere.replace('where', 'and');
        countsql += otherand
    }
    console.log(countsql)

    var sorts = sorts ? sorts.split('|') : [];
    var sortstr = '';
    sorts.forEach(ele => {
        if (ele) {
            if (ele.indexOf('-') > -1) {
                var s = ele.slice(ele.indexOf('-') + 1)

                if (table == 'docProp' && s == '存放状态') {
                    sortstr += 'convert(docProp.存放状态 using gbk) collate gbk_chinese_ci desc,'
                } else {
                    sortstr += s + ' desc,'
                }
            } else {
                if (table == 'docProp' && ele == '存放状态') {
                    sortstr += 'convert(docProp.存放状态 using gbk) collate gbk_chinese_ci asc,'
                } else {
                    sortstr += ele + ' asc,'
                }

            }
        }
    })
    sortstr = sortstr.slice(0, sortstr.length - 1)


    db.query(countsql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
        }
        try {
            result.total = row[0]['count(*)'];
            var querySql = `select ${fields} from ${table} ${wvUrl(query_json)} ${sortstr ? `order by ${sortstr}` : ''} ${limit > 0 ? `limit ${(page_no - 1) * limit},${limit}` : ''}`
            if (otherWhere.length > 7) { //otherquery存在时
                querySql = `select ${fields} from ${table} ${wvUrl(query_json)} ${otherand} ${sortstr ? `order by ${sortstr}` : ''} ${limit > 0 ? `limit ${(page_no - 1) * limit},${limit}` : ''}`
            }
            console.log(querySql)
            db.query(querySql, function (err, rows) {
                if (err) {
                    result.message = err.message;
                    result.status = err.errno;
                } else {
                    try {
                        result.status = 0;
                        result.data = rows;
                    } catch (errors) {
                        result.status = err.errno;
                    }
                }
                if (callback) {
                    callback(result)
                } else {
                    res.json(result)
                }

            })
        } catch (error) {
            result.status = err.errno;
            if (callback) {
                callback(result)
            } else {
                res.json(result)
            }

        }
    })
}



function _list(req, res, table, callback) {
    var query = req.query;
    var sorts, limit, fields, page_no, query_json = {};

    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'sorts': sorts = query[i].trim()
                break;
            case 'limit': limit = query[i]
                break;
            case 'fields': fields = query[i].trim() || '*'
                break;
            case 'page_no': page_no = query[i];
                break;
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    var sorts = sorts ? sorts.split('|') : [];
    var sortstr = '';
    sorts.forEach(ele => {
        if (ele) {
            if (ele.indexOf('-') > -1) {
                var s = ele.slice(ele.indexOf('-') + 1)

                if (table == 'document' && s == 'name') {
                    sortstr += 'convert(document.name using gbk) collate gbk_chinese_ci desc,'
                } else {
                    sortstr += s + ' desc,'
                }
            } else {
                if (table == 'document' && ele == 'name') {
                    sortstr += 'convert(document.name using gbk) collate gbk_chinese_ci asc,'
                } else {
                    sortstr += ele + ' asc,'
                }

            }
        }
    })
    sortstr = sortstr.slice(0, sortstr.length - 1)

    // var sql = 'select * from ' + table + ' where ' + condition;
    var countsql = `select count(*) from ${table} ${wUrl(query_json)}`
    console.log(countsql)
    db.query(countsql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
        }
        try {
            result.total = row[0]['count(*)'];
            var querySql = `select ${fields} from ${table} ${wUrl(query_json)} ${sortstr ? `order by ${sortstr}` : ''} ${limit > 0 ? `limit ${(page_no - 1) * limit},${limit}` : ''}`
            // result.sql = querySql
            db.query(querySql, function (err, rows) {
                if (err) {
                    result.message = err.message;
                    result.status = err.errno;
                } else {
                    try {
                        result.status = 0;
                        result.data = rows;
                    } catch (errors) {
                        result.status = err.errno;
                    }
                }
                if (callback) {
                    callback(result)
                } else {
                    res.json(result)
                }

            })
            // result.sql = querySql
        } catch (error) {
            result.status = err.errno;
            if (callback) {
                callback(result)
            } else {
                res.json(result)
            }

        }
    })
}


//两表左联查询
function tableUnion(req, res, table, table2, callback) {
    var query = req.query;
    var sorts, limit, fields, page_no, query_json = {}, joinCdn, exportTableheard;

    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'sorts': sorts = query[i].trim()
                break;
            case 'limit': limit = query[i]
                break;
            case 'fields': fields = query[i].trim() || '*'
                break;
            case 'page_no': page_no = query[i];
                break;
            case 'joinCdn': joinCdn = query[i];
                break;
            case 'exportTableheard': exportTableheard = query[i];
                break;
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    var sorts = sorts ? sorts.split('|') : [];
    var sortstr = '';
    sorts.forEach(ele => {
        if (ele.indexOf('-') > -1) {
            var s = ele.slice(ele.indexOf('-') + 1)
            // sortstr += s + ' desc,'
            sortstr += `convert(${s} using gbk) collate gbk_chinese_ci` + ' desc,'
        } else {
            // sortstr += ele + ' asc,'
            sortstr += `convert(${ele} using gbk) collate gbk_chinese_ci` + ' asc,'
        }
    })
    sortstr = sortstr.slice(0, sortstr.length - 1)

    // var sql = 'select * from ' + table + ' where ' + condition;
    var countsql = `select count(*) from ${table} ${wUrl(query_json)}`
    console.log(countsql)
    db.query(countsql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
        }
        try {
            result.total = row[0]['count(*)'];
            var querySql = `select ${fields} from ${table} left join ${table2} on ${joinCdn} ${wUrl(query_json)} ${sortstr ? `order by ${sortstr}` : ''} ${limit > 0 ? `limit ${(page_no - 1) * limit},${limit}` : ''}`
            // result.sql = querySql
            db.query(querySql, function (err, rows) {
                if (err) {
                    result.message = err.message;
                    result.status = err.errno;
                } else {
                    try {
                        result.status = 0;
                        result.data = rows;
                        exportTableheard != '' ? exportXlsx(rows, exportTableheard, req) : '';
                    } catch (errors) {
                        result.status = -1;
                        result.err = errors
                    }
                }
                if (callback) {
                    callback(result)
                } else {
                    res.json(result)
                }

            })
            // result.sql = querySql
        } catch (error) {
            if (callback) {
                callback(result)
            } else {
                result.status = err.errno;
                res.json(result)
            }

        }
    })
}

function unionDelete(req, res, table1, table2) {
    var query = req.query;
    var db = req.con;
    var joinLeft = "";
    var query_json = {};

    for (var i in query) {
        switch (i) {
            case 'access_token':
            case 'method':
                break;
            case 'joinCdn': joinLeft = query[i];
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    var condition = wUrl(query_json)

    let sql = `DELETE ${table1},${table2} from ${table1} LEFT JOIN ${table2} on ${joinLeft} ${condition}`
    db.query(sql, function (err, row) {
        console.log(err, 'err')
        var data = {};
        if (err) {
            data.status = err.errno;
            data.message = err.message;
        } else {
            data.status = 0;
        }
        res.json(data);
    })
}

function _delete(req, res, table) {
    var query = req.query;
    var db = req.con;
    var query_json = {};
    for (var i in query) {
        switch (i) {
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    var condition = wUrl(query_json)
    var sql = 'delete from ' + table + condition;
    db.query(sql, function (err, row) {
        console.log(err, 'err')
        var data = {};
        if (err) {
            data.status = err.errno;
            data.message = err.message;
        } else {
            data.status = 0;
        }
        res.json(data);
    })
}

function _create(req, res, table) {
    var query = req.query;
    var body = req.body;
    var query_json = {};
    var db = req.con;
    var fields = [], fieldsValue = '';
    for (var i in query) {
        switch (i) {
            case 'access_token':
            case 'method':
                break;
            default:
                query_json[i] = query[i];
                break;
        }
    }
    Object.assign(query_json, body);

    for (var o in query_json) {
        fields.push(o);
        fieldsValue += ' "' + query_json[o] + '" , '
    }
    fieldsValue = fieldsValue.slice(0, -2)
    var createSql = `insert into ${table} ( ${fields.join(',')} ) value ( ${fieldsValue} )`
    db.query(createSql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
            result.status = err.errno;
            res.json(result)
        } else {
            res.json({ status: 0, id: row.insertId })
        }
    })
}

function createBatch(req, res, table) {
    var query = req.query;
    var body = JSON.parse(req.body.data).data;
    var db = req.con;
    var fields = [], fieldsValue = '', fieldsValues = [];
    for (var i = 0; i < body.length; i++) {
        fieldsValue = '';
        for (var o in body[i]) {
            if (i == 0) {
                fields.push(o)
            }
            fieldsValue += ' "' + body[i][o] + '" , '
        }
        fieldsValue = fieldsValue.slice(0, -2);
        fieldsValues.push(fieldsValue)
    }
    fieldsValue = '';
    fieldsValues.forEach(ele => {
        fieldsValue += `( ${ele} ),`
    })
    fieldsValue = fieldsValue.slice(0, -1)
    var updateBatchSql = `INSERT INTO ${table} (${fields.join(',')}) VALUES ${fieldsValue}`
    console.log(updateBatchSql)
    db.query(updateBatchSql, function (err, row) {
        var result = {};
        if (err) {
            result.message = err.message;
            result.status = err.errno;
        } else {
            result.status = 0;
            result.change = row.affectedRows;
        }
        res.json(result)
    })
}

function update(req, res, table) {
    var query = req.query;
    var query_json = {};
    var update_json = {};
    var db = req.con;
    for (var i in query) {
        switch (i) {
            case 'method':
            case 'access_token':
                break;
            default:
                if (i.indexOf('_') == 0) {
                    var _i = i.slice(i.indexOf('_') + 1)
                    query_json[_i] = query[i];
                } else {
                    update_json[i] = query[i];
                }
                break;
        }
    }
    var set = ''
    for (var o in update_json) {
        set += o + ' = "' + update_json[o] + '" , '
    }
    set = set.slice(0, -2);

    var updateSql = `update ${table} set ${set}${wUrl(query_json)}`
    db.query(updateSql, function (err, row) {
        var data = {};
        if (err) {
            // data.status = -1
            data.message = err.message;
            data.status = err.errno;
        } else {
            data.status = 0;
            data.change = row.changedRows;
        }
        res.json(data)
    })

}

function showColumns(req, res, table) {
    var db = req.con;
    var sql = `SHOW FULL COLUMNS FROM ${table}`;
    db.query(sql, function (err, row) {
        res.send({ err, row })
    })
}

//添加字段
function addcolumn(req, res, table) {
    var query = req.body;
    // res.send(query);
    var db = req.con;
    var alertUrl = `alter table ${table} add ${query.name} varchar(${query.size})`
    db.query(alertUrl, function (err, row) {
        // if(err){
        //     res.send({})
        // }
        res.send({ err: err, row: row })
    })
}





//批量创建字段
function addcolumns(req, res, table) {
    // var body = req.body;
    var body = JSON.parse(req.body.data).data;
    var db = req.con;
    var alertUrl = `alter table ${table}`
    // add tel1 varchar(20),add sex1 varchar(20)
    body.forEach((ele, i) => {
        alertUrl += ` add ${ele.name} varchar(${ele.size}) ,`
    })
    alertUrl = alertUrl.slice(0, -1);
    db.query(alertUrl, function (err, row) {
        res.send({ err: err, row: row })
    })
    // body.sql = alertUrl;
    // var data = { data: body, sql: alertUrl }

    // console.log(body)
    // res.send(data)
}


//删除表字段
function dropColumn(req, res, table) {
    var query = req.body
    var db = req.con
    var dropString = `ALTER TABLE ${table} DROP COLUMN ${query.name} `
    db.query(dropString, function (err, row) {
        res.send({ err: err, row: row })
    })

}


//创建表格
function createTable(req, res, table) {
    var query = req.body
    var db = req.con
    var columns = JSON.parse(query.data)
    var columnsString = ''
    columns.forEach(e => {
        if (e.type == 'datetime') {
            columnsString += `\`${e.name}\` ${e.type} DEFAULT NULL COMMENT '${e.comment}',`
        } else {
            columnsString += `\`${e.name}\` ${e.type}(${e.size}) DEFAULT NULL COMMENT '${e.comment}',`
        }

    })

    var createSql = `CREATE TABLE \`${table}\` (\`sid\` int(11) NOT NULL AUTO_INCREMENT,${columnsString} PRIMARY KEY (\`sid\`), UNIQUE KEY \`fid\` (\`fid\`)) ENGINE=InnoDB AUTO_INCREMENT=10665 DEFAULT CHARSET=utf8`
    // console.log(createSql)
    db.query(createSql, function (err, row) {
        res.send({ err: err, row: row })
    })
}



//删除表
function dropTable(req, res, table) {
    var db = req.con
    var dropString = `DROP TABLE IF EXISTS \`${table}\`;`
    db.query(dropString, function (err, row) {
        res.send({ err: err, row: row })
    })
}

//获取数据库表
function getTable(req, res, table) {
    // let sqlName = req.query.sqlName
    var db = req.con;
    let queryLink = `select table_name from information_schema.tables where table_schema='${table}'`
    db.query(queryLink, function (err, row) {
        res.send({ err: err, row: row })
    })
}

function editTableColumns(req, res, table) {
    var db = req.con
    var query = req.query
    // if(query.type == 1){//重命名
    var oldColumn = query.oldColumn;
    var newColumn = query.newColumn
    var preColumn = query.preColumn
    // }else { //排序

    // }
    let queryString = `ALTER TABLE \`${table}\` CHANGE COLUMN \`${oldColumn}\` \`${newColumn}\`  ${query.size} CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL AFTER \`${preColumn}\`;`
    db.query(queryString, function (err, row) {
        res.send({ err: err, row: row })
    })
}


function login(req, res, table) {
    var query = req.query;
    var db = req.con;
    var password = query.password;
    var account = query.account;
    var queryLink = `select * from ${table} where account = '${account}' and password = '${password}' `
    db.query(queryLink, function (err, row) {
        if (row.length) {
            req.session.isLogin = true;
            req.session.app_key = hex_md5.hex_md5(getString(10));

            req.session.user = row[0]
            // if(row[0].tree_path == ",26,1"){
            //     req.session.user.titleName = "福永街道电子档案管理系统"
            // }else if(row[0].tree_path == ",26,1,2") {
            //     req.session.user.titleName = "福永街道安监办电子档案管理系统"
            // }else if(row[0].tree_path == ",26,1,29") {
            //     req.session.user.titleName = "福永街道网格综合管理中心电子档案管理系统"
            // } else {
            //     req.session.user.titleName = "宝文综合电子档案管理系统"
            // }
            req.session.user.titleName = row[0].titleName || "宝文综合电子档案管理系统"
            var opt = {
                status: 0,
                data: req.session
            }
            res.json(opt)

        } else {
            res.end(JSON.stringify({ status: 404 }))
        }
    })
}

//重置密码
function repassord(req, res, table) {
    var query = req.query;
    var db = req.con;
    var uid = query.uid
    var password = query.password;
    var newPsd = query.newPsd;
    var account = query.account;
    var queryLink = `select * from ${table} where account = '${account}' and password = '${password}' and id = ${uid} `;
    db.query(queryLink, function (err, row) {
        if (row.length) {
            var updateLink = `update ${table} set password = '${newPsd}' where id = ${uid} and account = '${account}'`
            db.query(updateLink, function (err, row) {
                if (!err) {
                    res.send({ status: 0, message: '密码修改成功' })
                }
            })
        } else {
            res.send({ status: -1, message: '密码错误' })
        }
    })
}



function sysCopy(req, res, table) {
    // var name = new Date().format
    // var db = req.con;
    var query = req.query;
    // var sql = `select * from ${table} where id = ${query.id}`
    // db.query(sql, function (err, rows) {
    //     var row = rows[0];
    var os = require('os');
    os.tmpdir()

    var path = os.tmpdir() + '/' + query.name;

    // if (row) {
    // var str = `mysqldump --single-transaction --flush-logs --master-data=2 -uroot -pdoccloud2018 docdb > ${path}`
    var str = `mysqldump -hlocalhost  -P3306 -uroot -pdoccloud2018 docdb >  ${path}`

    exec(str, function (err, stdout, srderr) {
        console.log(err, stdout, srderr)
        if (err) {

            res.send({ status: -1, err, stdout, srderr })
        } else {
            res.send({ status: 0, path: path })
        }

    })
    // }
    // })


}





function wUrl(query_json) {
    var str = ' where ';
    var condition = '';
    var same_Con1 = [];
    for (var o in query_json) {
        var eo = query_json[o].toString();
        if (eo.includes('|')) {
            same_Con1 = eo.split('|');
            var same_sq = '';
            same_Con1.forEach((e, i) => {
                if (i == 0) {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '<>"' + e + '" or '
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '>="' + e + '" or '
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + '>"' + e + '" or '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '<="' + e + '" or '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + '<"' + e + '" or '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + ' like "%' + e + '%" or '
                    } else {
                        same_sq += '(' + o + '="' + e + '" or '
                    }
                } else if (i == same_Con1.length - 1) {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<>"' + e + '" ) and '
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '>="' + e + '" ) and '
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '>"' + e + '" ) and '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<="' + e + '" ) and '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '<"' + e + '" ) and '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += o + ' like "%' + e + '%" ) and '
                    } else {
                        same_sq += o + '="' + e + '" ) and '
                    }
                } else {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<>"' + e + '" or ';
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '>="' + e + '" or ';
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '>"' + e + '" or '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<="' + e + '" or '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '<"' + e + '" or '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += o + ' like "%' + e + '%" or '
                    } else {
                        same_sq += o + '="' + e + '" or '
                    }
                }

            });
            condition += same_sq;
        } else if (eo.includes('&')) {
            same_Con1 = eo.split('&');
            var same_sq = '';
            same_Con1.forEach((e, i) => {
                if (i == 0) {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '<>"' + e + '" and '
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '>="' + e + '" and '
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + '>"' + e + '" and '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += '(' + o + '<="' + e + '" and '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + '<"' + e + '" and '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += '(' + o + ' like "%' + e + '%" and '
                    } else {
                        same_sq += '(' + o + '="' + e + '" and '
                    }
                } else if (i == same_Con1.length - 1) {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<>"' + e + '" ) and '
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '>="' + e + '" ) and '
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '>"' + e + '" ) and '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<="' + e + '" ) and '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '<"' + e + '" ) and '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += o + ' like "%' + e + '%" ) and '
                    } else {
                        same_sq += o + '="' + e + '" ) and '
                    }
                } else {
                    if (e.includes('<>')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<>"' + e + '" or ';
                    } else if (e.includes('>=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '>="' + e + '" or ';
                    } else if (e.includes('>')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '>"' + e + '" or '
                    } else if (e.includes('<=')) {
                        e = e.slice(2, e.length);
                        same_sq += o + '<="' + e + '" or '
                    } else if (e.includes('<')) {
                        e = e.slice(1, e.length);
                        same_sq += o + '<"' + e + '" or '
                    } else if (e.includes('^')) {
                        e = e.slice(1, e.length);
                        same_sq += o + ' like "%' + e + '%" or '
                    } else {
                        same_sq += o + '="' + e + '" or '
                    }
                }

            });
            condition += same_sq;
        } else {
            var e = eo;
            if (e.includes('<>')) {
                e = e.slice(2, e.length);
                condition += o + '<>"' + e + '" and ';
            } else if (e.includes('>=')) {
                e = e.slice(2, e.length);
                condition += o + '>="' + e + '" and ';
            } else if (e.includes('>')) {
                e = e.slice(1, e.length);
                condition += o + '>"' + e + '" and ';
            } else if (e.includes('<=')) {
                e = e.slice(2, e.length);
                condition += o + '<="' + e + '" and ';
            } else if (e.includes('<')) {
                e = e.slice(1, e.length);
                condition += o + '<"' + e + '" and ';
            } else if (e.includes('^')) {
                e = e.slice(1, e.length);
                condition += o + ' like "%' + e + '%" and ';
            } else {
                condition += o + '="' + e + '" and ';
            }
        }
    }
    condition = condition.slice(0, -4);
    str += condition;
    return str;
}


function wvUrl(query_json) {
    var str = ' where (';
    var condition = '';
    for (var o in query_json) {
        var eo = query_json[o].toString();
        var e = eo;
        condition += o + ' like "%' + e + '%" or ';
    }
    condition = condition.slice(0, -4);
    str += condition + ')';
    return str;
}


function getString(number) {
    var stringArr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    stringArr = stringArr.split('');
    var string = '';
    for (var i = 0; i < number; i++) {
        string += stringArr[parseInt(Math.random() * stringArr.length)]
    }
    return string;
}


function exportXlsx(data, exportTablehead, req) {
    // var fs = require('fs');
    console.log(exportTablehead)
    var _exportTablehead = JSON.parse(exportTablehead)
    var propname = [], propvalue = [];
    for (var o in _exportTablehead) {
        propname.push(o);
        propvalue.push(_exportTablehead[o]);
    }
    var ceobj = { 1: '左', 0: '右' };
    var allArr = [];
    data.forEach((ele, j) => {
        ele._id = j;
        ele.position = ele.qnum && ele.lnum ? (ele.qnum + '区' + ele.lnum + '列' + ceobj[parseInt(ele.ce)] + '侧' + ele.jnum + '节' + ele.cnum + '层' + ele.bnum + '本') : null;
        var _thisarr = [];
        for (var o in ele) {
            var _i = propname.indexOf(o);
            _i > -1 ? _thisarr[_i] = ele[o] : ''
        }
        allArr.push(_thisarr)
    })
    console.log(allArr)
    allArr.unshift(propvalue)
    // var data = [propvalue, [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
    var buffer = xlsx.build([{ name: "sheet1", data: allArr }]);
    var path = req.___dirname + '/public/b.xlsx'
    fs.writeFileSync(path, buffer, 'binary');
}


module.exports = {
    rest: rest,
    _vagueList: _vagueList,
    wUrl: wUrl,
    wvUrl: wvUrl,
    _list: _list,
    tableUnion: tableUnion,
    _vagueList2: _vagueList2
}