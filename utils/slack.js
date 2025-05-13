const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_TOKEN);

const sendSlackMessage = async ({ channel, environment, status, fileName }) => {
    const message = `
        ${status ? ':white_check_mark: *DB Backup Completed!*' : ':x: *DB Backup Failed!*'}
        *Environment:* ${environment}
        *Status:* ${status}
        *File:* \`${fileName}\`
    `;

    try {
        await slackClient.chat.postMessage({
            channel,
            text: message,
        });
        console.log('✅ Slack message sent!');
    } catch (error) {
        console.error('❌ Error sending Slack message:', error);
    }
};

module.exports = { sendSlackMessage };
