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

## Indexer

Change directory

```
cd llm_indexer
```

Install dependencies

```
pip install -r requirements.txt
```

Run the service API

```
OPENAI_API_KEY="xxx" uvicorn main:app --reload
```

Swagger API

http://127.0.0.1:8000