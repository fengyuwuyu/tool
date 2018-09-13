var fs = require("fs");
function _writeFile(file, data, successCallback, errCallback) {
    fs.writeFile(file, data, "utf-8", function (err) {
        if (err) {
            console.log(err);
            errCallback && errCallback(err);
            return false;
        }

        successCallback && successCallback();
        return true;
    });
}
exports.saveFile = function (str, file, successCallback, errCallback) {
    fs.exists(file, function (isExists) {
        if (isExists) {
            fs.unlink(file, function () {
                _writeFile(file, str, successCallback, errCallback);
            });
        } else {
            _writeFile(file, str, successCallback, errCallback);
        }
    });
}
exports.removeFile = function (file) {
    fs.exists(file, function (isExists) {
        if (isExists) {
            console.log('删除文件：' + file);
            fs.unlink(file);
        }
    });
}

exports.checkEmptyDirAndRemove = function (file, dir) {
  fs.exists(file, function (isExists) {
    if (isExists) {
      console.log('删除文件：' + file);
      fs.unlink(file, function() {});
    }
  });
}

exports.createWhenNotExists = function (file, callback) {
    fs.exists(file, function (isExists) {
        console.log(file + '存在：' +isExists);
        if (isExists) {
            callback  &&  callback();
        }else{
            // noinspection JSAnnotator
            fs.mkdir(file, 0777, callback);
        }
    });
}

exports.mkdir = function (path, mode, callback) {
    // noinspection JSAnnotator
    fs.mkdir(path, mode || 0777, callback)
}

exports.readFile = function (file, successCallback, errCallback) {
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            errCallback && errCallback(err);
        } else {
            successCallback && successCallback(data);
        }
    });
}
