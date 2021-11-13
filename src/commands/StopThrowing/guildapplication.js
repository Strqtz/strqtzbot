import { AkairoMessage, Command } from "discord-akairo";
import { Client, Message, Channel, Role } from "discord.js";
import Configstore from "configstore";
import * as fs from "fs";

export default class GuildApplicationCommand extends Command {
  constructor() {
    super("guildappcreate", {
      aliases: ["guildappcreate"],
      category: "stopthrowing",
      description: {
        content: "Creates a message embed in the specified channel",
        usage: "guildappcreate [channel]",
        examples: ["-guildappcreate #apps"],
      },
      args: [
        {
          name: "channel",
          description: "The channel to send the application to",
          type: "channel",
        },
        {
          name: "pingrole",
          type: "role",
          description: "The role to ping upon a successful application",
        },
        {
          name: "pingchannel",
          type: "channel",
          description:
            "The channel to send a message to upon a successful application",
        },
        {
          name: "catareq",
          type: "integer",
          description:
            "The catacombs level required for the application default 20",
          default: 20,
        },
        {
          name: "sareq",
          type: "integer",
          description:
            "The skill average required for the application; default 30",
          default: 30,
        },
        {
          name: "nwreq",
          type: "number",
          description:
            "The networth required for the application default 200,000,000",
          default: 200000000,
        },
        {
          name: "lilyweight",
          type: "number",
          description: "The weight required for the application default 1000",
          default: 1000,
        },
      ],
      channel: "guild",
      userPermissions: ["SEND_MESSAGES"],
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  /**
   * @param {Message} message
   * @param {{channel: Channel; catareq: Number; sareq: Number; nwreq: Number; pingrole: Role; pingchannel: Channel; lilyweight: Number}} args
   */

  exec(message, args) {
    try {
    } catch (e) {
      this.client.logging.log("error", e);
    }
  }
}
