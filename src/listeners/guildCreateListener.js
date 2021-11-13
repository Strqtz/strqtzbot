import { Listener } from "discord-akairo";
import { Guild } from "discord.js";
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

    fs.writeFile(
      `../../configurations/` + guild.id + ".json",
      "guild: " + guild.id,
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  }
}
