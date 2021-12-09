// import { AkairoMessage, Command } from "discord-akairo";
// import { Message } from "discord.js";
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
//   exec(message, args) {}
// }
