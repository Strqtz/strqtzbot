const winston = require("winston");
const {Listener} = require("discord-akairo");

class readyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
        });
    }
    exec() {
        const colour = Math.floor(Math.random()*16777215).toString(16);
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
            colorize: true,
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
            ]
        });
        logger.log('info', `${this.client.user.tag} is online`);
        this.client.user.setPresence({ activities: [{name: 'Me Being Developed', type: "WATCHING"}], status: "idle"});
    }
}
module.exports = readyListener;