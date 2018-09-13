var mongoose = require("mongoose");
var versionJson = {
    version: String
};

var versionSchema = new mongoose.Schema(versionJson);

exports.clientVersion = mongoose.model("clientVersion", versionSchema);