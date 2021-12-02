import { Listener } from "discord-akairo";
import { GuildMember } from "discord.js";
import MessageExp from "../structures/models/MessageExp.js";

export default class guildMemberAddListener extends Listener {
  constructor() {
    super("guildMemberAdd", {
      emitter: "client",
      event: "guildMemberAdd",
    });
  }

  /**
   * @param {GuildMember} member
   */

  async exec(member) {
    let userExist;
    userExist = await MessageExp.findOne({
      discordID: member.id,
    });
    if (!userExist) {
      let expCreate = await MessageExp.create({
        discordID: member.id,
        exp: 0,
        level: 0,
      });
      await expCreate.save();
    } else {
      return false;
    }
  }
}
