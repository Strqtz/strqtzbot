import mongoose from "mongoose";

const { Schema } = mongoose;

const repReqs = new Schema({
  id: { type: Number, default: 0 },
  type: { type: String },
  resolved: { type: Boolean, default: false },
});

const Rep = new Schema({
  discordID: { type: String, required: true },
  rep: { type: Number, required: true, default: 0 },
  mcUUID: { type: String, required: true },
  reqRequest: [repReqs],
});
export default mongoose.model("rep", Rep);
