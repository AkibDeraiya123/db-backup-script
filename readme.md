## 📣 Slack Notification After DB Backup

This project sends a Slack message to notify when a database backup is successfully taken and uploaded to S3.

### ✅ Prerequisites

1. **Create a Slack App**
   Go to [Slack API: Create App](https://api.slack.com/apps) and create a new app from scratch.

2. **Add a Bot User to the App**

   * Navigate to `OAuth & Permissions`
   * Scroll down to **Scopes**
   * Add the following **Bot Token Scopes**:

     * `chat:write`
     * `channels:read` (for public channels)
     * `groups:read` (for private channels)
     * `channels:join` *(optional — for auto-join)*
   * Click **Install App to Workspace** and authorize it.

3. **Invite the Bot to Your Slack Channel**

   * In Slack, go to the channel you want to receive notifications in
   * Type: `/invite @your-bot-name`
     (Replace `your-bot-name` with your bot’s actual display name)

4. **Get the Channel ID**

   * Open the channel in Slack (in browser)
   * Find the URL:

     ```
     https://app.slack.com/client/TXXXXXXX/CYYYYYYY
     ```
   * Copy the `CYYYYYYY` — that's your **channel ID**

---

### ⚙️ Setup

1. **Install dependencies**

   ```bash
   npm install @slack/web-api dotenv
   ```

2. **Add environment variables to `.env`**

   ```env
   SLACK_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxx
   SLACK_CHANNEL_ID=CYYYYYYY
   ```

---
