var mongoose = require("mongoose");
var httpCommandXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    httpCommandXmlJson["backupJsonStr"+i] = String;
}
var httpCommandXmlSchema = new mongoose.Schema(httpCommandXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("httpCommandXmls");
} catch(e) {
    moduleTemp = mongoose.model("httpCommandXmls", httpCommandXmlSchema);
}
exports.httpCommandXml = moduleTemp;