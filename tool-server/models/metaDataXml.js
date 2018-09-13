var mongoose = require("mongoose");
var metaDataXmlJson = {
    version: Number,
    jsonStr: String,
    name: String,
    strutNames: String,
    category: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    metaDataXmlJson["backupJsonStr"+i] = String;
}
var metaDataXmlSchema = new mongoose.Schema(metaDataXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("metaDataXml");
} catch(e) {
    moduleTemp = mongoose.model("metaDataXml", metaDataXmlSchema);
}
exports.metaDataXml = moduleTemp;