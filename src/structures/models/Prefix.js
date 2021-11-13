import mongoose from "mongoose";

const { Schema } = mongoose;

const Prefix = new Schema({
  guildID: { type: String, required: true, unique: true },
  guildPrefix: { type: String, required: true, default: "-" },
});
export default mongoose.model("prefix", Prefix);
