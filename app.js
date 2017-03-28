var express = require('express');
var fs = require('fs');

var app = express();

app.get('/', function(req, res) {
	res.send('Welcome to roastbot!');
});

app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === "<VERIFY_TOKEN>") {
		
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);          
	}  
});

var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log('started server on port ' + port);
});