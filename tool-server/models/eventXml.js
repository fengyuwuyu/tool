var mongoose = require("mongoose");
var eventXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    eventXmlJson["backupJsonStr"+i] = String;
}
var eventXmlSchema = new mongoose.Schema(eventXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("eventXmls");
} catch(e) {
    moduleTemp = mongoose.model("eventXmls", eventXmlSchema);
}
exports.eventXml = moduleTemp;