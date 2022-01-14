import Client from "./structures/client/Client.js";
const { channel } = Client;
import mineflayer from "mineflayer";
import * as colors from "colors";
import { MessageEmbed } from "discord.js";
import cachios from "cachios";
import wait from "wait";
import schedule from "node-schedule";

const client = new Client();
const options = {
  username: process.env.MC_EMAIL,
  password: process.env.MC_PASSWORD,
  version: "1.8.9",
  host: "mc.hypixel.net",
  auth: "mojang",
};

export let mc;

function init() {
  console.log("Signing in!");
  mc = mineflayer.createBot(options);
  mc._client.once("session", (session) => (options.session = session));
}

function limbo() {
  mc.chat("/achat §c");
}

try {
  client.run();
  init();
} catch (e) {
  console.log(e);
}

mc.addChatPatternSet(
  "PARTY_INVITE",
  [
    /^-----------------------------\n(?:\[(.+\+?\+?)\] )?(.+) has invited you to join their party!\nYou have 60 seconds to accept. Click here to join!\n-----------------------------/,
  ],
  {
    parse: true,
  }
);

mc.addChatPatternSet(
  "PARTY_WARP",
  [/^(.+) warped the party to a SkyBlock dungeon!/],
  {
    parse: true,
  }
);

 mc.addChatPatternSet(
  "GET_G_ONLINE",
 [/^(.+) warped the party to a SkyBlock dungeon!/],
 {
    parse: true,
  }
 );

mc.on("kicked", async (reason) => {
  const gchannel = client.channels.cache.get("904675293640392724");
  const kickembed = new MessageEmbed();
  kickembed.setColor("#ff0000").setDescription("The bot was kicked for _" + reason + '_');
  await gchannel.send({ embeds: [kickembed] });
  setTimeout(() => {
    console.log("Connection failed. Retrying..");
    init();
  }, 60000);
});

mc.on("message", async (chatmsg) => {
  const gchannel = client.channels.cache.get("904675293640392724");
  let msg = chatmsg.toString();
  console.log("Minecraft: ".green + msg);
  if (msg.endsWith(" joined the lobby!") && msg.includes("[MVP+")) {
    limbo();
    console.log("Sending to limbo.");
  }
  if (!msg.includes("ArmorOfDivan")) {
    if (msg.startsWith("Guild > ")) {
      const embed = new MessageEmbed();
      const guildless = msg.replace("Guild > ", "");
      msg = guildless.substr(0, guildless.length);
      let ranklessMsg = msg.replaceAll(/\[(.*?)\]/g, "").split(": ")[0];
      if(ranklessMsg.includes(" left.")) {
        ranklessMsg = ranklessMsg.replace(" left.");
      } else if(ranklessMsg.includes(" joined.")) {
        ranklessMsg = ranklessMsg.replace(" joined.");
      }
      ranklessMsg = ranklessMsg.replaceAll(" ", "")
      console.log(ranklessMsg);
      embed.setThumbnail(`https://mc-heads.net/avatar/${ranklessMsg}/128.png`)
      if (
        msg.includes("[OWNER]") ||
        msg.includes("ADMIN") ||
        msg.includes("[YOUTUBER]")
      ) {
        embed.setColor("#FF5555").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else if (msg.includes("[MVP++]")) {
        embed.setColor("#FFAA00").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else if (msg.includes("[MVP+]") || msg.includes("[MVP]")) {
        embed.setColor("#3CE6E6").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else if (msg.includes("[VIP+]") || msg.includes("[VIP]")) {
        embed.setColor("#3CE63C").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else if (msg.includes("joined.")) {
        embed.setColor("#00ff00").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else if (msg.includes("left.")) {
        embed.setColor("#ff0000").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      } else {
        embed.setColor("#AAAAAA").setDescription(msg);
        await gchannel.send({ embeds: [embed] });
      }
    }
  }
});
function leaveparty() {
  mc.chat(`/p leave`);
}

mc.on("chat:PARTY_WARP", ([[username]]) => {
  if (mc.username === username) {
    return;
  }
  leaveparty();
});

mc.on("chat:PARTY_INVITE", async ([[rank, username]]) => {
  limbo();
  if (mc.username === username) {
    return;
  }

  const uuidb4data = await cachios.get(
    `https://api.mojang.com/users/profiles/minecraft/${username}`,
    {
      ttl: 60,
    }
  );
  const uuid = uuidb4data.data;

  const guildreq = await cachios.get(
    `https://api.hypixel.net/guild?player=${uuid.id}&key=${process.env.apiKey}`
  );

  const data = guildreq.data;

  if (data.guild != null) {
    if (data.guild.name === "StopThrowing") {
      mc.chat(`/p accept ${username}`);
      limbo();
      wait(5000).then(() => {
        mc.chat(`/p leave`);
      });
    }
  }
});
