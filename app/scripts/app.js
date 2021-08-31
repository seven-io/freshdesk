'use strict'

/**
 * Render the application on click
 */
document.onreadystatechange = function() {
    if (document.readyState === 'interactive') app.initialized().then(function(_client) {
        window.client = _client

        client.events.on('app.activated', function() {
            document.querySelectorAll('input[name="method"]').forEach(function(input) {
                input.addEventListener('click', function(e) {
                    var isSMS = 'sendSMS' === e.target.value

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

            client.data.get('contact').then(function(data) {
                if (data.contact.mobile)
                    document.getElementById('to').value = data.contact.mobile
            }, function(e) {
                console.error('Error fetching contact data:', e)
            })
        })
    }).catch(function(e) {
        console.error('An error occurred. Details:', e)
    })
}

/**
 * Notify user with status and message
 * @param {String} status - the type of the notification
 * @param {String} message - the content to be shown in the notification
 */
function notifyUser(status, message) {
    client.interface.trigger('showNotify', {
        message: message,
        type: status
    })
}

/**
 * Send SMS/TTS to user with the given message and status
 */
function sendMessage() {
    var to = getElementValueById('to')
    var text = getElementValueById('text')

    if (!to)
        return notifyUser('warning', 'Please enter the recipient\'s mobile number.')

    if (!text)
        return notifyUser('warning', 'Please enter some message content.')

    var params = {
        debug: isElementByIdChecked('debug'),
        from: getElementValueById('from'),
        text: text,
        to: to
    }

    var method = document.querySelector('input[name="method"]:checked').value

    if ('sendSMS' === method) {
        params.flash = isElementByIdChecked('flash')
        params.foreign_id = getElementValueById('foreign_id')
        params.label = getElementValueById('label')
        params.no_reload = isElementByIdChecked('no_reload')
        params.performance_tracking = isElementByIdChecked('performance_tracking')
    } else params.xml = isElementByIdChecked('xml')

    client.request.invoke(method, params)
        .then(function(res) {
            notifyUser('success', 'Message dispatched with response: ' + res.response)
        })
        .catch(function(e) {
            notifyUser('danger', e.message || 'Unexpected error.')
        })
}

function getElementValueById(id) {
    return document.getElementById(id).value
}

function isElementByIdChecked(id) {
    return document.getElementById(id).checked
}
