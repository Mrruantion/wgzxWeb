var express = require('express');
var router = express.Router();
var rest = require('./mysql_api');
var fs = require('fs');
var http = require('http')

// var localApi = require('../lib/localApi');
// var local_api = new localApi();

function checkIsRole(name, user) {
  var roleArr = user.role ? user.role.split(',') : [];
  return roleArr.indexOf(name) > -1
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect('/login')
});
router.get('/file', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('目录', req.session.user)) {
    res.render('fileManagement', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/hightSearch', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('检索', req.session.user)) {
    res.render('hightSearch', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})


router.get('/searchResult', function (req, res, next) {
  if (req.session.isLogin) {
    res.render('searchResult', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/summary', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('首页', req.session.user)) {
    res.render('summary', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/report', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('报表', req.session.user)) {
    res.render('report', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})
router.get('/sysCopy', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('系统备份', req.session.user)) {
    res.render('sysCopy', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/docshow', function (req, res, next) {
  if (req.session.isLogin) {
    console.log(req.query)
    var db = req.con;
    db.query(`select * from document where id = ${req.query.fileId || ''}`, function (err, row) {
      if (err) {
        res.send({ path: '/upload/404.pdf' })
      } else {
        if (row[0]) {
          var tree_path = row[0].tree_path.split(',');
          var json = { id: tree_path.join('|') };
          db.query(`select * from document ${rest.wUrl(json)}`, function (err, rows) {
            var path = '/upload/' + doc_path(rows, row[0].tree_path);
            res.send({ path: path })
            // fs.readFile(req.___dirname + '/public/upload/' + path, { encoding: 'binary' }, function (err, data) {
            //   console.log(err, data)
            //   if (err) {
            //     res.send('文件不存在')
            //   } else {
            //     res.end(data, 'binary')
            //   }
            // })
          })
        } else {
          res.send({ path: '/upload/404.pdf' })
        }
      }
    })
  } else {
    res.redirect('/login')
  }
})

router.get('/pdfview', function (req, res, next) {
  if (req.session.isLogin) {
    res.render('pdfView')
  } else {
    res.redirect('/login')
  }
})

router.get('/officeView', function (req, res, next) {
  if (req.session.isLogin) {
    res.render('officeView')
  } else {
    res.redirect('/login')
  }
})

function doc_path(docDatas, doc_paths) {
  var tArr = doc_paths.split(',').filter(e => e != '');
  var uploadPath = '';
  tArr.forEach((ele, i) => {
    docDatas.forEach(e => {
      if (ele == e.id) {
        if (i == tArr.length - 1) {
          // uploadPath += e.name
          if (e.type == 2) {
            uploadPath += (e.did||'') + e.name;
          } else {
            uploadPath += e.name;
          }
        } else {
          // uploadPath += e.name + '/'
          if (e.type == 2) {
            uploadPath += (e.did||'') + e.name + '/';
          } else {
            uploadPath += e.name + '/';
          }
        }
      }
    })
  })
  return uploadPath
}

router.get('/upload/*', function (req, res, next) {
  if (req.session.isLogin) {
    next();
  } else {
    res.redirect('/login')
  }
})

//将字符串转换成二进制形式，中间用空格隔开
// function strToBinary(str){
//   var result = [];
//   var list = str.split("");
//   for(var i=0;i<list.length;i++){
//       if(i != 0){
//           result.push(" ");
//       }
//       var item = list[i];
//       var binaryStr = item.charCodeAt().toString(2);
//       result.push(binaryStr);
//   }   
//   return result.join("");
// }

router.get('/position', function (req, res, next) {
  if (req.session.isLogin) {
    res.render('position', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/user', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('用户管理', req.session.user)) {
    res.render('user', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})

router.get('/login', function (req, res, next) {
  req.session.isLogin = false;
  res.render('login')
})

router.get('/logout', function (req, res, next) {
  req.session.isLogin = false;
  req.session.app_key = null;
  req.session.user = null;
  res.render('login')
})

// router.get('/logout1', function (req, res, next) {
//   req.session.isLogin = false;
//   req.session.app_key = null;
//   req.session.user = null;
//   res.render('login')
// })





router.get('/exists', function (req, res, next) {
  var query_type = parseInt(req.query.query_type);
  var value = req.query.value;
  // var _auth_code = req.query.auth_code;
  var old_value = req.query.old_value;
  var con = req.con
  // var uid = req.query.uid;
  // console.log(rest.rest)
  if (old_value == value) {
    res.send("true");
  } else {
    switch (query_type) {
      case 1: //account
        var query_json = { account: value, fields: 'id' };
        _get('user', con, query_json, function (obj) {
          if (obj.status == 0 && obj.data != null) {
            res.send("false");
          } else {
            res.send("true");
          }
        });
        break;
      case 2: //name
        var query_json = { name: value, fields: 'id' };
        _get('user', con, query_json, function (obj) {
          if (obj.status == 0 && obj.data != null) {
            res.send("false");
          } else {
            res.send("true");
          }
        });
        break;
    }

  }
})

function _get(table, con, query_json, callback) {
  // console.log(req.___dirname)
  var query = query_json;
  var fields, query_json = {};
  var db = con;
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
  var sql = `select ${fields} from ${table} ${rest.wUrl(query_json)} limit 0,1`;
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
    } catch (err) {
      result.status = -1;
    }
    callback(result)
  })
}

router.post('/upload', function (req, res, next) {
  // log(req.files)
  // var file = req.file;
  try {
    var file = req.files[0];
    console.log(req.files)
    // var status = 0;
    var successOpt = {
      status: 0,
      file: file,
    }
    res.send(successOpt)
  } catch (err) {
    res.send({ status: 404 })
  }

})

router.use('/rest', rest.rest)
//打开密集柜
router.get('/openApi', function (req, res, next) {

  //var op = {Area:1,MapCol:3,Knot:1}
  var op = { Area: 1,Knot:1 }
  op['MapCol'] = parseInt(req.query.lie)
  var ops = JSON.stringify(op)
  var option = {
    method: 'POST',
    hostname: '127.0.0.1',
    port: 9999,
    path: '/IdfWCFServer/RestFullWcf/OrderOpen',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/4.5"
    }
  }

  var reqs = http.request(option, function (ress) {
    // console.log(res, 'gg')
    ress.setEncoding('utf8');
    ress.on('data', function (chunk) {
      res.send({ status: chunk })
    })
  })

  reqs.on('error', function (e) { res.send({ status: -1 }) })
  reqs.write(ops);
  reqs.end()

})



module.exports = router;
