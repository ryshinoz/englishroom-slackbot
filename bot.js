/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

process.env.PWD = process.cwd()

if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

var Botkit = require('botkit');

controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM();


var Fs = require('fs');
var Path = require('path');

var load = function(path, file) {
  var ext = Path.extname(file);
  var full = Path.join(path, Path.basename(file, ext));

  try {
    var script = require(full);
    if (typeof script === 'function') {
      script(this);
    }
  } catch(error) {
    process.exit(1);
  }
};

var path = Path.resolve('.', 'scripts')

Fs.readdirSync(path).sort().forEach(function(file) {
  load(path, file);
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});

// To keep Heroku's free dyno awake
var http = require('http');
var path=require('path');
var querystring = require('querystring');
var url = require('url')
http.createServer(function(req, res) {
    var lookup=path.basename(decodeURI(req.url));
    var query = querystring.parse(url.parse(lookup).query);
    if (typeof query.id === "undefined") {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Ok, dyno is awake.');
    } else {
        try {
            var tmp = path.join(process.env.PWD, '../tmp', query.id);
            console.log(tmp);
            var buf = Fs.readFileSync(tmp);
            res.writeHead(200, { 'Content-Type': 'image/gif' });
            res.end(buf);
        } catch (_error) {
            error = _error;
            console.log(error);
        }
    }
}).listen(process.env.PORT || 5000);

