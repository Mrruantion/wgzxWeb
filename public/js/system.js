function get_filemd5sum(ofile, callback) {
    var file = ofile;
    var tmp_md5;
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        // file = this.files[0],
        chunkSize = 8097152, // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

    fileReader.onload = function (e) {
        console.log('read chunk nr', currentChunk + 1, 'of', chunks);
        spark.append(e.target.result);                   // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            tmp_md5 = spark.end()
            callback(tmp_md5)
            // console.log('finished loading');
            // console.info('computed hash', tmp_md5);  // Compute hash
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
        callback(-1)
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
}

function getSearch() {
    var str = location.search;
    str = str.slice(1)
    var arr = str.split('&');
    var obj = {}
    // arr.forEach(ele => {
    //     var _arr = ele.split('=');
    //     obj[_arr[0]] = decodeURI(_arr[1])
    // })
    for(var i = 0;i<arr.length;i++){
        var _arr = arr[i].split('=');
        obj[_arr[0]] = decodeURI(_arr[1])
    }
    return obj
}   

window.get_filemd5sum = get_filemd5sum
window.getSearch = getSearch