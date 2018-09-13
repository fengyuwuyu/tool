var commandXmlModel = require('./../../models/commandXml').commandXml;
var ObjectID = require('mongodb').ObjectID;
var saveFile = require("./../util/FileUtil").saveFile;
var removeFile = require("./../util/FileUtil").removeFile;
var checkEmptyDirAndRemove = require("./../util/FileUtil").checkEmptyDirAndRemove;
var backup = require("./backup");
var initClientVersion = require("./Constant").INIT_CLIENT_VERSION;

exports.create = function(req, res) {
    var jsonStr = req.body.jsonStr;
    var json = {};
    commandXmlModel.create({jsonStr: jsonStr, version: 0, clientVersion: initClientVersion }, function(err, commandXml) {
        json.result = !!!err;
        json.commandXml = {
            id: commandXml._id,
            jsonStr: jsonStr
        }
        json.msg = !err ? "添加成功" : "添加失败，见后台log:"+JSON.stringify(err);
        res.send(json);
    });
}
exports.checkVersion = function(req, res) {
    var version = req.body.version;
    var id = req.body.id;
    commandXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
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
    commandXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
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
        var newJson = JSON.parse(jsonStr)
        var oldName = oldJson.root.module._.service || oldJson.root.module._.name;
        var newName = newJson.root.module._.service || newJson.root.module._.name;
        if (oldName != newName) {
          var dirOld = "./export/xmlForFu/commandXml/";
          var fileOld = dirOld + oldName + ".xml";
          checkEmptyDirAndRemove(fileOld, dirOld);
        }

        commandXmlModel.update({"_id": ObjectID(id)}, updateJson, {}, function (err) {
            json.result = !!!err;
            json.msg = !err ? "修改成功" : "修改失败，见后台log:" + JSON.stringify(err);
            json.result && (json.version = updateJson.version);
            res.send(json);
            if (json.result) {
                var file = "./export/xmlForFu/commandXml/" + name + ".xml";
                saveFile(xml, file, function () {
                }, function () {
                });
            }
        })
    });
}
exports.remove = function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    commandXmlModel.remove({"_id":ObjectID(id)}, function(err) {
        res.send({
            result: !!!err,
            msg: !err ? "删除成功" : "删除失败:"+JSON.stringify(err)
        });
        if(!!!err) {
            var file = "./export/xmlForFu/commandXml/" + name + ".xml";
            removeFile(file);
        }
    })
}
exports.list = function(req, res) {
    var versionInfo = backup.getCurrVersionInfo();
    var version = versionInfo.isLast ? initClientVersion : versionInfo.currVersion;
    var paramVersion = req.param('version');
    version = paramVersion || version;
    commandXmlModel.find({clientVersion : version}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: err
            });
            return;
        }

        var list = [];
        for(var i=0, len=results.length; i<len; i++) {
            var commandXml = results[i];
            list.push({
                jsonStr: commandXml.jsonStr,
                version: commandXml.version,
                id: commandXml._id
            });
        }

        res.send({
            result: true,
            list: list
        });
    })
}