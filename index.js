const CHANNEL_ID = "1503792252747518062";
if (message.channel.id !== CHANNEL_ID) return;
client.on('messageCreate', async (message) => {

  if (message.channel.id !== CHANNEL_ID) return;

  if (message.author.bot) return;

  if (!message.guild) return;

  const msg = message.content.toLowerCase();

});
