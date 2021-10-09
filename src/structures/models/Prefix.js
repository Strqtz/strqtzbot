const { Schema, model } = require("mongoose");
const Prefix = new Schema({
  guildID: { type: String, required: true, unique: true },
  guildPrefix: { type: String, required: true, default: "-" },
});
module.exports = model("prefix", Prefix);
