import { Listener } from "discord-akairo";
import moment from "moment";
import { MessageEmbed } from "discord.js";

export default class readyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }
  exec() {
    this.client.logging.log("info", `${this.client.user.tag} is online`);
    this.client.user.setPresence({
      activities: [{ name: "Me Being Developed", type: "WATCHING" }],
      status: "idle",
    });
  }
}
