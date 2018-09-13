var mongoose = require("mongoose");
var WolverineEventXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1, len=30; i<len; i++) {
    WolverineEventXmlJson["backupJsonStr"+i] = String;
}
var WolverineEventXmlSchema = new mongoose.Schema(WolverineEventXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("WolverineEventXmls");
} catch(e) {
    moduleTemp = mongoose.model("WolverineEventXmls", WolverineEventXmlSchema);
}
exports.wolverineEventXml = moduleTemp;