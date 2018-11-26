var multer = require('multer');
var fs = require('fs')
var path = require('path');


function upload(paths) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(paths, 'thispath');
            var loadPath = req.query.path;
            loadPath = decodeURI(loadPath);
            var _path = paths + '/public/upload/' + decodeURI(loadPath);
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
            fs.readdir(_path, function (err, files) {
                if (err) {
                    mkdirs(_path, function (error) {
                        if (error) {
                            console.log(error)
                        }
                        cb(null, _path)
                    })
                } else {
                    cb(null, _path)
                }
            })
        },
        filename: function (req, file, cb) {
            console.log(file.stream)
            cb(null, file.fieldname)
        }
    })

    var upload = multer({ storage: storage });
    return upload
}
module.exports = upload;