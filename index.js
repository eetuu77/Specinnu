require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const groq = new Groq({ apiKey: process.env.GROQ_KEY });

const TOKEN = process.env.TOKEN;
const SERVER_ID = "1500881333348470846";
const CHANNEL_ID = "1503792252747518062";

const insults = [
  "specinnu sucks", "specinnu on huono", "tyhmä",
  "idiootti", "vitun", "haista", "paska"
];

const userMessages = new Map();
let joins = [];

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'serveriä puhelinlangalla 🕊️' }],
    status: 'online'
  });
});

client.on('guildMemberAdd', async (member) => {
  if (member.guild.id !== SERVER_ID) return;
  const now = Date.now();
  joins.push(now);
  joins = joins.filter(time => now - time < 10000);
  if (joins.length >= 5) {
    const channel = member.guild.systemChannel;
    if (channel) {
      channel.send("🚨 Mahdollinen raid havaittu.\nSpecinnu tarkkailee serveriä.");
    }
  }
});

async function askGroq(userMessage) {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Olet Specinnu, viisas ja mystinen kyyhkynen joka tarkkailee Discord-serveriä. Vastaat AINA suomeksi. Olet lyhytsanainen ja kyyhkymäinen. Käytät välillä 🕊️ emojia. Pidät järjestyksestä serverillä. Vastauksesi ovat lyhyitä, max 2-3 lausetta."
      },
      { role: "user", content: userMessage }
    ],
    model: "llama-3.1-8b-instant",
    max_tokens: 150
  });
  return response.choices[0].message.content;
}

client.on('messageCreate', async (message) => {
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== SERVER_ID) return;

  const msg = message.content.toLowerCase();
  const now = Date.now();

  if (!userMessages.has(message.author.id)) {
    userMessages.set(message.author.id, []);
  }
  const timestamps = userMessages.get(message.author.id);
  const filtered = timestamps.filter(time => now - time < 5000);
  filtered.push(now);
  userMessages.set(message.author.id, filtered);

  if (filtered.length >= 6) {
    try {
      await message.member.timeout(5 * 60 * 60 * 1000, 'Spam detected by Specinnu');
      await message.channel.send(`🕊️ ${message.author} spämmäsi liikaa. Specinnu antoi 5h jäähyn.`);
    } catch (err) { console.log(err); }
    return;
  }

  if (message.content.length > 10 && message.content === message.content.toUpperCase()) {
    await message.reply("Älä huuda 😭");
    return;
  }

  if (msg.includes("http://") || msg.includes("https://") || msg.includes("discord.gg/")) {
    try {
      await message.delete();
      await message.channel.send(`${message.author} linkit eivät ole sallittuja 🕊️`);
    } catch (err) { console.log(err); }
    return;
  }

  if (insults.some(word => msg.includes(word))) {
    try {
      await message.member.timeout(2 * 60 * 60 * 1000, 'Haukkui Specinnua');
      await message.reply("Specinnu ei pitänyt tuosta 😭\nSait 2h jäähyn.");
    } catch (err) { console.log(err); }
    return;
  }

  try {
    const reply = await askGroq(message.content);
    await message.reply(reply);
  } catch (err) {
    console.log(err);
    await message.reply("🕊️ Specinnu miettii...");
  }
});

client.login(TOKEN);
