import { Listener } from "discord-akairo";
import { Channel, Guild } from "discord.js";
import Prefix from "../structures/models/Prefix.js";
import fs from "fs";

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
    let everyoneRole = guild.roles.cache.find((r) => r.name === "@everyone");
    let prefixSet;
    prefixSet = await Prefix.findOne({
      guildID: guild.id,
    });
    if (!prefixSet) {
      let response = await Prefix.create({
        guildID: guild.id,
        guildPrefix: "-",
      });
      response.save();
    }
    if (
      guild.channels.cache.find(
        (c) => c.name === "Members: " + guild.memberCount
      )
    ) {
      return false;
    } else {
      return guild.channels.create(`Members: ` + guild.memberCount, {
        type: "GUILD_VOICE",
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: "CONNECT",
          },
        ],
      });
    }
  }
}
