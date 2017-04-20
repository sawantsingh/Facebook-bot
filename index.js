'use strict';

// Messenger API integration example
// We assume you have:
// * a Wit.ai bot setup (https://wit.ai/docs/quickstart)
// * a Messenger Platform setup (https://developers.facebook.com/docs/messenger-platform/quickstart)
// You need to `npm install` the following dependencies: body-parser, express, request.
//
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request')


// get Bot, const, and Facebook API
const bot = require('./bot.js');
const Config = require('./const.js');
const FB = require('./facebook.js');

// Setting up our bot
const wit = bot.getWit();

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {
      fbid: fbid,
      context: {
        _fbid_: fbid
      }
    }; // set context, _fid_
  }
  return sessionId;
};

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());
console.log("I'm wating for you @" + PORT);

// index. Let's say something fun
app.get('/', function(req, res) {
  res.send('"Only those who will risk going too far can possibly find out how far one can go." - T.S. Eliot');
});

// Webhook verify setup using FB_VERIFY_TOKEN
app.get('/webhook', (req, res) => {
  if (!Config.FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});


/*
app.get('/setup',function(req,res){

    //setupGetStartedButton(res);
    var messageData = {
                "get_started":[
                {
                    "payload":"Welcome to My Car Insurance"
                    }
                ]
        };

        // Start the request
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ Config.FB_PAGE_TOKEN,
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            form: messageData
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(body);

            } else { 
                // TODO: Handle errors
                res.send(body);
            }
        });
});
*/


app.post('/webhook/', function (req, res) {
	
	console.log("Main console" + req);

	// let messaging_events = req.body.entry[0].messaging

	// for (let i = 0; i < messaging_events.length; i++) {
	// 	let event = req.body.entry[0].messaging[i]
	// 	let sender = event.sender.id
  //   const sessionId = findOrCreateSession(sender);

  // 	if (event.message && event.message.text && !event.message.is_echo) {
	// 		let text = event.message.text
  //      console.log( "Main text" + text)

  //      sendTextMessage(sender, text);

  //       wit.runActions(
  //             sessionId, // the user's current session
  //             text, // the user's message
  //             sessions[sessionId].context // the user's current session state
  //           ).then((context) => {
            
  //             console.log('Waiting for next user messages');

  //             // if (context['done']) {
  //             //   delete sessions[sessionId];
  //             // }

  //             sessions[sessionId].context = context;
  //           })
  //           .catch((err) => {
  //             console.error('Oops! Got an error from Wit: ', err.stack || err);
  //           })	
	// 	}   
  // else if (event.postback) {
	// 		let text1 = JSON.stringify(event.postback.payload)
  //     console.log( "message text 1" + text1)

	// 		//sendTextMessage(sender, "Postback received: "+text.substring(0, 200))
  //     if (text1 === '"Start Chatting"') {
  //        {
  //           //const {text, attachments} = event.message;
          
  //          sendTextMessage(sender, 'Hello there!')  

  //         }
  //       }
  //     else {
  //           sendWelcomeMessage(sender)
  //     }
	// 	}
	// }
	// res.sendStatus(200)
})


/*
// The main message handler
app.post('/webhook', (req, res) => {
   // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {

        if(event.postback) {
            res.send("Get Started called");
        }


        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          const sender = event.sender.id;

          // We retrieve the user's current session, or create one if it doesn't exist
          // This is needed for our bot to figure out the conversation history
          const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            wit.runActions(
              sessionId, // the user's current session
              text, // the user's message
              sessions[sessionId].context // the user's current session state
            ).then((context) => {
              // Our bot did everything it has to do.
              // Now it's waiting for further messages to proceed.
              console.log('Waiting for next user messages');

              // Based on the session state, you might want to reset the session.
              // This depends heavily on the business logic of your bot.
              // Example:
              // if (context['done']) {
              //   delete sessions[sessionId];
              // }

              // Updating the user's current session state
              sessions[sessionId].context = context;
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});

*/


function sendResponseData(sender,response) {

	 var json = JSON.parse(response.body);
		console.log('Printing json:',json)

		let hourly = json["hourly"]
		let summary = hourly["summary"]
		console.log('Printing json:',summary)


	let messageData = { text:summary }


	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:Config.FB_PAGE_TOKEN},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:Config.FB_PAGE_TOKEN},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "https://scontent-sin6-1.xx.fbcdn.net/v/t31.0-8/17218524_10211278521054605_3920462141316408947_o.jpg?oh=8307dfaf91be1b3608dc99327f12fecb&oe=59971EED",
					"buttons": [{
						"type": "web_url",
						"url": "https://en.wikipedia.org/wiki/Deloitte",
						"title": "Deloitte"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://www.qspiders.com/sites/default/files/sunny%20amar%20nath.jpg",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.allianz.com/en/",
						"title": "Allianz"
					},{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:Config.FB_PAGE_TOKEN},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


function sendWelcomeMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "Welcome to My Car Insurance",
					"subtitle": "You’re In Good Hands",
					"image_url": "https://www.aautoandhomeinsurance.com/img/~www.aautoandhomeinsurance.com/cheapest%20auto%20pics/17102035437_f005f23cb7_b.jpg",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.allianz.com/en/",
						"title": "Visit our website"
					},{
						"type": "postback",
						"title": "Start Chatting",
						"payload": "Start Chatting",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:Config.FB_PAGE_TOKEN},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}