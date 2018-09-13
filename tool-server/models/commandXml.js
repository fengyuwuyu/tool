var mongoose = require("mongoose");
var commandXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    commandXmlJson["backupJsonStr"+i] = String;
}
var commandXmlSchema = new mongoose.Schema(commandXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("commandXmls");
} catch(e) {
    moduleTemp = mongoose.model("commandXmls", commandXmlSchema);
}
exports.commandXml = moduleTemp;