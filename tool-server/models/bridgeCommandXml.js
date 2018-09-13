var mongoose = require("mongoose");
var bridgeCommandXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    bridgeCommandXmlJson["backupJsonStr"+i] = String;
}
var bridgeCommandXmlSchema = new mongoose.Schema(bridgeCommandXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("bridgeCommandXmls");
} catch(e) {
    moduleTemp = mongoose.model("bridgeCommandXmls", bridgeCommandXmlSchema);
}
exports.bridgeCommandXml = moduleTemp;