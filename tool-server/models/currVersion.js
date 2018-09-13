var mongoose = require("mongoose");
var currVersionJson = {
    currVersion: String
};

var currVersionSchema = new mongoose.Schema(currVersionJson);

exports.currVersion = mongoose.model("currVersion", currVersionSchema);