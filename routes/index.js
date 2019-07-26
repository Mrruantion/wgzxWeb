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



router.get('/access', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('查阅调阅', req.session.user)) {
    res.render('access', { user: req.session.user })
  } else {
    res.redirect('/login')
  }
})


router.get('/designSet', function (req, res, next) {
  if (req.session.isLogin && checkIsRole('门类功能', req.session.user)) {
    res.render('designSet', { user: req.session.user })
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
        // res.send({ path: '/upload/404.pdf' })
        res.send({ path: '/upload/404.pdf', path2: new Buffer([1]) })
      } else {
        if (row[0]) {
          var tree_path = row[0].tree_path.split(',');
          var json = { id: tree_path.join('|') };
          db.query(`select * from document ${rest.wUrl(json)}`, function (err, rows) {
            var path = '/upload/' + doc_path(rows, row[0].tree_path);
            var path2;
            try {
              // path2 = fs.readFileSync(req.___dirname + '/public' + path)
            } catch (e) {
              path2 = new Buffer([1])
            }

            // console.log(path2)
            // console.log(req.___dirname + path)


            res.send({ path: path, path2: path2 })
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
            uploadPath += (e.did || '') + e.name;
          } else {
            uploadPath += e.name;
          }
        } else {
          // uploadPath += e.name + '/'
          if (e.type == 2) {
            uploadPath += (e.did || '') + e.name + '/';
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

router.get('/rest', rest.rest)
router.post('/rest', rest.rest)
//打开密集柜
router.get('/openApi', function (req, res, next) {

  //var op = {Area:1,MapCol:3,Knot:1}
  // var op = { zone: 1,col:1 }
  var query = req.query
  var col = query.col;
  var side = query.side;
  var section = query.section;
  var layer = query.layer;
  var docno = "";
  var docname = query.name;

  var op = {
    "zone": 1,
    "col": col,
    "side": side,
    "section": section,
    "layer": layer,
    "docno": docno,
    "docname": docname,
    "doccreated": "",
    "docstatus": "onshelf"
  }
  // op['MapCol'] = parseInt(req.query.lie)
  var ops = JSON.stringify(op)
  var option = {
    method: 'POST',
    hostname: '127.0.0.1',
    port: 20206,
    path: '/denseshelf/unfold',
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

router.get('/downloadfile', function (req, res) {
  let path = req.query.path;
  let name = req.query.name
  let load = fs.createReadStream(path); //创建输入流入口
  res.writeHead(200, {
    'Content-Type': 'application/force-download',
    'Content-Disposition': 'attachment; filename=' + encodeURI(name)
  });
  load.pipe(res);// 通过管道方式写入
})



router.get('/searchResults', function (req, res) {
  var db = req.con;
  var globalQuery = req.query;
  if (!globalQuery.key && !globalQuery.did) {
    res.send({ status: -1 })
  }
  var filterArray = ['docprop', 'document', 'playapp', 'syscopy', 'syslog', 'user', 'access']
  var fixPropArr = ['id', 'fid', 'sid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname", "onum", "tree_path"];
  var allTableArray = []
  try {
    getTable(req, function (err, row) {
      if (err) {
        res.send({ status: -1 })
      } else {
        row.forEach(e => {
          if (filterArray.indexOf(e['table_name']) == -1) {
            allTableArray.push(e['table_name'])
          }
        })
        // for(var i = 0;row.length;i++){
        //   if (filterArray.indexOf(row[i]['table_name']) == -1) {
        //     allTableArray.push(row[i]['table_name'])
        //   }
        // }
      }
      var allData = []
      var allCouId = []
      var globalIndex = 0
      
      var start = function () {
        var ename = allTableArray[globalIndex]
        if (ename) {
          getTableColumn(req, ename, function (err1, row1) {
            if (err1) {
              res.send({ status: -1 })
            }
            var filterColumns = []
            for (var i = 0; i < row1.length; i++) {
              if (fixPropArr.indexOf(row1[i].Field) == -1) {
                filterColumns.push(row1[i].Field)
              }
            }

            if (globalQuery.key) {
              var queryBody = {sid:globalQuery.key}
              for (var i = 0; i < filterColumns.length; i++) {
                queryBody[filterColumns[i]] = globalQuery.key
              }
              console.log(queryBody)
              var query_json = {
                fields: 'fid',
                sorts: '',
                limit: '200',
                page_no: parseInt(globalQuery.pageNum || 0) || 1,
              }
              // if(ename == '登记备案合同_私人'){
              //   debugger
              // }

              rest._vagueList({ query: query_json, con: req.con, body: queryBody }, res, ename, function (vdata) {
                console.log(vdata.data)
                allCouId = []
                // allCouId.push(vdata.data)
                vdata.data.forEach(e => {
                  console.log(e.fid)
                  allCouId.push(e.fid)
                })
                var documentBody = {
                  name: globalQuery.key,
                  did: globalQuery.key,
                  keyword: globalQuery.key,
                }
                query_json['fields'] = 'id,type,propName,pid'
                query_json['limit'] = -1
                // if(ename == '登记备案合同_私人'){
                //   debugger
                // }
                rest._vagueList({ query: query_json, con: req.con, body: documentBody }, res, 'document', function (vddata) {
                  vddata.data.forEach(e => {
                    console.log(vddata.data)
                    if(e.propName == ename && allCouId.length <= 200) {
                      if(e.type == 3){
                        allCouId.push(e.pid)
                      }else {
                        allCouId.push(e.id)
                      }
                    }
                  })
                  var query_json = {
                    fields: '*',
                    sorts: 'did',
                    limit: '12',
                    page_no: parseInt(globalQuery.pageNum) || 1,
                    'document.id': allCouId.join('|'),
                    joinCdn: ename + '.fid = document.id'
                  }
                  if (globalQuery.did) {
                    query_json['document.did'] = '^' + globalQuery.did
                  }
                  if (filterColumns.indexOf('在库状态') > -1) {
                    query_json['sorts'] = '-' + ename + '.在库状态|did'
                  }
                  console.log(query_json)
                 
                  rest.tableUnion({ query: query_json, con: req.con }, res, 'document', ename, function (result) {
                    allData = allData.concat(result.data)
                    console.log(ename)
                    globalIndex++
                    start()
                    // if (allTableArray.length == index + 1) {
                    //   var beforData = beforeRusult(allData)
                    //   res.send({ status: 0, data: beforData, total: beforData.length })
                    // }
                  })
  
                })

                
              })



            } else if (globalQuery.did) {

              var query_json = {
                fields: '*',
                sorts: 'did',
                limit: '50',
                page_no: parseInt(globalQuery.pageNum) || 1,
                did: '^' + globalQuery.did,
                type:2,

                joinCdn: ename + '.fid = document.id'
              }
              if (filterColumns.indexOf('在库状态') > -1) {
                query_json['sorts'] = '-' + ename + '.在库状态|did'
              }
              console.log(query_json)
              rest.tableUnion({ query: query_json, con: req.con }, res, 'document', ename, function (result) {
                // allData.push(result.data)
                allData = allData.concat(result.data)
                globalIndex++
                start()
                // if (allTableArray.length == index + 1) {
                //   var beforData = beforeRusult(allData)
                //   res.send({ status: 0, data: beforData, total: beforData.length })
                //   // res.send({ allData })
                // }
              })

            }


          })
        } else {
          console.log(allData)
          var beforData = beforeRusult(allData)
          res.send({ status: 0, data: beforData, total: beforData.length })
        }
      }
      start()
      // allTableArray.forEach((ename, index) => {

      // })

    })
  } catch (error) {
    res.send({ status: -1 })
  }



})

function getTable(req, cb) {
  var db = req.con;
  var table = 'docdb'
  let queryLink = `select table_name from information_schema.tables where table_schema='${table}'`
  db.query(queryLink, function (err, row) {
    cb(err, row)
    // res.send({err:err,row:row})
  })
}

function getTableColumn(req, name, cb) {
  var db = req.con;
  var table = name
  var sql = `SHOW FULL COLUMNS FROM ${table}`;
  db.query(sql, function (err, row) {
    cb(err, row)
  })
}


function beforeRusult(data) { //处理数据
  var _data = [];
  var objisExist = {}
  for (var i = 0; i < data.length; i++) {
    var obj = { name: '', remark: '', status: '', othername: '' };
    for (var o in data[i]) {

      switch (o) {
        case 'name':
          var name = data[i][o]
          obj['name'] = name;
          break;
        case '档案名称':
            obj['othername'] = data[i][o]
            break;
        case '在库状态':
          obj['status'] = data[i][o] || '';
          break;
        case '备注':
          obj['remark'] = data[i][o] || '';
          break;
        case 'did':
          obj['did'] = data[i][o] || '';
          break;
        case 'qnum':
          obj['qnum'] = data[i][o] || '';
          break;
        
        case 'lnum':
          obj['lnum'] = data[i][o] || '';
          break;
        case 'jnum':
          obj['jnum'] = data[i][o] || '';
          break;
        case 'cnum':
          obj['cnum'] = data[i][o] ||'';
          break;
        case 'ce':
          obj['ce'] = data[i][o] || 2;
          break;
        case 'onum':
          obj['onum'] = data[i][o] || 0;
          break;
        default:
        // obj[o] = data[i][o];
        // break;
      }
    }
    if(!objisExist[data[i].id]){
      objisExist[data[i].id] = 1
      _data.push(obj)
    }
    
  }
  return _data
}


module.exports = router;
