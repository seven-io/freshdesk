exports = {
    async request(tpl, args) {
        delete args.iparams
        delete args.isInstall

        const {response} = await $request.invokeTemplate(tpl, {body: JSON.stringify(args)})
        const res = JSON.parse(response)

        if (typeof res !== 'string') return renderData(null, res)

        const status = 400
        const message = 'The authentication failed. Please check your API key.'

        return renderData({message, status})
    },
    async sendSMS(args) {
        return await this.request('sendSMS', args)
    },
    async sendVoice(args) {
        return await this.request('sendVoice', args)
    },
}
