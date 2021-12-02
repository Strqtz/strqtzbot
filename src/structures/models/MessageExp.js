import mongoose from "mongoose";

const { Schema } = mongoose;

const MessageExp = new Schema({
  discordID: { type: String, required: true, unique: true },
  exp: { type: Number, required: true, default: 0 },
  level: { type: Number, required: true, default: 0 },
});
export default mongoose.model("messageexp", MessageExp);
