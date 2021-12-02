import { Listener } from "discord-akairo";
import { Guild } from "discord.js";
import Prefix from "../structures/models/Prefix.js";

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
    let prefixSet;
    prefixSet = await Prefix.findOne({
      guildID: guild.id,
    });
    if (!prefixSet) {
      let response = await Prefix.create({
        guildID: guild.id,
      });
      await response.save();
    }
  }
}
