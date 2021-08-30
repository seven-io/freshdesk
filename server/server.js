exports = {
    sendSMS: function(args) {
        const headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            SentWith: 'freshdesk',
            'X-Api-Key': args.iparams.api_key,
        }

        const params = {
            debug: Number(args.debug),
            flash: Number(args.flash),
            foreign_id: args.foreign_id,
            json: 1,
            label: args.label,
            from: '' === args.from ? args.iparams.from : args.from,
            no_reload: Number(args.no_reload),
            performance_tracking: Number(args.performance_tracking),
            text: args.text,
            to: args.to,
        }

        return $request.post('https://gateway.sms77.io/api/sms', {
            body: JSON.stringify(params),
            headers,
        })
    },
}
