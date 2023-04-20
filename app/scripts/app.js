init()

async function init() {
    const client = await app.initialized()

    client.events.on('app.activated', async () => {
        const {contact} = await client.data.get('contact')
        const {mobile, phone} = contact
        const to = mobile || phone || ''

        const form = document.createElement('fw-form')
        const formContainer = document.querySelector('#form-container')
        const debugInput = {
            hint: 'Act as sandbox',
            id: 'debug',
            label: 'Debug?',
            name: 'debug',
            placeholder: null,
            required: false,
            type: 'CHECKBOX',
        }
        const fromInput = {
            id: 'from',
            label: 'From (overwrite)',
            name: 'from',
            required: false,
            type: 'TEXT',
        }
        const toInput = {
            id: 'to',
            label: 'To',
            name: 'to',
            required: true,
            type: 'TEXT',
        }
        const textInput = {
            id: 'text',
            label: 'Message',
            name: 'text',
            placeholder: 'Enter your Message',
            required: true,
            type: 'TEXT',
        }
        const formSchemaSms = [
            {
                ...toInput,
                hint: 'Specify multiple recipient separated by comma',
                placeholder: 'Enter recipient number(s)',
                position: 2,
            },
            {
                ...textInput,
                hint: 'Please provide a text of at max 1520 characters',
                position: 3,
            },
            {
                ...fromInput,
                hint: 'Specify a sender ID',
                placeholder: 'Max 16 numeric or 11 alphanumeric chars',
                position: 4,
            },
            {
                hint: 'A label for your statistics',
                id: 'label',
                label: 'Label',
                name: 'label',
                placeholder: 'Allowed: a-z, A-Z, 0-9, .-_@',
                position: 5,
                required: false,
                type: 'TEXT',
            },
            {
                hint: 'Custom identifier returned in callbacks',
                id: 'foreign_id',
                label: 'Foreign ID',
                name: 'foreign_id',
                placeholder: 'Allowed: a-z, A-Z, 0-9, .-_@',
                position: 6,
                required: false,
                type: 'TEXT',
            },
            {
                hint: 'Send as flash SMS',
                id: 'flash',
                label: 'Flash?',
                name: 'flash',
                placeholder: null,
                position: 7,
                required: false,
                type: 'CHECKBOX',
            },
            {
                ...debugInput,
                position: 8,
            },
            {
                hint: 'Allow duplicate SMS',
                id: 'no_reload',
                label: 'No Reload?',
                name: 'no_reload',
                placeholder: null,
                position: 9,
                required: false,
                type: 'CHECKBOX',
            },
            {
                hint: 'Track click performance for URLs',
                id: 'performance_tracking',
                label: 'Performance Tracking?',
                name: 'performance_tracking',
                placeholder: null,
                position: 10,
                required: false,
                type: 'CHECKBOX',
            },
        ]
        const formSchemaVoice = [
            {
                ...toInput,
                hint: 'Specify the number to call',
                placeholder: 'Enter recipient number',
                position: 2,
            },
            {
                ...textInput,
                hint: 'Please provide a text of at max 10000 characters',
                position: 3,
            },
            {
                ...fromInput,
                hint: 'Specify a caller ID',
                placeholder: 'Max 16 numeric characters',
                position: 4,
            },
            {
                ...debugInput,
                position: 5,
            },
            {
                hint: 'Enable if text is of XML type',
                id: 'xml',
                label: 'XML?',
                name: 'xml',
                placeholder: null,
                position: 6,
                required: false,
                type: 'CHECKBOX',
            },
        ]
        const validationSchemaSms = Yup.object().shape({
            foreign_id: Yup
                .string()
                .max(64, 'max 64 characters')
                .nullable(),
            label: Yup
                .string()
                .max(100, 'max 100 characters')
                .nullable(),
            from: Yup
                .string()
                .max(16, 'max 16 characters')
                .nullable(),
            text: Yup
                .string()
                .required('Text is required')
                .min(1, 'min 1 character')
                .max(1520, 'max 1520 characters'),
            to: Yup
                .string()
                .required('Specify at least one recipient'),
        })
        const validationSchemaVoice = Yup.object().shape({
            from: Yup
                .string()
                .max(11, 'max 11 characters')
                .nullable(),
            text: Yup
                .string()
                .required('Text is required')
                .min(1, 'min 1 character')
                .max(10000, 'max 10000 characters'),
            to: Yup
                .string()
                .required('Specify at least one recipient'),
        })
        form.formSchema = {
            name: 'Default Form',
            fields: [{
                choices: [
                    {
                        position: 1,
                        value: 'SMS',
                    },
                    {
                        position: 2,
                        value: 'Voice',
                    },
                ],
                id: 'method',
                label: 'Message Type',
                name: 'method',
                position: 1,
                required: true,
                type: 'RADIO',
            }],
        }
        form.initialValues = {
            to,
        }

        formContainer.prepend(form)

        form.addEventListener('fwFormValueChanged', e => {
            const {field, value} = e.detail

            if (field !== 'method') return

            const isSms = value === 'SMS'

            const fields = isSms ? formSchemaSms : formSchemaVoice
            form.formSchema.fields.splice(1, Infinity, ...fields)
            form.validationSchema = isSms ? validationSchemaSms : validationSchemaVoice

            const {from, voice_from} = client.context.settings
            form.setFieldValue('from', isSms ? from : voice_from)
        })

        document.querySelector('#submit').addEventListener('click', async e => {
            const {values, isValid} = await form.doSubmit(e)

            if (!isValid) return

            const {method, ...params} = values

            Object.entries(params).forEach(([k, v]) => {
                if (v === undefined || v === false || v === null) delete params[k]
            })

            const requestTpl = method === 'SMS' ? 'sendSMS' : 'sendVoice'
            let message, type
            try {
                const res = await client.request.invoke(requestTpl, params)
                message = `Message dispatched with response: ${res.response}`
                type = 'success'
            } catch (e) {
                message = e.message || 'Unexpected error.'
                type = 'danger'
            }

            client.interface.trigger('showNotify', {message, type})
        })

        document.querySelector('#reset').addEventListener('click', e => {
            form.doReset(e)
        })
    })
}
