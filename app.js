PAGE_ACCESS_TOKEN = "EAAK2N1K1VwgBACWLBuzqhcZAVcsIMq5RGFKm4evw0WqN6gWM2kIOlIvAfPpeDqJaT3oD07HajsRNnHV5bLZAOiZBrnzK3ou3VMEbZAY38yP7awCzyAZCbcKy2b0N75Kjs15uIi1fJ1YrZAU4thZBDyZARjb1dS70wZB3JMpzquTX6oQZDZD";

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Welcome to roastbot!');
});

app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === "verify_me_roast_me") {
		
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);          
	}  
});

app.post('/webhook', function(req, res) {
	console.log(JSON.stringify(req));
	var data = req.body;

	// ensure page subscription
	if (data.object === 'page') {

		// iterate over entries - could be multiples
		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// over each messaging event 
			entry.messaging.forEach(function(event) {
				if (event.message) {
					receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});

		// assume went well and send response
		res.sendStatus(200);

	}

	// TODO: build else case

});

function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:", 
		senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {

		// If we receive a text message, check to see if it matches a keyword
		// and send back the example. Otherwise, just echo the text we received.
		switch (messageText) {
			case 'generic':
				sendGenericMessage(senderID);
				break;

			default:
				sendTextMessage(senderID, messageText);
		}

	} else if (messageAttachments) {

		sendTextMessage(senderID, "Message with attachment received");

	}
}

function sendGenericMessage(recipientId, messageText) {
	// TODO
}

function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};

	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			console.log("Successfully sent generic message with id %s to recipient %s", 
				messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}
	});  
}

var server = app.listen(process.env.PORT || 3000, function() {
	var port = server.address().port;
	console.log('started server on port ' + port);
});