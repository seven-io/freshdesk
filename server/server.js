exports = {
    request: function(endpoint, params, args) {
        $request.post('https://gateway.sms77.io/api/' + endpoint, {
            body: JSON.stringify(Object.assign({
                debug: Number(args.debug),
                json: 1,
                text: args.text,
                to: args.to
            }, params)),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                SentWith: 'freshworks',
                'X-Api-Key': args.iparams.api_key
            }
        }).then(
            function(data) {
                console.log('postRequest', data)

                try {
                    var success = Number.parseInt(JSON.parse(data.response).success)
                } catch (e) {
                    return renderData({message: e.message, status: 400})
                }

                return renderData(null, success)
            }
        )
    },

    sendSMS: function(args) {
        return this.request('sms', {
            flash: Number(args.flash),
            foreign_id: args.foreign_id,
            label: args.label,
            from: '' === args.from ? args.iparams.from : args.from,
            no_reload: Number(args.no_reload),
            performance_tracking: Number(args.performance_tracking)
        }, args)
    },

    sendVoice: function(args) {
        return this.request('voice', {
            from: '' === args.from ? args.iparams.voice_from : args.from,
            xml: Number(args.xml)
        }, args)
    }
}
