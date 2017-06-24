/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
'use strict';

const Alexa = require('alexa-sdk');
const Twitter = require("twitter");
var APP_ID = undefined;

function getLastTweet(callback) {
    var client = new Twitter(require("./secret.js"));

    var params = {
        screen_name: 'realDonaldTrump',
        count: 1,
        trim_user: true,
        exclude_replies: true,
    };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) return callback(error); 
        var tweet = tweets[0];
        var prefix = ""; 
        var hasMedia = tweet.entities.media && tweet.entities.media.length > 0; 
        var hasUrl = tweet.entities.urls && tweet.entities.urls.length > 0; 

        if(hasUrl) {
            prefix = "There is a link in this tweet. ";
        }

        var finalResponse = ""; 
        if(hasMedia || hasUrl) {
            finalResponse = prefix; 
        }

        //Process the tweet so that things like links arent read aloud unnecessarily. 
        var rawTweet = tweet.text; 
        var processedTweet = rawTweet; 

        //Replace the videos with a verbal comment and title. 
        if(hasMedia) {
            for(var i = 0; i < tweet.entities.media.length; i++) {
                processedTweet = processedTweet.replace(tweet.entities.media[i].url, '<emphasis level="reduced"> There is a video here titled ' + tweet.extended_entities.media[i].additional_media_info.title + '</emphasis>');
            }
        }

        finalResponse = finalResponse + processedTweet; 
        
        callback(false, finalResponse);
    });
}

// Some debug statements for running it locally to test things. 
getLastTweet(function(err, tweet) {
    if(err) throw err;
    console.log(tweet);
});

const handlers = {
    'GetLastTweetIntent': function () {
        var handler = this;
        getLastTweet(function (err, readableTweet) {
            if(err) return handler.emit(':tell', "Sorry, ask me again in a bit.");
            handler.emit(':tell', readableTweet);
        });
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':tell', "Ask me to read Trump's last tweet, and I will.");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('Thank you.'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('Bye.'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
