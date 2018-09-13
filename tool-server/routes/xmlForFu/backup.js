var backupModel = require('./../../models/backup').backup;
var commandXmlModel = require('./../../models/commandXml').commandXml;
var httpCommandXmlModel = require('./../../models/httpCommandXml').httpCommandXml;
var moduleXmlModel = require('./../../models/moduleXml').moduleXml;
var typeXmlModel = require('./../../models/recordXml').typeXml;
var recordXmlModel = require('./../../models/recordXml').recordXml;
var eventXmlModel = require('./../../models/eventXml').eventXml;
var metaDataXmlModel = require('./../../models/metaDataXml').metaDataXml;
var clientVersionModel = require('./../../models/clientVersion').clientVersion;
var currVersionModel = require('./../../models/currVersion').currVersion;
var saveFile = require("./../util/FileUtil").saveFile;
var ObjectID = require('mongodb').ObjectID;
var FileUtil = require("./../util/FileUtil");
var fs = require("fs");
var JSZip = require('jszip');
var exec = require('child_process').exec;
var os=require('os');
var initClientVersion = require("./Constant").INIT_CLIENT_VERSION;

var versionListCache = [];
var currVersionCache;
var fileNames = ['commandXml', 'httpCommandXml', 'eventXml','metadataXml','rpcXml','recordXml',  'category'];

exports.getVersion = function(req, res){
    var version = req.param('version');
    if(version) {
        createCurrVersionFile(req, res, version);
        return;
    }
    if(!currVersionCache) {
        currVersionModel.find({}, function(err, results){
            var obj = results[0];
            currVersionCache  = obj.currVersion;
            createCurrVersionFile(req, res, currVersionCache);
        });
    } else {
        createCurrVersionFile(req, res, currVersionCache);
    }

}

createCurrVersionFile = function(req, res, version){
    var file = 'export/version.txt';
    FileUtil.saveFile(version, file, function () {
        console.log('保存当前版本成功' + version);
        res.redirect('/version.txt');
    }, function () {
        console.log('保存当前版本失败' + version);
        res.send({'success': false, 'msg': '本地文件报错失败！'});
    });
}

exports.getCurrVersionInfo = function() {
    var lastVersion = versionListCache[versionListCache.length - 1];
    var isLast = currVersionCache == lastVersion;
    return {
        currVersion: currVersionCache,
        isLast: isLast,
        lastVersion: lastVersion
    };
}

exports.getCurrVersion = function(req, res){
    if(currVersionCache){
        res.send({
            result: true,
            data: currVersionCache
        });
        return;
    }
    currVersionModel.find({}, function(err, results){
        if (!results.length) {
            console.log("查找currVersion失败，"+ err + "rsult length = "+ results.length);
            res.send({
                result: false,
                msg: "未查询到数据，服务器内部错误！"
            });
            return;
        }

        var obj = results[0];
        currVersionCache  = obj.currVersion;
        res.send({
            result: true,
            data: currVersionCache
        });
    });
}

exports.updateCurrVersion = function(req, res){
    var currVersion = req.body.currVersion;
    currVersionModel.find({},function(err, results) {
        if (err || results.length == 0) {
            console.log("查找currVersion失败，"+ err);
            res.send({
                result: false,
                msg: "操作mongodb失败！" + err
            });
            return;
        }
        var id = results[0]._id;
        currVersionModel.update({"_id": id}, {"currVersion": currVersion}, {}, function(err){
            if(err){
                console.log("更新currVersion失败，"+ err);
                res.send({
                    result: false,
                    msg: "mongodb更新失败！"
                });
                return;
            }
            currVersionCache = currVersion;
            res.send({
                result: true,
                msg: "mongodb更新成功！"
            });
        });
    });
}

