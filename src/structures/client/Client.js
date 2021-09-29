const { AkairoClient, CommandHandler, MongooseProvider } = require('discord-akairo');
const { Intents } = require('discord.js');
const guildModel = require('./../schemas/guildSchema')
const winston = require('winston');
require('dotenv').config();

class Client extends AkairoClient {
    constructor() {
        super({
            ownerID: '686844201190555668',
        }, {
            disableMentions: 'everyone',
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        });

        this.commandHandler = new CommandHandler( this, {
            directory: './src/commands',
            prefix: '-',
            handleEdits: true,
            commandUtil: true,
        });

        this.settings = new MongooseProvider(guildModel);
    }
        async run () {
            const logger = winston.createLogger({
                level: 'info',
                format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
                transports: [
                    new winston.transports.File({ filename: 'error.log', level: 'error' }),
                    new winston.transports.File({ filename: 'combined.log' }),
                  ]
            });

            this.settings.init();
            this.commandHandler.loadAll();
            this.login(process.env.token).then(() => {
                logger.log('info', "The Bot is Online");
            }).catch((e) => {
                logger.log('error', e)
            });
            
    }
}

module.exports = Client;