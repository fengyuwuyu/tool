var mongoose = require("mongoose");
var wolverineModuleXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    wolverineModuleXmlJson["backupJsonStr"+i] = String;
}
var wolverineModuleXmlSchema = new mongoose.Schema(wolverineModuleXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("wolverineModuleXmls");
} catch(e) {
    moduleTemp = mongoose.model("wolverineModuleXmls", wolverineModuleXmlSchema);
}
exports.wolverineModuleXml = moduleTemp;