exports.versionList = function(req, res) {
    if(versionListCache && versionListCache.length > 0){
        console.log('直接返回缓存的versionList = [' + versionListCache + ']');
        res.send({
            result: true,
            list: versionListCache
        });
        return;
    }
    clientVersionModel.find({}, function(err, results) {
        if(err) {
            console.log("查找clientVersion失败，"+ err);
            res.send({
                result: false,
                msg: "操作mongodb失败！" + err
            });
            return;
        }

        var list = [];
        if(!results || results.length == 0){
            clientVersionModel.create({version: '1.0.0.0'}, function(err, obj) {
                if(!err){
                    currVersionModel.create({"currVersion": '1.0.0.0'}, function(err, obj){
                        if(err){
                            console.log("初始化currVersion失败，"+ err);
                            res.send({
                                result: false,
                                msg: "操作mongodb失败！"
                            });
                            return;
                        }
                        list.push('1.0.0.0');
                        versionListCache.push('1.0.0.0');
                        res.send({
                            result: true,
                            list: list
                        });
                    });
                } else {
                    console.log("初始化clientVersion失败，"+ err);
                    res.send({
                        result: false,
                        msg: "操作mongodb失败！"
                    });
                    return;
                }
            });
        } else {
            for(var i=0, len=results.length; i<len; i++) {
                list.push(results[i].version);
                versionListCache.push(results[i].version);
            }
            res.send({
                result: true,
                list: list
            });
        }
    });
}

