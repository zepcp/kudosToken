var SlackBot = require('slackbots');
 
// create a bot
var bot = new SlackBot({
    token: 'xoxb-431745450177-432323670498-STzBZV0X7zv4j926RuNVAH3d', // Add a bot https://my.slack.com/services/new/bot and put the token 
    name: 'mybot'
});
 
bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        icon_emoji: ':cat:'
    };
    // define channel, where bot exist. You can adjust it there https://my.slack.com/services 
    test = bot.postMessageToChannel('kudos_channel', 'kudos_test!', params);

    console.log(test)
});



// curl -X POST --data-urlencode "payload={\"app\": \"@kudos\", \"username\": \"kudos\", \"text\": \"Test\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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

// curl -X POST --data-urlencode "payload={\"channel\": \"kudos_channel\", \"username\": \"kudos\", \"text\": \"Test\", \"icon_emoji\": \":ghost:\"}" https://hooks.slack.com/services/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