'use strict'

/**
 * Notify user with message and type
 * @param {String} status - type of the notification
 * @param {String} message - content to be shown in the notification
 */
function notifyUser(status, message) {
    client.interface.trigger('showNotify', {
        type: status,
        message: message,
    })
}

/**
 * Send SMS notification to user with the given message and status
 */
function notifySMS() {
    var to = document.getElementById('to').value
    var text = document.getElementById('text').value

    if (!to)
        return notifyUser('warning', 'Please enter the recipient\'s mobile number.')

    if (!text)
        return notifyUser('warning', 'Please enter some message content.')

    var params = {
        debug: document.getElementById('debug').checked,
        flash: document.getElementById('flash').checked,
        foreign_id: document.getElementById('foreign_id').value,
        from: document.getElementById('from').value,
        label: document.getElementById('label').value,
        no_reload: document.getElementById('no_reload').checked,
        performance_tracking: document.getElementById('performance_tracking').checked,
        text: text,
        to: to,
    }

    client.request.invoke('sendSMS', params)
        .then(function() {
            notifyUser('success', 'Message sent successfully.')
        })
        .catch(function(error) {
            notifyUser('danger', error.message || 'Unexpected error.')
        })
}

/**
 * Render the application on click of the user notification SMS
 */
document.onreadystatechange = function() {
    if (document.readyState === 'interactive') app.initialized().then(function(_client) {
        window.client = _client

        client.events.on('app.activated', onAppActivate)
    }).catch(function(err) {
        console.error(`Error occurred. Details:`, err)
    })
}

function onAppActivate() {
    document.getElementById('send-sms').addEventListener('click', notifySMS)

    client.data.get('contact').then(function(data) {
        if (data.contact.mobile)
            document.getElementById('to').value = data.contact.mobile
    }),
        function(error) {
            console.error('Error fetching contact data:', error)
        }
}
