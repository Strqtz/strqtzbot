import { Listener } from "discord-akairo";
import moment from "moment";
import { MessageEmbed, Guild } from "discord.js";
import schedule from "node-schedule";
import cachios from "cachios";
import wait from "wait";

export default class readyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }

  /**
   * @param {Guild} guild
   */
  async exec(guild) {
    this.client.logging.log("info", `${this.client.user.tag} is online`);
    this.client.user.setPresence({
      activities: [{ name: "With My Balls", type: "PLAYING" }],
      status: "dnd",
    });
  }
}
