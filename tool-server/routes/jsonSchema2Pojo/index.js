var fs = require("fs");
var saveFile = require("./../util/FileUtil").saveFile;
var removeFile = require("./../util/FileUtil").removeFile;
var exec = require('child_process').exec;
exports.generate = function(req, res) {
    var configFile = "./generate/RpcConfig.config";
    var filesDir = "./generate/export/";
    var json = req.body.json;
    saveFile(json, configFile, function() {
        var files = fs.readdirSync(filesDir);//读取该文件夹
        files.forEach(function(file){
            var stats = fs.statSync(filesDir+'/'+file);
            fs.unlinkSync(filesDir+'/'+file);
        });
        // 执行cmd
        exec("java -jar ./generate/jsonschema2pojo-cli-0.4.29.jar -a NONE -c -E -S -T JSON -s "+configFile+" -t "+filesDir, function(err,stdout,stderr) {
            if(err) {
                res.send({
                    result: false,
                    msg: "执行jar包命令失败:"+JSON.stringify(err)+":"+JSON.stringify(stderr)
                });
                return;
            }

            var generateFileList = [];
            files = fs.readdirSync(filesDir);
            files.forEach(function(file){
                var stats = fs.statSync(filesDir+'/'+file);
                generateFileList.push({
                    path: "export/"+file,
                    file: file
                });
            });
            res.send({
                result: true,
                msg: "命令执行成功",
                generateFileList: generateFileList
            });
        });
    }, function() {
        res.send({
            result: false,
            msg: "在保存配置文件时失败"
        });
    });
}