var mongoose = require("mongoose");
var taskXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    taskXmlJson["backupJsonStr"+i] = String;
}
var taskXmlSchema = new mongoose.Schema(taskXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("taskXmls");
} catch(e) {
    moduleTemp = mongoose.model("taskXmls", taskXmlSchema);
}
exports.taskXml = moduleTemp;