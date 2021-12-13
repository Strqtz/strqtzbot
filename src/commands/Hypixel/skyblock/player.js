// import {
//    AkairoApplicationCommandAutocompleteOption,
//   AkairoMessage,
//   Command,
// } from "discord-akairo";
// import { Message, MessageEmbed } from "discord.js";
// import LilyWeight from "lilyweight";
// import Humanize from "humanize-plus";
// import cachios from "cachios";
//
// export default class PlayerCommand extends Command {
//   constructor() {
//     super("player", {
//       aliases: ["player"],
//       description: {
//         content: "Shows information about the player's skyblock profile",
//         usage: "player <player>",
//         examples: ["-player Strqtz"],
//       },
//       args: [
//         {
//           id: "ign",
//           type: "string",
//           description: "A players in-game name",
//         },
//         {
//           id: "profile",
//         },
//       ],
//       channel: "all",
//       slash: true,
//       slashOptions: [
//         {
//           name: "ign",
//           type: "STRING",
//           description: "A players in-game name",
//           required: false,
//         },
//         { name: "profile", type: "STRING" },
//       ],
//       cooldown: 60000,
//       ratelimit: 2,
//     });
//   }
//
//   /**
//    * @param {Message | AkairoMessage} message
//    * @param {{ign:string}} args
//    */
//
//   async exec(message, args) {
//     const lilyweight = new LilyWeight(process.env.apiKey);
//
//     const uuidreq = await cachios.get(
//       `https://api.mojang.com/users/profiles/minecraft/${args.ign}`,
//       { ttl: 120 }
//     );
//     const uuiddata = uuidreq.data;
//
//     // const profiles = await cachios.get(
//     //   `https://api.hypixel.net/skyblock/profiles?key=${process.env.apiKey}&uuid=${uuiddata.id}`,
//     //   { ttl: 60 }
//     // );
//     // const profilesdata = profiles.data;
//     //
//     // const userstuffs = profilesdata.profiles[0].members + uuiddata.id;
//     //
//     // const sheesh = await cachios.post(
//     //   `https://nariah-dev.com/api/networth/categories`,
//     //   userstuffs + "." + uuiddata.id,
//     //   { ttl: 60 }
//     // );
//
//     // console.log(JSON.stringify(sheesh.data));
//
//     let friendsreq = await cachios.get(
//       `https://api.hypixel.net/friends?key=` +
//         process.env.apiKey +
//         "&uuid=" +
//         uuiddata.id,
//       { ttl: 60 }
//     );
//
//     const friendsdata = friendsreq.data;
//
//     const embed = new MessageEmbed()
//       .setTitle(`${uuiddata.name}`)
//       .setThumbnail(
//         `https://crafatar.com/avatars/${uuiddata.id}?size=32&overlay&default=717eb72c52024fbaa91a3e61f34b3b58`
//       )
//       .setDescription(
//         `${uuiddata.name} has **${friendsdata.records.length}** friends.`
//       );
//
//     if (uuidreq) {
//       await lilyweight.getWeight(uuiddata.id).then((weight) => {
//         embed.addField(
//           `Weight:`,
//           Humanize.formatNumber(weight.total.toString(), 2)
//         );
//       });
//     }
//
//     await message.util.reply({ embeds: [embed] });
//   }
// }
