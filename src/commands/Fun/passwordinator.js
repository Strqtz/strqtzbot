import { AkairoMessage, Command } from "discord-akairo";
import { Message } from "discord.js";
import cachios from "cachios";
import wait from "wait";

export default class PasswordinatorCommand extends Command {
  constructor() {
    super("passwordinator", {
      aliases: ["passwordinator", "passwordgen", "genpass", "password"],
      description: {
        content: "Generates a password",
        usage: "passwordinator <length> <num> <special-char> <capital>",
        examples: ["-passwordinator 10 true false true"],
      },
      args: [
        {
          id: "length",
          type: "number",
          description: "Numbers",
        },
        {
          id: "num",
          type: "boolean",
          description: "Numbers",
        },
        {
          id: "special",
          type: "boolean",
          description: "Special Character",
        },
        {
          id: "cap",
          type: "boolean",
          description: "Capitals",
        },
      ],
      channel: "all",
      slash: true,
      slashOptions: [
        {
          name: "length",
          type: "NUMBER",
          description: "Numbers",
          required: false,
        },
        {
          name: "num",
          type: "BOOLEAN",
          description: "Numbers",
          required: false,
        },
        {
          name: "special",
          type: "BOOLEAN",
          description: "Special Character",
          required: false,
        },
        {
          name: "cap",
          type: "BOOLEAN",
          description: "Capitals",
          required: false,
        },
      ],
      cooldown: 60000,
      ratelimit: 2,
    });
  }

  /**
   * @param {Message | AkairoMessage} message
   * @param {{num:boolean;special:boolean;cap:boolean;length:number}} args
   */

  async exec(message, args) {
    if (!args.length)
      return message.util.reply(
        "You need to specify a length for the password."
      );
    const req = await cachios.get(
      `https://passwordinator.herokuapp.com/generate?num=${args.num}&char=${args.special}&caps=${args.cap}&len=${args.length}`
    );
    const reqdata = req.data;
    const msg = await message.util.reply({
      content: "DMed you the newly generated password.",
    });
    await message.author.send("Your new password is: " + reqdata.data);
    await wait(5000);
    await msg.delete();
  }
}
