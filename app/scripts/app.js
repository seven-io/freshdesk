'use strict'

/**
 * Render the application on click
 */
document.onreadystatechange = () => {
    if (document.readyState === 'interactive') app.initialized().then(_client => {
        window.client = _client

        client.events.on('app.activated', async () => {
            const {contact} = await client.data.get('contact')
            const {mobile, phone} = contact
            const to = mobile || phone || ''

            document.querySelectorAll('input[name="method"]').forEach(input => {
                input.addEventListener('click', e => {
                    document.getElementById('to').value = to

                    const isSMS = 'sendSMS' === e.target.value

                    document.getElementById('from').placeholder = isSMS
                        ? 'Max 16 numeric or 11 alphanumeric chars'
                        : 'Must be verified or a shared number'

                    document.getElementById('text').maxLength = isSMS ? 1520 : 10000

                    toggleSmsParamVisibility('param_flash')
                    toggleSmsParamVisibility('param_foreign_id')
                    toggleSmsParamVisibility('param_label')
                    toggleSmsParamVisibility('param_no_reload')
                    toggleSmsParamVisibility('param_performance_tracking')

                    document.getElementById('param_xml').style.display =
                        isSMS ? 'none' : 'block'

                    function toggleSmsParamVisibility(id) {
                        document.getElementById(id).style.display =
                            isSMS ? 'block' : 'none'
                    }
                })
            })

            document.getElementById('send_message').addEventListener('click', sendMessage)

            document.getElementById('to').value = to
        })
    }).catch(e => notifyUser('danger', 'An error occurred. Details: ' + e.message))
}

/**
 * Notify user with status and message
 * @param {String} status - the type of the notification
 * @param {String} message - the content to be shown in the notification
 */
function notifyUser(status, message) {
    client.interface.trigger('showNotify', {
        message: message,
        type: status,
    })
}

/**
 * Send SMS/TTS to user with the given message and status
 */
function sendMessage() {
    const to = getElementValueById('to')
    const text = getElementValueById('text')

    if (!to)
        return notifyUser('warning', 'Please enter the recipient\'s mobile number.')

    if (!text)
        return notifyUser('warning', 'Please enter some message content.')

    const params = {
        debug: isElementByIdChecked('debug'),
        from: getElementValueById('from'),
        text: text,
        to: to,
    }

    const method = document.querySelector('input[name="method"]:checked').value

    switch (method) {
        case 'sendSMS':
            params.flash = isElementByIdChecked('flash')
            params.foreign_id = getElementValueById('foreign_id')
            params.label = getElementValueById('label')
            params.no_reload = isElementByIdChecked('no_reload')
            params.performance_tracking = isElementByIdChecked('performance_tracking')
            break
        case 'sendVoice':
            params.xml = isElementByIdChecked('xml')
            break
        default:
            throw new Error(`Unknown method "${method}"`)
    }

    client.request.invoke(method, params)
        .then(res => notifyUser('success', 'Message dispatched with response: ' + res.response))
        .catch(e => notifyUser('danger', e.message || 'Unexpected error.'))
}

function getElementValueById(id) {
    return document.getElementById(id).value
}

function isElementByIdChecked(id) {
    return document.getElementById(id).checked
}
