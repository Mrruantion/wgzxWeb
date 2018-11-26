var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

exports.fsHandle = function (req, res, _fsHandle) {
    switch (_fsHandle) {
        case 'rename': rename(req, res);
            break;
        case 'delete': _delete(req, res);
            break;
        case 'combind': _combind(req, res);
            break;


    }
    // debugger;

}

function rename(req, res) {
    var query = req.body;
    var ___dirname = req.___dirname;
    var oldPath = ___dirname + '/public/upload/' + query.oldPath;
    var newPath = ___dirname + '/public/upload/' + query.newPath;
    var name = query.name;
    var type = query.type;

    // var oldPath = 'C:\\Users\\ruanjunguang\\Desktop\\新建文本文档(1).txt',
    // newPath = 'C:\\Users\\ruanjunguang\\Desktop\\新建文本文档(1)(1).txt';
    // fs.statSync('C:\\Users\\ruanjunguang\\Desktop\\新建文本文档(1).txt')
    if (type == 1) {//重命名
        fs.access(newPath, function (err) {
            var result = {}
            if (!err) {
                result.status = -2;
                result.message = '文件或文件夹已存在无法重命名';
                res.send(result)
            } else {
                // var finallyPath = newPath + name;
                // var finallyOldPath = oldPath + name;
                fs.access(oldPath, function (err) {
                    if (!err) {
                        fs.rename(oldPath, newPath, function (err) {
                            result = {}
                            if (err) {
                                console.log(err);
                                result.status = -1;
                                result.message = 'err';
                            } else {
                                result.status = 0;
                                result.message = 'ok';
                            }
                            res.send(result)
                        })
                    } else {
                        result = {};
                        result.status = 0;
                        result.message = 'ok';
                        res.send(result)
                    }

                })

            }
        })
    } else { //移动
        mkdirs(newPath, function () {
            var finallyPath = newPath + name;
            var finallyOldPath = oldPath + name;
            var newName = name;
            try {

                fs.access(finallyPath, function (err) {
                    if (err) {

                    } else {
                        newName = new Date().getTime() + name;
                        finallyPath = newPath + newName;

                    }
                    // if(err.code == 'ENOENT' ){

                    // }else {

                    // }
                    fs.rename(finallyOldPath, finallyPath, function (err) {
                        result = { name: newName }
                        if (err) {
                            result.status = -1;
                            result.message = err;
                        } else {
                            result.status = 0;
                            result.message = 'ok';
                        }
                        res.send(result)
                    })
                })
            } catch (err) {
                console.log(err)
            }

        })

    }
}


function _delete(req, res) {
    // var curPath = 'C:\\Users\\ruanjunguang\\Desktop\\新建文本文档(1)(1).txt';
    var ___dirname = req.___dirname;
    var path = req.body.curPath || 'nodletedir/'
    var curPath = ___dirname + '/public/upload/' + path;
    var result = {}
    try {
        // console.log(fs.existsSync(curPath),'psth')
        if (fs.existsSync(curPath)) {
            if (fs.statSync(curPath).isDirectory()) { // 删除文件夹
                deleteFolder(curPath, function () {
                    // console.log(1)
                    result.status = 0;
                    result.message = '文件已删除！';
                    res.send(result)
                }, curPath)
            } else {
                fs.unlink(curPath, function (err) {
                    result.status = 0;
                    result.message = '文件已删除！';
                    res.send(result)
                })
            }
        }else {
            result.status = 0;
            result.message = '文件已删除！';
            res.send(result)
        }
    } catch (error) {
        console.log(error)
        result.status = 0;
        result.message = '文件或文件夹不存在无法删除';
        res.send(result)
    }
}


function deleteFolder(path, callback, _path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath, callback, _path);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
        if (_path == path) {
            callback();
        }
    }
}


function mkdirs(dirname, callback) {
    fs.access(dirname, function (err) {
        if (err) {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        } else {
            callback();
        }
    });
}


function _combind(req, res) {
    var query = req.body;
    var cmdStr = 'pdftk '
    var deletePath = [];
    for (var o in query.input) {
        var input = req.___dirname + '/public/upload/' + query.input[o] + ' '
        deletePath.push(query.input[o])
        cmdStr += input
    }
    var output = req.___dirname + '/public/upload/' + query.output;
    cmdStr += 'cat output ' + output


    exec(cmdStr, function (err, stdout, srderr) {
        if (err) {
            res.send({ srderr, message: 'err', status: -1 })
        } else {
            combindDelete(req, deletePath, function () {
                res.send({ stdout, message: 'ok', status: 0 })
            })

        }
    });
}

function combindDelete(req, path, callback) {
    // if (Object.prototype.toString.call(path) == '[object Array]') {
    path.forEach((ele, i) => {
        // var curPath = ele;
        // console.log(path[i])
        var input = req.___dirname + '/public/upload/' + ele;

        fs.access(input, function (err) {
            if (err) {
                if (i == path.length - 1) {
                    callback(true)
                }
            } else {
                fs.unlink(input, function (err) {
                    if (i == path.length - 1) {
                        callback(true)
                    }
                })
            }
        })
    })
    // }
}