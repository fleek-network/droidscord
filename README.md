# 🤖 Droidscord

"Droidscord" is a Discord bot that listens to the users and provides answers to common questions, or commands. Arguably the best buddy droid in Fleek Network's discord, Droidscord is a helpful companion in the community channels. No matter how dire the situation, this droid is always ready to scan messages, open discussions, and offer up a healing direction to help members continue their journey.

## ✨ Motivation

Help us reach the members of our communities quicker and to reduce the amount of time we spend on some interactions that can be easily mitigated by checking the documentation site and search functionalities.

## 🧑🏾‍💻 Requirements

- Nodejs
- Typescript
- Discord API [Application ID and Key](https://discord.com/developers/applications/)

## Run dev server?

Start the development server by running the bun script "start":

```sh
npm run dev
```

## Production

Use systemd service, or [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

## Bot

### Discord App Dashboard

To configure a bot use the [dashboard](https://discord.com/developers/applications).

### General information

In **General information** name the application. Copy the **application id** and **public key** which's required to place under the environment variables. If working locally, create a local **.env** file as follows:

```
touch .env
```

Put the content by declaring the required environment variables and values, accordingly to the dashboard provided settings.

```
DISCORD_APP_ID="xxxx"
DISCORD_PUBLIC_KEY="yyyy"
WHITELIST_MSG_TIMEOUT_MINUTES="5"
```

### Bot

Use the **Reset token** to get the environment variable value for `DISCORD_BOT_TOKEN`.

### OAuth2

Use the **URL Generator**


Select the bot **scope** and toggle the following:

The required bot permissions:

- Manage roles
- Kick Members
- Ban Members
- Read Messsages/View Channels
- Moderate Members
- Send Messages
- Create Public Threads
- Create Private Threads
- Send Messages in Threads
- Attach Files
- Manage Messages
- Read Message History
- Mention Everyone
- Use Slash Commands

The URL will look like:

```
https://discord.com/api/oauth2/authorize?client_id=<APP_ID>&permissions=<LONG_NUMBER>&scope=bot
```

### Add Bot to Server

Copy the generated URL from [OAuth2](#oauth2) and accept all suggested permissions.

## References

### Discord.js

[Introduction](https://discord.js.org/#/docs/discord.js/main/general/welcome)