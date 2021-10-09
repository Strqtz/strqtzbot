const {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  AkairoMessage,
} = require("discord-akairo");
const { Intents, Message } = require("discord.js");
const winston = require("winston");
const mongoose = require("mongoose");
const Prefix = require("../models/Prefix");
require("dotenv").config();

class Client extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: "686844201190555668",
      },
      {
        disableMentions: "everyone",
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
      }
    );

    /**
     *
     * @param {Message | AkairoMessage} message
     */

    this.prefix = async (message) => {
      const prefixDb = await Prefix.findOne({ guildID: message.guildId });
      const prefixGuildPrefix = prefixDb.get("guildPrefix");
      return prefixGuildPrefix;
    };

    this.logging = winston.createLogger({
      level: "info",
      format: winston.format.printf(
        (log) => `[${log.level.toUpperCase()}] - ${log.message}`
      ),
      colorize: true,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
      ],
    });

    this.commandHandler = new CommandHandler(this, {
      directory: "./src/commands",
      prefix: this.prefix,
      handleEdits: true,
      commandUtil: true,
      autoRegisterSlashCommands: true,
      execSlash: true,
      allowMention: true,
    });
    this.listenerHandler = new ListenerHandler(this, {
      directory: "./src/listeners",
    });
  }
  async run() {
    this.commandHandler.loadAll();
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    mongoose
      .connect(process.env.MONGODBURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        this.logging.log("info", "Connected To MongoDB");
      })
      .catch((e) => {
        this.logging.log("error", e);
      });

    this.login(process.env.token);
  }
}

module.exports = Client;
