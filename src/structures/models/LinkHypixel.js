import mongoose from "mongoose";

const { Schema } = mongoose;

const LinkHypixel = new Schema({
  uuid: { type: String, required: true, unique: true },
  discordID: { type: String, required: true, unique: true },
});
export default mongoose.model("linkhypixel", LinkHypixel);