exports.addVersion = function(req, res) {
    var version = req.body.version;
    clientVersionModel.create({version: version}, function(err, obj) {
        if(!err){
            databaseBackup(req, res, version, commandXmlModel, 'commandXml', function(){
                databaseBackup(req, res, version, httpCommandXmlModel, 'httpCommandXml', function(){
                    databaseBackup(req, res, version, eventXmlModel, 'eventXml', function(){
                        databaseBackup(req, res, version, metaDataXmlModel, 'metadataXml', function(){
                            databaseBackup(req, res, version, moduleXmlModel, 'moduleXml', function(){
                                databaseBackup(req, res, version, recordXmlModel, 'recordXml', function(){
                                    //database备份完成
                                    console.log('database备份完成');
                                    dataMigration(currVersionCache);
                                    versionListCache.push(version);
                                    res.send({
                                        result: true,
                                        msg: "添加Version成功！"
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            console.log("添加Version失败，"+ err);
            res.send({
                result: false,
                msg: "操作mongodb失败！"
            });
            return;
        }
    });
}

databaseBackup = function(req, res, version, model, modelName, callback){
    console.log('开始备份'+ modelName +', time = ' + new Date() + ',  initClientVersion = ' + initClientVersion);
    var lastVersion = versionListCache[versionListCache.length - 1];
    model.find({clientVersion: initClientVersion}, {}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: "备份event list失败， clientVersion = "+ initClientVersion + ', error = ' +  err
            });
            return;
        }
        console.log('database list : results length = '+ results.length);
        var list = [];
        if(results && results.length > 0){
            for(var i=0, len=results.length; i<len; i++) {
                var entity = results[i];
                var obj = {};
                obj.version = entity.version;
                obj.jsonStr = entity.jsonStr;
                obj.clientVersion = lastVersion;
                if(modelName == 'metadataXml'){
                    obj.name = entity.name;
                    obj.strutNames = entity.strutNames;
                    obj.category = entity.category;
                }
                list.push(obj);
            }
            model.insertMany(list, function(err, docs){
                if(err) {
                    res.send({
                        result: false,
                        msg: err
                    });
                    return;
                }
                console.log('备份'+ modelName +'成功, time = ' + new Date());

                //调用回调函数
                callback();
            });
        } else {
            //调用回调函数
            callback();
        }
    })
}

eventBackup = function(req, res, version) {
    console.log('开始备份event, time = ' + new Date() + ',  initClientVersion = ' + initClientVersion);
    var lastVersion = versionListCache[versionListCache.length - 1];
    eventXmlModel.find({clientVersion: initClientVersion}, {}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: "备份event list失败， clientVersion = "+ initClientVersion + ', error = ' +  err
            });
            return;
        }
        console.log('备份 step 1， results = '+ results);
        if(results && results.length > 0){
            var list = [];
            for(var i=0, len=results.length; i<len; i++) {
                var eventXml = results[i];
                list.push({
                    jsonStr: eventXml.jsonStr,
                    version: eventXml.version,
                    clientVersion: lastVersion
                });
            }
            console.log(list);
            eventXmlModel.insertMany(list, function(err, docs){
                if(err) {
                    res.send({
                        result: false,
                        msg: err
                    });
                    return;
                }
                console.log('备份 step 2');
                console.log('备份event成功, time = ' + new Date());

                //备份metadataXml
                metadataBackup(req, res, version);
            });
        } else {//备份metadataXml
            metadataBackup(req, res, version);
        }


    })
}

metadataBackup = function(req, res, version){
    console.log('开始备份metadata, time = ' + new Date() + ', initClientVersion = ' + initClientVersion);
    var lastVersion = versionListCache[versionListCache.length - 1];
    metadataXmlModel.find({clientVersion: initClientVersion}, {}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: "备份event list失败， clientVersion = "+ initClientVersion + ', error = ' +  err
            });
            return;
        }

        console.log('备份 step 3， results.length = ' + results.length);
        if(results && results.length > 0){
            var list = [];
            for(var i=0, len=results.length; i<len; i++) {
                var metadataXml = results[i];
                list.push({
                    jsonStr: metadataXml.jsonStr,
                    version: metadataXml.version,
                    clientVersion: lastVersion
                });
            }
            metadataXmlModel.insertMany(list, function(err, docs){
                if(err) {
                    res.send({
                        result: false,
                        msg: err
                    });
                    return;
                }
                console.log('备份 step 4');
                console.log('备份metadata成功, time = ' + new Date());
                dataMigration(currVersionCache);
                versionListCache.push(version);
                res.send({
                    result: true,
                    msg: "添加Version成功！"
                });
            });
        } else {
            console.log('无metadata需要备份, time = ' + new Date());
            dataMigration(currVersionCache);
            versionListCache.push(version);
            res.send({
                result: true,
                msg: "添加Version成功！"
            });
        }

    })
}

dataMigration = function(version){
    console.log('备份 step 5');
    var platform=os.platform();
    console.log(platform);
    if(platform == 'win32'){
        windowsShell(version);
    }else{
        linuxShell(version);
    }
}


windowsShell = function(version){
    var delayTime = 200;
    fileNames.forEach(function(item, i){
        setTimeout(function() {
            var command = "xcopy .\\export\\xmlForFu\\"+ item +" .\\export\\xmlForFu\\"+version+"\\"+ item +"\\ /s /e /Y";
            execSysShell(command);
        }, delayTime * i);
    });
}

linuxShell = function(version){
    fileNames.forEach(function(item){
        var command1 = "mkdir -p ./export/xmlForFu/"+ version+"/"+ item;
        var command2 = "cp -arf ./export/xmlForFu/"+ item+"/* ./export/xmlForFu/"+ version+"/"+ item;
        execSysShell(command1);
        execSysShell(command2);
    });
}

execSysShell = function(command){
    console.log('exec command : '+ command);
    exec(command,{  encoding: 'utf8',
        timeout: 100000,
        maxBuffer: 200*1024,
        killSignal: 'SIGTERM',
        cwd: null,
        env: null }, function(err,stdout,stderr){
        if(err) {
            console.log('exec command error = '+err);
        }
    });
}

exports.getAllVersionDataZip = function(req, res){
    var zip = new JSZip();
    getAllVersionFilesByDir('./export/xmlForFu', zip, 'entity/');

    if(versionListCache.length != 0){
        var lastVersion = versionListCache[versionListCache.length - 1];
        fileNames.forEach(function(item){
            getAllVersionFilesByDir('./export/xmlForFu/'+ item , zip, 'entity/'+ lastVersion + '/');
        });
    } else {
        console.log('程序还未初始化，请访问主页后再下载zip文件！');
        res.redirect('/xmlForFu/entity.zip');
        return;
    }

    var data = zip.generate({base64:false,compression:'DEFLATE'});
    fs.writeFile('./export/xmlForFu/entity.zip', data, 'binary', function(){
        console.log('create allVersionData zip success');
        res.redirect('/xmlForFu/entity.zip');
    });
}

function getAllVersionFilesByDir(path, zip, zipPath){
    if(isDirectory(path)){
        var files = fs.readdirSync(path);
        if(files && files.length > 0){
            files.forEach(function(file){
                var tmp = path + '/' + file;
                if(isDirectory(path + '/' + file)){
                    if(tmp != './export/xmlForFu/commandXml' && tmp != './export/xmlForFu/eventXml' && tmp != './export/xmlForFu/metadataXml' && tmp != './export/xmlForFu/rpcXml'
                        && tmp != './export/xmlForFu/recordXml' && tmp != './export/xmlForFu/category' && tmp != './export/xmlForFu/.git'){
                        getAllVersionFilesByDir(tmp, zip, zipPath);
                    }
                } else {
                    if('./export/xmlForFu/metadataXml.zip' != tmp && './export/xmlForFu/entity.zip' != tmp){
                        var zipFileName = zipPath + tmp.substring('./export/xmlForFu/'.length, tmp.length);
                        var index = zipFileName.indexOf('metadataXml');
                        if(index != -1) {
                            console.log(zipFileName);
                            var categoryDir = zipFileName.substring(index + 'metadataXml/'.length, zipFileName.indexOf('/', index + 'metadataXml/'.length));
                            categoryDir = categoryDir.substring(0, 1).toLowerCase() + categoryDir.substring(1);
                            categoryDir = categoryDir.replace(/([A-Z])/g,"_$1").toLowerCase();
                            console.log(categoryDir);
                            zipFileName = zipFileName.substring(0, index + 'metadataXml/'.length) + categoryDir + '/' + zipFileName.substring(index + 'metadataXml/'.length + categoryDir.length);
                            console.log(zipFileName);

                        }
                        console.log( '向zip中添加文件 ：zipFileName =  ' + zipFileName + ', filename = ' + tmp);
                        zip.file(zipFileName, fs.readFileSync(tmp));
                    }
                }
            });
        }
    }
}


exports.backup = function(req, res) {
    var des = req.body.des;
    var date = +new Date();
    var backupFolder = "./export/xmlForFu/backup/"+date;
    FileUtil.mkdir(backupFolder, null, function(err) {
        if(err) {
            res.send({
                result: false,
                msg: "备份失败，文件夹创建失败:"+JSON.stringify(err)
            });
            return;
        }
        var moduleXmlList = [],
            typeXmlList = [],
            commandXmlList = []
        // 备份RPC函数定义
        moduleXmlModel.find({}, function(err, results) {
            if(err) {
                res.send({
                    result: false,
                    msg: "备份第一步，RPC函数定义数据备份失败:"+JSON.stringify(err)
                });
                return;
            }

            for(var i=0, len=results.length; i<len; i++) {
                var moduleXml = results[i];
                var obj = {
                    jsonStr: moduleXml.jsonStr,
                    version: moduleXml.version,
                    id: moduleXml._id
                };
                var key = "backupJsonStr"+j;
                for(var j=1; j<30; j++) {
                    obj[key] = moduleXml[key];
                }
                moduleXmlList.push(moduleXml);
            }

            // 备份RPC全局数据定义
            typeXmlModel.find({}, function(err, results) {
                if(err) {
                    res.send({
                        result: false,
                        msg: "备份第二步, RPC全局数据定义备份失败:"+JSON.stringify(err)
                    });
                    return;
                }

                for(var i=0, len=results.length; i<len; i++) {
                    var typeXml = results[i];
                    var obj = {
                        jsonStr: typeXml.jsonStr,
                        id: typeXml._id,
                        version: typeXml.version,
                        name: typeXml.name
                    };
                    var key = "backupJsonStr"+j;
                    for(var j=1; j<30; j++) {
                        obj[key] = typeXml[key];
                    }
                    typeXmlList.push(obj);
                }

                // 备份客户端服务器Command定义
                commandXmlModel.find({}, function(err, results) {
                    if(err) {
                        res.send({
                            result: false,
                            msg: "备份第三步，客户端服务器Command定义备份失败:"+JSON.stringify(err)
                        });
                        return;
                    }

                    for(var i=0, len=results.length; i<len; i++) {
                        var commandXml = results[i];
                        var obj = {
                            jsonStr: commandXml.jsonStr,
                            version: commandXml.version,
                            id: commandXml._id
                        };
                        var key = "backupJsonStr"+j;
                        for(var j=1; j<30; j++) {
                            obj[key] = typeXml[key];
                        }
                        commandXmlList.push(obj);
                    }

                    var backupJson = {
                        moduleXmlList: moduleXmlList,
                        typeXmlList: typeXmlList,
                        commandXmlList: commandXmlList,
                        backup: { // 虽然可能没用，但是还是记下了，以防万一
                            des: des,
                            date: date
                        }
                    };
                    var successCallback = function() {
                        backupModel.create({
                            date:date,des:des}, function(err, backup) {
                            if(err) {
                                res.send({
                                    result: true,
                                    msg: "备份成功，但是入库时出错:"+JSON.stringify(err)
                                });
                                return;
                            }

                            res.send({
                                result: true,
                                msg: "备份成功"
                            });
                        });
                    }
                    var errCallback = function(err) {
                        res.send({
                            result: false,
                            msg: "备份数据已准备完成，但是写入时出错:"+JSON.stringify(err)
                        });
                    }
                    // 写数据
                    FileUtil.saveFile(JSON.stringify(backupJson), backupFolder+"/data.json", successCallback, errCallback)
                });
            });
        });
    });
}

exports.getMetaDataXmlZip = function(req, res) {
    //var zip_file = './export/xmlForFu/metadataXml.zip';
    //FileUtil.removeFile(zip_file);
    var version = req.param('version');
    var zip = new JSZip();
    var dir;
    if(!version || version == versionListCache[versionListCache.length - 1]) {
        dir = './export/xmlForFu/metadataXml';
    } else {
        dir =  './export/xmlForFu/'+ version +'/metadataXml';
    }
    console.log(dir);
    getAllFilesByDir(dir, zip);

    var data = zip.generate({base64:false,compression:'DEFLATE'});
    fs.writeFile('./export/xmlForFu/metadataXml.zip', data, 'binary', function(){
        console.log('create metadata zip success');
        res.redirect('/xmlForFu/metadataXml.zip');
        //res.setHeader("Content-Type", 'application/zip');
        //var content =  fs.readFileSync('./export/xmlForFu/metadataXml.zip',"binary");   //格式必须为 binary，否则会出错
        //res.writeHead(200, "Ok");
        //res.write(content,"binary"); //格式必须为 binary，否则会出错
        //res.end();
    });
}

function getAllFilesByDir(path, zip){
    if(isDirectory(path)){
        var dirs = fs.readdirSync(path);
        if(dirs && dirs.length > 0){
            dirs.forEach(function(dir){
                var zipDir = dir.substring(0, 1).toLowerCase() + dir.substring(1);
                zipDir = zipDir.replace(/([A-Z])/g,"_$1").toLowerCase();
                var newDir = path + '/' + dir;
                var files = fs.readdirSync(newDir);
                if(files && files.length > 0){
                    files.forEach(function(file){
                        console.log(newDir + '/' + file);
                        zip.folder("data/" + zipDir).file(file + '', fs.readFileSync(newDir + '/' + file));
                    });
                }
            })
        }
    }
}

function isDirectory(path){
    var stat = fs.lstatSync(path);
    if(stat.isDirectory()){
        return true;
    }
}