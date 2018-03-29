var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var isEmail = require('isemail');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hi My Name is Pwned, I basically tell whether your email id has been breached/hacked due to data breaches happening all over the world!");
        builder.Prompts.text(session, "Please provide your email id ");
    },
    function (session, results) {
        var emailId = results.response;
		session.sendTyping();
		setTimeout(function () {
		var options = {
		url: 'https://haveibeenpwned.com/api/v2/breachedaccount/'+emailId,
		headers: {
		'User-Agent': 'Pwnage-Checker-Chatbot'
			}
		};		
		request(options, function(error,response,body){
		if (!error && response.statusCode == 200) {
		var breachInfo = JSON.parse(body);
		session.send("**You have been Pwned, If you still use the Breached Sites below, change your password immediately, and if any of your current passwords match with any passwords from the breached sites, CHANGE THEM IMMEDIATELY **");
		breachInfo.forEach(function(info) {
			session.send("Where:"+ info.Title+"<br/>"
						 +"<br/>When:"+info.BreachDate+"<br/>"
						 +"<br/>Domain:"+info.Domain+"<br/>"
						 +"<br/>Description:"+info.Description);
		});
		}
		else{session.send("** No Breaches Found for "+emailId+" ** ");}
		});
		session.endDialog();
		}, 3000);
    }
]).set('storage', inMemoryStorage); // Register in-memory storage 



