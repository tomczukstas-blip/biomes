
const { Client, GatewayIntentBits, Events } = require("discord.js");
const http = require("node:http");

// Render keep-alive HTTP server
const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Discord bot is running!");
}).listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP server running on port ${PORT}`);
});

// Discord bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

client.once(Events.ClientReady, (bot) => {
    console.log(`Bot zalogowany jako ${bot.user.tag}`);
});

client.login(process.env.DISCORD_KEY).catch((error) => {
    console.error("Nie udało się zalogować:", error);
});
