import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from "discord-akairo";
import { Intents, Message } from "discord.js";
import winston from "winston";
import mongoose from "mongoose";
import Prefix from "../models/Prefix.js";

import dotenv from "dotenv";

dotenv.config();

export default class Client extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: ["686844201190555668", "545129735970226177"],
      },
      {
        disableMentions: "everyone",
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.DIRECT_MESSAGES,
        ],
      }
    );

    const customlog = winston.createLogger({
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

    /**
     * @param {Message | AkairoMessage} message
     */

    this.prefix = async (message) => {
      const prefixDb = await Prefix.findOne({ guildID: message.guildId });
      const prefixGuildPrefix = prefixDb.get("guildPrefix");
      return prefixGuildPrefix;
    };

    this.logging = customlog;

    this.emoji = {
      yesstatus: 906856708775747645,
      nostatus: 906856917916319754,
      maybestatus: 906857018227310603,
    };

    this.colour = Math.floor(Math.random() * 16777215).toString(16);

    this.commandHandler = new CommandHandler(this, {
      directory: "./src/commands",
      prefix: this.prefix,
      handleEdits: true,
      commandUtil: true,
      autoRegisterSlashCommands: true,
      allowMention: true,
      blockBots: true,
      defaultCooldown: 10000,
      autoDefer: true,
      typing: false,
      automateCategories: true,
    });
    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: "./src/inhibitors",
    });
    this.listenerHandler = new ListenerHandler(this, {
      directory: "./src/listeners",
    });
  }
  run() {
    this.commandHandler.loadAll();
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.loadAll();
    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.inhibitorHandler.loadAll();
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
