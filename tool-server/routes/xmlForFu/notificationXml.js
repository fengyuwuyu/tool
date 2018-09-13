var notificationXmlModel = require('./../../models/notificationXml').notificationXml;
var ObjectID = require('mongodb').ObjectID;
var saveFile = require("./../util/FileUtil").saveFile;
var removeFile = require("./../util/FileUtil").removeFile;
var createWhenNotExists = require("./../util/FileUtil").createWhenNotExists;
var checkEmptyDirAndRemove = require("./../util/FileUtil").checkEmptyDirAndRemove;
var backup = require("./backup");
var initClientVersion = require("./Constant").INIT_CLIENT_VERSION;

exports.create = function(req, res) {
    var jsonStr = req.body.jsonStr;
    var json = {};
    notificationXmlModel.create({jsonStr: jsonStr, version: 0, clientVersion: initClientVersion  }, function(err, notificationXml) {
        json.result = !!!err;
        json.notificationXml = {
            id: notificationXml._id,
            jsonStr: jsonStr,
            version: 0
        }
        json.msg = !err ? "添加成功" : "添加失败，见后台log:"+JSON.stringify(err);
        res.send(json);
    });
}
exports.checkVersion = function(req, res) {
    var version = req.body.version;
    var id = req.body.id;
    console.log(req.body);
    notificationXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
        console.log(err);
        if (!results.length) {
            res.send({
                result: false,
                msg: "后台已不存在该条数据"
            });
            return;
        }

        var obj = results[0];
        if(obj.version !== version) {
            res.send({
                result: false,
                msg: "当前版本已低于最新版本，请刷新后再提交"
            });
        } else {
            res.send({
                result: true,
                msg: "版本正常"
            });
        }
    });
}
exports.update = function(req, res) {
    var jsonStr = req.body.jsonStr;
    var id = req.body.id;
    var name = req.body.name;
    var xml = req.body.xml;
    var version = req.body.version;
    var json = {};
    notificationXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
        if(!results.length) {
            res.send({
                result: false,
                msg: "后台已不存在该条数据"
            });
            return;
        }
        var obj = results[0];
        if(obj.version !== version) {
            console.log('数据库版本：' + obj.version + ', 更新版本：' + version);
            res.send({
                result: false,
                msg: "当前版本已低于最新版本，请刷新后再提交"
            });
            return;
        }
        var updateJson = {
            jsonStr: jsonStr,
            backupJsonStr1: obj.jsonStr
        };
        updateJson.version = (obj.version || 0) + 1;
        for(var i=2; i>30; i++) {
            updateJson["backupJsonStr"+i] = obj["backupJsonStr"+(i-1)];
        }

        var oldJson = JSON.parse(obj.jsonStr);
        var nameOld = oldJson.root.module._.service || oldJson.root.module._.name;
        var dirOld = "./export/xmlForFu/notificationXml/";
        var fileOld = dirOld + nameOld + ".xml";
        checkEmptyDirAndRemove(fileOld, dirOld);

        notificationXmlModel.update({"_id":ObjectID(id)}, updateJson, {}, function(err) {
            json.result = !!!err;
            json.msg = !err ? "修改成功" : "修改失败，见后台log:"+JSON.stringify(err);
            json.result && (json.version = updateJson.version);
            if(json.result) {
                    var file =  "./export/xmlForFu/notificationXml/" +name+".xml";
                    saveFile(xml, file, function() {
                        console.log('保存文件：' + file + ', success')
                        res.send(json);
                        return;
                    }, function(err) {
                        if(err){
                            json.result = false;
                            json.msg = "保存xml文件失败,详情见后台log！";
                            console.log(JSON.stringify(err));
                        }
                        res.send(json);
                        return;
                    });
            }else{
                res.send(json);
                return;
            }
        })
    });
}
exports.remove = function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    notificationXmlModel.remove({"_id":ObjectID(id)}, function(err) {
        res.send({
            result: !!!err,
            msg: !err ? "删除成功" : "删除失败:"+JSON.stringify(err)
        });
        if(!!!err) {
            var file = "./export/xmlForFu/notificationXml/" + name + ".xml";
            removeFile(file);
        }
    })
}
exports.list = function(req, res) {
    var versionInfo = backup.getCurrVersionInfo();
    var version = versionInfo.isLast ? initClientVersion : versionInfo.currVersion;
    notificationXmlModel.find({clientVersion : version}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: err
            });
            return;
        }

        var list = [];
        for(var i=0, len=results.length; i<len; i++) {
            var notificationXml = results[i];
            list.push({
                jsonStr: notificationXml.jsonStr,
                version: notificationXml.version,
                id: notificationXml._id
            });
        }

        res.send({
            result: true,
            list: list
        });
    })
}