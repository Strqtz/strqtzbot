import { Listener } from "discord-akairo";
import moment from "moment";
import { MessageEmbed, Guild } from "discord.js";
import schedule from "node-schedule";

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
      activities: [{ name: "Me Being Developed", type: "WATCHING" }],
      status: "idle",
    });
    const online = {
             "true": "<:yes:927007251695276043>",
             "false": "<:no:927007278870171708>"
    }
    const channel = this.client.guild.channels.cache.get("927000023345021038");
    if(channel) {
      const job = await schedule.scheduleJob("60 * * * * *", function() {
        const req = await cachios.get(`https://api.hypixel.net/status?key=${process.env.apiKey}&uuid=b430f6a32ce6461398d2644e56044546`, {ttl: 59});
        const embed = new MessageEmbed().setTitle("Fragbot Status").setDescription("**Online:** " + online[req.data.session.online]);
        const msg = channel.send({embeds: [embed]});
        wait(58000);
        msg.delete();
      })
    }
  }
}
