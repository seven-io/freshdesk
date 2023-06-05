(async () => {
    const client = await app.initialized()

    const fromInput = {
        id: 'from',
        label: 'From',
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
    const yupShapes = {
        from: Yup
            .string()
            .max(16, 'max 16 characters')
            .nullable(),
    }

    let form = null

    client.events.on('app.activated', async () => {
        const smsForm = document.createElement('fw-form')
        const voiceForm = document.createElement('fw-form')
        const formContainer = document.querySelector('#form-container')
        const {contact} = await client.data.get('contact')
        const to = contact.mobile || contact.phone || ''

        if (!form) {
            form = buildForm()

            formContainer.prepend(form)
        }

        document.querySelector('#reset').addEventListener('click', e => {
            form.doReset(e)
            smsForm.doReset(e)
            voiceForm.doReset(e)

            removeMessageForms()
        })

        document.querySelector('#submit').addEventListener('click', async e => {
            const msgTypeValidation = await form.doSubmit(e)
            if (!msgTypeValidation.isValid) return

            const msgType = (await form.getValues()).values.method
            const isSMS = msgType === 'SMS'
            const msgForm = isSMS ? smsForm : voiceForm
            const {isValid, values} = await msgForm.doSubmit(e)

            if (!isValid) return

            await submit(isSMS ? 'sendSMS' : 'sendVoice', values)

            reset(e)
        })

        function buildForm() {
            const form = document.createElement('fw-form')
            form.formSchema = {
                name: 'Message Type Form',
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
            form.validationSchema = Yup.object().shape({
                method: Yup
                    .string()
                    .required('Specify a message type'),
            })

            form.addEventListener('fwFormValueChanged', e => {
                const {field, value} = e.detail

                if (field !== 'method') return

                if (!value) return removeMessageForms()

                const isSms = value === 'SMS'

                isSms ? renderSmsForm() : renderVoiceForm()
            })

            return form
        }

        function removeMessageForms() {
            smsForm.remove()
            voiceForm.remove()
        }

        async function renderSmsForm() {
            voiceForm.remove()

            smsForm.formSchema = {
                name: 'SMS Form',
                fields: [
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
                        hint: 'Allow duplicate SMS',
                        id: 'no_reload',
                        label: 'No Reload?',
                        name: 'no_reload',
                        placeholder: null,
                        position: 8,
                        required: false,
                        type: 'CHECKBOX',
                    },
                    {
                        hint: 'Track click performance for URLs',
                        id: 'performance_tracking',
                        label: 'Performance Tracking?',
                        name: 'performance_tracking',
                        placeholder: null,
                        position: 9,
                        required: false,
                        type: 'CHECKBOX',
                    },
                ],
            }
            smsForm.initialValues = {
                to,
            }
            smsForm.validationSchema = Yup.object().shape({
                ...yupShapes,
                foreign_id: Yup
                    .string()
                    .max(64, 'max 64 characters')
                    .nullable(),
                label: Yup
                    .string()
                    .max(100, 'max 100 characters')
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

            smsForm.setFieldValue('from', client.context.settings.from)

            formContainer.append(smsForm)
        }

        async function renderVoiceForm() {
            smsForm.remove()

            voiceForm.formSchema = {
                name: 'Voice Form',
                fields: [
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
                        hint: 'Enable if text is of XML type',
                        id: 'xml',
                        label: 'XML?',
                        name: 'xml',
                        placeholder: null,
                        position: 5,
                        required: false,
                        type: 'CHECKBOX',
                    },
                ],
            }
            voiceForm.initialValues = {
                to,
            }
            voiceForm.validationSchema = Yup.object().shape({
                ...yupShapes,
                text: Yup
                    .string()
                    .required('Text is required')
                    .min(1, 'min 1 character')
                    .max(10000, 'max 10000 characters'),
                to: Yup
                    .string()
                    .required('Specify at least one recipient'),
            })

            voiceForm.setFieldValue('from', client.context.settings.from_voice)

            formContainer.append(voiceForm)
        }

        function reset(e) {
            form.doReset(e)
            smsForm.doReset(e)
            voiceForm.doReset(e)

            removeMessageForms()
        }

        async function submit(requestTpl, params) {
            let message
            let type = 'danger'

            try {
                const res = await client.request.invoke(requestTpl, params)
                type = 'success'

                const code = Number.parseInt(res.response.success)
                message = `Action dispatched with code: ${code}`
                switch (code) {
                    case 100:
                        message = 'Message sent!'
                        break
                    case 202:
                        message = 'Invalid recipient'
                        break
                }
            } catch (e) {
                message = e.message
            }

            client.interface.trigger('showNotify', {message, type})
        }
    })
})()
