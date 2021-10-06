class ready extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
        })
    }
}