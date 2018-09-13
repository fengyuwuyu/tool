var mongoose = require("mongoose");
var typeXmlJson = {
    version: Number,
    jsonStr: String,
    name: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    typeXmlJson["backupJsonStr"+i] = String;
}
var typeXmlSchema = new mongoose.Schema(typeXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("typeXmls");
} catch(e) {
    moduleTemp = mongoose.model("typeXmls", typeXmlSchema);
}
exports.typeXml = moduleTemp;