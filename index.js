
const { Client, GatewayIntentBits, Events } = require('discord.js');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// HTTP SERVER - RENDER
app.get('/', (req, res) => {
    res.send('Status: 200 OK. BIOMESBLOCKMC działa i nasłuchuje!');
});

app.listen(port, () => {
    console.log(`[System] Serwer HTTP uruchomiony na porcie ${port}`);
});

// DISCORD CLIENT
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// MODUŁY BOTA
const moduly = [
    'weryfikacja.js',
];

console.log('--- Ładowanie modułów BIOMESBLOCKMC ---');

moduly.forEach(plik => {
    try {
        require(`./${plik}`)(client);
        console.log(`Załadowano moduł: ${plik}`);
    } catch (error) {
        console.error(`Błąd podczas ładowania modułu ${plik}:`, error);
    }
});

console.log('----------------------------------------');

// BOT READY
client.once(Events.ClientReady, (bot) => {
    console.log(`Połączono z Discordem! Zalogowano jako: ${bot.user.tag}`);
    console.log('BIOMESBLOCKMC BOT ONLINE');
});

// ANTI-SLEEP
const SERVER_URL = 'https://biomes.onrender.com';

setInterval(() => {
    fetch(SERVER_URL)
        .then(res => console.log(`[Anti-Sleep] Ping wysłany. Status: ${res.status}`))
        .catch(err => console.error('[Anti-Sleep] Błąd pingu:', err.message));
}, 8 * 60 * 1000);

// LOGOWANIE BOTA
client.login(process.env.DISCORD_KEY).catch(err => {
    console.error('Błąd logowania do Discorda. Sprawdź DISCORD_KEY w Render.', err);
});
