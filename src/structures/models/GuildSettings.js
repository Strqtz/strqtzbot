import mongoose from "mongoose";

const {
    Schema
} = mongoose;

const GuildSetting = new Schema({
    guildID: {
        type: String,
        required: true
    },
    lfgChannel: {
        type: String
    },
    loggingChannel: {
        type: String
    },
    prefix: {
        type: String,
        default: "-"
    },
});
export default mongoose.model("guildsetting", GuildSetting);
