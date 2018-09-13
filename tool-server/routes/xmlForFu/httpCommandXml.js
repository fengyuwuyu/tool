var httpCommandXmlModel = require('./../../models/httpCommandXml').httpCommandXml;
var ObjectID = require('mongodb').ObjectID;
var saveFile = require("./../util/FileUtil").saveFile;
var removeFile = require("./../util/FileUtil").removeFile;
var checkEmptyDirAndRemove = require("./../util/FileUtil").checkEmptyDirAndRemove;
var backup = require("./backup");
var initClientVersion = require("./Constant").INIT_CLIENT_VERSION;

exports.create = function(req, res) {
    var jsonStr = req.body.jsonStr;
    var json = {};
    httpCommandXmlModel.create({jsonStr: jsonStr, version: 0, clientVersion: initClientVersion }, function(err, httpCommandXml) {
        json.result = !!!err;
        json.httpCommandXml = {
            id: httpCommandXml._id,
            jsonStr: jsonStr
        }
        json.msg = !err ? "添加成功" : "添加失败，见后台log:"+JSON.stringify(err);
        res.send(json);
    });
}
exports.checkVersion = function(req, res) {
    var version = req.body.version;
    var id = req.body.id;
    httpCommandXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
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
    httpCommandXmlModel.find({"_id":ObjectID(id)}, function(err, results) {
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
        var nameOld = oldJson.root.module._.service || oldJson.root.module._.name;
        var dirOld = "./export/xmlForFu/httpCommandXml/";
        var fileOld = dirOld + nameOld + ".xml";
        checkEmptyDirAndRemove(fileOld, dirOld);

        httpCommandXmlModel.update({"_id": ObjectID(id)}, updateJson, {}, function (err) {
            json.result = !!!err;
            json.msg = !err ? "修改成功" : "修改失败，见后台log:" + JSON.stringify(err);
            json.result && (json.version = updateJson.version);
            res.send(json);
            if (json.result) {
                var file = "./export/xmlForFu/httpCommandXml/" + name + ".xml";
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
    httpCommandXmlModel.remove({"_id":ObjectID(id)}, function(err) {
        res.send({
            result: !!!err,
            msg: !err ? "删除成功" : "删除失败:"+JSON.stringify(err)
        });
        if(!!!err) {
            var file = "./export/xmlForFu/httpCommandXml/" + name + ".xml";
            removeFile(file);
        }
    })
}
exports.list = function(req, res) {
    var versionInfo = backup.getCurrVersionInfo();
    var version = versionInfo.isLast ? initClientVersion : versionInfo.currVersion;
    var paramVersion = req.param('version');
    version = paramVersion || version;
    httpCommandXmlModel.find({clientVersion : version}, function(err, results) {
        if(err) {
            res.send({
                result: false,
                msg: err
            });
            return;
        }

        var list = [];
        for(var i=0, len=results.length; i<len; i++) {
            var httpCommandXml = results[i];
            list.push({
                jsonStr: httpCommandXml.jsonStr,
                version: httpCommandXml.version,
                id: httpCommandXml._id
            });
        }

        res.send({
            result: true,
            list: list
        });
    })
}