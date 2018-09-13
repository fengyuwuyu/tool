var mongoose = require("mongoose");
var backupJson = {
    des: String,
    time: String
};
var backupSchema = new mongoose.Schema(backupJson);

exports.backup = mongoose.model("backups", backupSchema);

