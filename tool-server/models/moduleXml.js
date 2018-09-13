var mongoose = require("mongoose");
var moduleXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    moduleXmlJson["backupJsonStr"+i] = String;
}
var moduleXmlSchema = new mongoose.Schema(moduleXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("moduleXmls");
} catch(e) {
    moduleTemp = mongoose.model("moduleXmls", moduleXmlSchema);
}
exports.moduleXml = moduleTemp;