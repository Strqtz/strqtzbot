import { Listener } from "discord-akairo";
import { Guild } from "discord.js";
import Prefix from "../structures/models/Prefix.js";
import GuildSettings from "../structures/models/GuildSettings.js";
import GuildSetting from "../structures/models/GuildSettings.js";

export default class guildCreateListener extends Listener {
  constructor() {
    super("guildCreateListener", {
      emitter: "client",
      event: "guildCreate",
    });
  }

  /**
   * @param {Guild} guild
   */

  async exec(guild) {
    let settings;
    settings = await GuildSetting.findOne({
      guildID: guild.id,
    });
    if (!settings) {
      let response = await GuildSetting.create({
        guildID: guild.id,
      });
      await response.save();
    }
  }
}
