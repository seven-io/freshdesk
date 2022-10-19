exports = {
    onAppInstallHandler: async function() {
        renderData()
    },
    onAppUninstallHandler: async function() {
        renderData()
    },
    onTicketCreateHandler: async function() {
        renderData()
    },
    onScheduledEventHandler: async function() {
        renderData()
    },
    onExternalEventHandler: async function() {
        renderData()
    },
    request: async function(endpoint, params, args) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            SentWith: 'freshworks',
            'X-Api-Key': args.iparams.api_key,
        }
        const body = Object.assign({
            debug: Number(args.debug),
            json: 1,
            text: args.text,
            to: args.to,
        }, params)

        try {
            const {response} = await $request.post('https://gateway.sms77.io/api/' + endpoint, {
                body: JSON.stringify(body),
                headers,
            })
            const success = Number.parseInt(JSON.parse(response).success)

            return renderData(null, success)
        } catch (e) {
            return renderData({message: e.message, status: 400})
        }
    },
    sendSMS: async function(args) {
        const params = {
            flash: Number(args.flash),
            foreign_id: args.foreign_id,
            label: args.label,
            from: '' === args.from ? args.iparams.from : args.from,
            no_reload: Number(args.no_reload),
            performance_tracking: Number(args.performance_tracking),
        }

        return await this.request('sms', params, args)
    },
    sendVoice: async function(args) {
        const params = {
            from: '' === args.from ? args.iparams.voice_from : args.from,
            xml: Number(args.xml),
        }

        return await this.request('voice', params, args)
    },
}
