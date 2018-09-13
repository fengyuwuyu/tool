var mongoose = require("mongoose");
var notificationXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    notificationXmlJson["backupJsonStr"+i] = String;
}
var notificationXmlSchema = new mongoose.Schema(notificationXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("notificationXmls");
} catch(e) {
    moduleTemp = mongoose.model("notificationXmls", notificationXmlSchema);
}
exports.notificationXml = moduleTemp;