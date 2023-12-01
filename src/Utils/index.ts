import {
  Client,
  IntentsBitField,
  Message,
  User,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js";
import { warningAssistedAI } from '../Messages/index.js';

export const deleteMsg = async ({ msg }: { msg: Message }) => {
  try {
    await msg?.delete();
  } catch (err) {
    console.error(`Oops! Failed to delete ${msg?.id}`);
  }
};

export const sendMsgToUser = async ({
  user,
  message,
  channel,
}: {
  user: User;
  message: string;
  channel: GuildTextBasedChannel;
}) => {
  try {
    if (user.id) {
      const res = await user.send(message);

      if (!res) return false;
    }
  } catch (err) {
    console.error("Oops! Failed to send a DM to user");

    return false;
  }

  await sendMsgToChannel({
    channel,
    // TODO: use text templt instead
    message: `👀 Hey ${user.toString()}, sent you a direct message, check it out!`,
  });

  return true;
};

export const sendMsgToChannel = async ({
  channel,
  message,
}: {
  channel: GuildTextBasedChannel;
  message: string;
}) => {
  try {
    await channel.send(message);
  } catch (err) {
    console.error("Oops! Failed to send message to channel");
  }
};

// TODO: Refactor seems to be a known pattern as used elsewhere
export const sendMsgFoundLLMAnswer = async ({
  msg,
  user,
  response,
}: {
  msg: Message;
  user: User;
  response: string;
}) => {
  // TODO: use text templt instead
  const message = `👋 Hey ${user.toString()} ${response}\n\n${warningAssistedAI}`;
  const hasSentMsg = await sendMsgToUser({
    user: msg.author,
    message,
    channel: msg.channel as TextChannel,
  });

  if (!hasSentMsg) {
    await sendMsgToChannel({
      channel: msg.channel as TextChannel,
      // TODO: use text templt instead
      message: `👀 Hey ${msg.author.toString()}, failed to DM you. Activate your DM and try again, please!`,
    });
  }
};
