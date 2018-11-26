const compressing = require('compressing');
// compressing.tar.compressDir('C:\\My Person Documents\\testwork\\fileplay\\docCloud\\public\\upload', 'C:\\My Person Documents\\testwork\\fileplay\\docCloud\\public\\upload.tar')
// .then(function(res){console.log(res)})
// .catch(function (err){console.log(err)});

// compressing.tar.uncompress('C:\\My Person Documents\\testwork\\fileplay\\docCloud\\public\\upload.tar', 'C:\\My Person Documents\\testwork\\fileplay\\docCloud\\public')
// .then(function(res){console.log(res)})
// .catch(function (err){console.log(err)});


var xlsx = require('node-xlsx');
var fs = require('fs');
var data = [[1,2,3],[true, false, null, 'sheetjs'],['foo','bar',new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
var buffer = xlsx.build([{name: "mySheetName", data: data}]);
fs.writeFileSync('b.xlsx', buffer, 'binary');
// res.send('export successfully!');

