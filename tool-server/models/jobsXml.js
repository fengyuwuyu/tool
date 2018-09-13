var mongoose = require("mongoose");
var jobsXmlJson = {
    version: Number,
    jsonStr: String,
    clientVersion: String
};
for(var i=1; i<30; i++) {
    jobsXmlJson["backupJsonStr"+i] = String;
}
var jobsXmlSchema = new mongoose.Schema(jobsXmlJson);

var moduleTemp;
try {
    moduleTemp = mongoose.model("jobsXmls");
} catch(e) {
    moduleTemp = mongoose.model("jobsXmls", jobsXmlSchema);
}
exports.jobsXml = moduleTemp;