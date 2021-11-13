import mongoose from "mongoose";

const { Schema } = mongoose;

const GuildApplication = new Schema({
  guild: { type: String, required: true, unique: true },
  channel: { type: String, required: true, unique: true },
  cata: { type: Number, required: true, default: 20 },
  sa: { type: Number, required: true, default: 30 },
  nw: { type: Number, required: true, default: 200000000 },
  pingchannel: { type: String, required: true, unique: true },
  pingrole: { type: String, required: true, unique: true },
});
export default mongoose.model("gapp", GuildApplication);
