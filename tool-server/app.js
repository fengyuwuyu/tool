var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// route
var defaultRoute = require('./routes/index');
var moduleXmlRoute = require("./routes/xmlForFu/moduleXml");
var typeXmlRoute = require("./routes/xmlForFu/typeXml");
var backupRoute = require("./routes/xmlForFu/backup");
var commandXmlRoute = require("./routes/xmlForFu/commandXml");
var httpCommandXmlRoute = require("./routes/xmlForFu/httpCommandXml");
var bridgeCommandXmlRoute = require("./routes/xmlForFu/bridgeCommandXml");
var mataDataXmlRoute = require("./routes/xmlForFu/metaDataXml");
var eventXmlRoute = require("./routes/xmlForFu/eventXml");
var notificationXmlRoute = require("./routes/xmlForFu/notificationXml");
var jobsXmlRoute = require("./routes/xmlForFu/jobsXml");
var wolverineEventXmlRoute = require("./routes/xmlForFu/wolverineEventXml");
var wolverineModuleXmlRoute = require("./routes/xmlForFu/wolverineModuleXml");
var taskXmlRoute = require("./routes/xmlForFu/taskXml");
var recordXmlRoute = require("./routes/xmlForFu/recordXml");
var jsonSchema2PojoRoute = require("./routes/jsonSchema2Pojo/index");
var isServer = false;
if(isServer) {
    mongoose.connect("mongodb://localhost:27017/tool");
} else {
    mongoose.connect("mongodb://localhost/tool");
}

var app = express();
// all environments
app.set('port', isServer ? 3000: 3000)
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.cookieParser('keyboard cat'));
app.use(express.favicon(__dirname + '/favicon.ico'));
app.use(express.session({
    secret: 'keyboard cat',
    cookie: { maxAge: 24*60*60*1000 },
    resave: false,
    saveUninitialized: true,
}));
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", isServer ? "http://172.16.2.118:8988" : "http://localhost:8088");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, withcredentials");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
//设置跨域访问
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'export')));
app.use(express.static(path.join(__dirname, 'generate')));
// development only
if ('development' == app.get('env')) { 
    app.use(express.errorHandler());
}

app.get('/', defaultRoute.index);
app.get('/xmlMakerForFu', defaultRoute.index);
app.get('/jsonSchema2Pojo', defaultRoute.index);
app.get("/getMetaDataXmlZip", backupRoute.getMetaDataXmlZip);
app.get("/getAllVersionDataZip", backupRoute.getAllVersionDataZip);
app.get("/getVersion", backupRoute.getVersion);
app.post("/moduleXml/list", moduleXmlRoute.list);
app.post("/moduleXml/create", moduleXmlRoute.create);
app.post("/moduleXml/remove", moduleXmlRoute.remove);
app.post("/moduleXml/update", moduleXmlRoute.update);
app.post("/moduleXml/checkVersion", moduleXmlRoute.checkVersion);
app.post("/eventXml/list", eventXmlRoute.list);
app.post("/eventXml/create", eventXmlRoute.create);
app.post("/eventXml/remove", eventXmlRoute.remove);
app.post("/eventXml/update", eventXmlRoute.update);
app.post("/eventXml/checkVersion", eventXmlRoute.checkVersion);
app.post("/commandXml/list", commandXmlRoute.list);
app.post("/commandXml/create", commandXmlRoute.create);
app.post("/commandXml/remove", commandXmlRoute.remove);
app.post("/commandXml/update", commandXmlRoute.update);
app.post("/commandXml/checkVersion", commandXmlRoute.checkVersion);
app.post("/httpCommandXml/list", httpCommandXmlRoute.list);
app.post("/httpCommandXml/create", httpCommandXmlRoute.create);
app.post("/httpCommandXml/remove", httpCommandXmlRoute.remove);
app.post("/httpCommandXml/update", httpCommandXmlRoute.update);
app.post("/httpCommandXml/checkVersion", httpCommandXmlRoute.checkVersion);
app.post("/bridgeCommandXml/list", bridgeCommandXmlRoute.list);
app.post("/bridgeCommandXml/create", bridgeCommandXmlRoute.create);
app.post("/bridgeCommandXml/remove", bridgeCommandXmlRoute.remove);
app.post("/bridgeCommandXml/update", bridgeCommandXmlRoute.update);
app.post("/bridgeCommandXml/checkVersion", bridgeCommandXmlRoute.checkVersion);
app.post("/metaDataXml/list", mataDataXmlRoute.list);
app.post("/metaDataXml/create", mataDataXmlRoute.create);
app.post("/metaDataXml/remove", mataDataXmlRoute.remove);
app.post("/metaDataXml/update", mataDataXmlRoute.update);
app.post("/metaDataXml/checkVersion", mataDataXmlRoute.checkVersion);
app.post("/notificationXml/list", notificationXmlRoute.list);
app.post("/notificationXml/create", notificationXmlRoute.create);
app.post("/notificationXml/remove", notificationXmlRoute.remove);
app.post("/notificationXml/update", notificationXmlRoute.update);
app.post("/notificationXml/checkVersion", notificationXmlRoute.checkVersion);
app.post("/recordXml/list",recordXmlRoute.list);
app.post("/recordXml/create", recordXmlRoute.create);
app.post("/recordXml/remove", recordXmlRoute.remove);
app.post("/recordXml/update", recordXmlRoute.update);
app.post("/recordXml/checkVersion", recordXmlRoute.checkVersion);
app.post("/jobsXml/list",jobsXmlRoute.list);
app.post("/jobsXml/create", jobsXmlRoute.create);
app.post("/jobsXml/remove", jobsXmlRoute.remove);
app.post("/jobsXml/update", jobsXmlRoute.update);
app.post("/jobsXml/checkVersion", jobsXmlRoute.checkVersion);
app.post("/taskXml/list",taskXmlRoute.list);
app.post("/taskXml/create", taskXmlRoute.create);
app.post("/taskXml/remove", taskXmlRoute.remove);
app.post("/taskXml/update", taskXmlRoute.update);
app.post("/taskXml/checkVersion", taskXmlRoute.checkVersion);
app.post("/wolverineEventXml/list",wolverineEventXmlRoute.list);
app.post("/wolverineEventXml/create", wolverineEventXmlRoute.create);
app.post("/wolverineEventXml/remove", wolverineEventXmlRoute.remove);
app.post("/wolverineEventXml/update", wolverineEventXmlRoute.update);
app.post("/wolverineEventXml/checkVersion", wolverineEventXmlRoute.checkVersion);
app.post("/wolverineModuleXml/list",wolverineModuleXmlRoute.list);
app.post("/wolverineModuleXml/create", wolverineModuleXmlRoute.create);
app.post("/wolverineModuleXml/remove", wolverineModuleXmlRoute.remove);
app.post("/wolverineModuleXml/update", wolverineModuleXmlRoute.update);
app.post("/wolverineModuleXml/checkVersion", wolverineModuleXmlRoute.checkVersion);
app.post("/jsonSchema2Pojo/generate", jsonSchema2PojoRoute.generate);
app.post("/xmlForFu/backup", backupRoute.backup);
app.post("/xmlForFu/addVersion", backupRoute.addVersion);
app.post("/xmlForFu/versionList", backupRoute.versionList);
app.post("/xmlForFu/getCurrVersion", backupRoute.getCurrVersion);
app.post("/xmlForFu/updateCurrVersion", backupRoute.updateCurrVersion);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
 