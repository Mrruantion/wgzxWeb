var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var bodyParser = require('body-parser');
// var upload = require('./routes/multerUtil')
// var multer = require('multer');
var upload = require('./routes/multerUtil')(__dirname);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mysql = require('mysql');
var app = express();
app.use(session({ secret: 'wilson', resave: true, saveUninitialized: true }));
// var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  port: '3306',
  user: "root",
  password: "doccloud2018",
  database: "docdb"
});
// var pool = mysql.createPool({
//   host: "582c1a40635ca.sh.cdb.myqcloud.com",
//   port: '5079',
//   user: "docdb",
//   password: "doccloud2018",
//   database: "docdb"
// });
var query = function (sql, callback, options) {
  pool.getConnection(function (err, conn) {
    if (err) {
      callback(err, null, null);
    } else {
      conn.query(sql, options, function (err, results, fields) {
        //释放连接  
        conn.release();
        //事件驱动回调  
        callback(err, results, fields);
      });
    }
  });
};

let getClientIp = function (req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '';
};


function getIPAdress(){  
  var interfaces = require('os').networkInterfaces();  
  for(var devName in interfaces){  
        var iface = interfaces[devName];  
        for(var i=0;i<iface.length;i++){  
             var alias = iface[i];  
             if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                   return alias.address;  
             }  
        }  
  }  
} 

app.use(function (req, res, next) {
  req.con = { query: query };
  req.___dirname = __dirname;
  next();
  // let ip = getClientIp(req).match(/\d+.\d+.\d+.\d+/);
  // ip = ip ? ip.join('.') : null;
  // let ip = getIPAdress()
  // req._ip_ = ip

  // console.log(ip)
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded
app.use(upload.any());
app.use(bodyParser.text())
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser.json());//数据JSON类型
// var jsonParser = bodyParser.json()
// // 接受 application/x-www-form-urlencoded 格式的过滤器
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
// // 接受 text/html 格式的过滤器
// var textParser = bodyParser.text()
// app.use(multer()); // for parsing multipart/form-data

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/restart', function (req, res) {
  process.exit(0);
});

// app.use('/upload', upload.any(), function (req, res) {
//   // log(req.files)
//   res.send({message: '上传成功'})
// })
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
