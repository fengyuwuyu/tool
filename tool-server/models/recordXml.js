var mongoose = require("mongoose");
var recordXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    recordXmlJson["backupJsonStr"+i] = String;
}
var recordXmlSchema = new mongoose.Schema(recordXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("recordXmls");
} catch(e) {
    moduleTemp = mongoose.model("recordXmls", recordXmlSchema);
}
exports.recordXml = moduleTemp;