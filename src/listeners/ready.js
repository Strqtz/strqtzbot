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
    this.client.user.setPresence({
      activities: [{ name: "You Sleep", type: "WATCHING" }],
      status: "dnd",
    });
    this.client.logging.log(
      "info",
      `${this.client.user.tag} is online. Watching ${this.client.guilds.cache.size} servers. ${this.client.ws.shards.size} shards.`
    );
    this.client.logging.log(
      "info",
      `${this.client.commandHandler.modules.size} Commands Loaded. ${this.client.listenerHandler.modules.size} Listeners Loaded. ${this.client.inhibitorHandler.modules.size} Inhibitors Loaded.`
    );
  }
}
