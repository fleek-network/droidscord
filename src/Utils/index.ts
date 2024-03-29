import {
  Message,
  User,
  GuildTextBasedChannel,
  TextChannel,
  ThreadAutoArchiveDuration,
} from "discord.js";

export enum Docs {
  Site = "https://docs.fleek.network",
}

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
export const sendMsgCommonHandler = async ({
  msg,
  message,
}: {
  msg: Message;
  user: User;
  message: string;
}) => {
  // TODO: use text templt instead
  // const message = `👋 Hey ${user.toString()} ${response}\n\n${warningAssistedAI}`;
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

export const sendCreateThreadMsg = async ({
  msg,
  name,
  message,
  duration = ThreadAutoArchiveDuration.OneWeek,
}: {
  msg: Message;
  name: string;
  message: string;
  duration?: ThreadAutoArchiveDuration;
}) => {
  try {
    const thread = await msg.startThread({
      name,
      autoArchiveDuration: duration,
    });

    await thread.send(message);

    return thread;
  } catch (err) {
    console.log("Oops! Failed to create thread");
    console.error(err);
  }
};
