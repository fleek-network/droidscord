# 🤖 Droidscord

"Droidscord" is a Discord bot that listens to the users and provides answers to common questions, or commands. Arguably the best buddy droid in Fleek Network's discord, Droidscord is a helpful companion in the community channels. No matter how dire the situation, this droid is always ready to scan messages, open discussions, and offer up a healing direction to help members continue their journey.

## ✨ Motivation

Help us reach the members of our communities quicker and to reduce the amount of time we spend on some interactions that can be easily mitigated by checking the documentation site and search functionalities.

## 🛹 Requirements

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
DISCORD_APP_ID=""
DISCORD_PUBLIC_KEY=""
DISCORD_BOT_TOKEN=""
WHITELIST_MSG_TIMEOUT_MINUTES="5"
DISCORD_CHANNEL_ID_GM_GN=""
ALGOLIA_APP_ID=""
ALGOLIA_SEARCH_API=""
ALGOLIA_INDEX=""
OPENAI_API_KEY=""
REPLICATE_API_TOKEN=""
LLM_MODEL="gpt-3.5-turbo"
REDIS_PASSWORD=""
REDIS_PORT=6379
REDIS_HOSTNAME="redis"
LLM_INDEXER_HOSTNAME="llm_indexer"
LLM_INDEXER_PORT="8000"
MONGO_DB_NAME=""
MONGO_INITDB_ROOT_USERNAME=""
MONGO_INITDB_ROOT_PASSWORD=""
ME_CONFIG_MONGODB_ADMINUSERNAME=""
ME_CONFIG_MONGODB_ADMINPASSWORD=""
ME_CONFIG_BASICAUTH_USERNAME=""
ME_CONFIG_BASICAUTH_PASSWORD=""
ME_CONFIG_MONGODB_URL=""
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

### Restrict to channels

Go to **Server settings** -> **Integrations** -> **Bots and Apps** -> **Manage** -> **Add and remove channels**

## Python Web Server

```
uvicorn main:app --reload --env-file ../.env
```

# Docker

## LLM Indexer

```
cd llm_indexer
```

### Build

```
docker build -t llm_indexer .  
```

### Run

```
docker run \
  --name llm_indexer \
  -p 80:80 \
  --env-file ../.env
  llm_indexer
```

> Depending on the Docker version you're running, the `docker run --env-file` has a bug, not parsing the environment variable. Unfortunately, this means that it'll not unquote the value, causing issues. Reported in https://github.com/docker/cli/issues/4665

## Discord nodejs bot

### Build

```
npm run build
```

The output/distribution directory is `dist`:

```
dist
├── index.js
└── tsconfig.tsbuildinfo
```

## Compose stack

### Env vars

Create a .env.prod

```
touch .env.prod
```

Add all required environment variables.

> The convention is to use the in-memory enviroment variables, but since the bot is to run under a private network not accessible externally, it was opted for developer experience convinience to use a .env.prod in the local file system. If there are issues with that, then the environment variables should be prepared/declared up-front in the compose.yaml file instead.

Run the stack:

```sh
docker compose up
```

Run a single container via compose:

```sh
docker compose run --rm <SERVICE_NAME>
```

### Create mongo express tunnel

Create a tunnel via ssh to open mongo express locally

```sh
ssh -i <PUBKEY> -N -L 8081:127.0.0.1:8081 <USER@SERVER-IP>
```

Open the address in the browser and use the specified user/pw (ME_CONFIG_BASICAUTH_USERNAME/ME_CONFIG_BASICAUTH_PASSWORD):

```
localhost:8081
```

Kill tunnel

```
kill $(lsof -t -i:8081)
```

## References

### Discord.js

[Introduction](https://discord.js.org/#/docs/discord.js/main/general/welcome)
