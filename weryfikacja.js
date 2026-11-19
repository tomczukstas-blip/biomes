
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField
} = require('discord.js');

module.exports = (client) => {
    const rolaNiezweryfikowanyID = '1573009504809783386';
    const rolaUzytkownikID = '1570469549789286518';

    const kolorBiomes = '#C77DFF';

    // Pamięć kodów CAPTCHA
    const captchaKody = new Map();

    // Generator kodu CAPTCHA
    function wygenerujKod(dlugosc = 5) {
        const znaki = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let kod = '';

        for (let i = 0; i < dlugosc; i++) {
            kod += znaki.charAt(
                Math.floor(Math.random() * znaki.length)
            );
        }

        return kod;
    }

    // PANEL WERYFIKACJI
    client.on('messageCreate', async (message) => {
        if (
            message.author.bot ||
            message.content !== '!setup-weryfikacja' ||
            !message.member?.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        ) return;

        const kanal = message.channel;

        const ikonaSerwera = message.guild.iconURL({
            extension: 'png',
            size: 256
        });

        const embed = new EmbedBuilder()
            .setColor(kolorBiomes)
            .setTitle('BIOMESBLOCKMC')
            .setDescription(
                '## Weryfikacja użytkownika\n' +
                'Witaj na **BIOMESBLOCKMC**!\n' +
                'Przed rozpoczęciem przygody na naszym serwerze ' +
                'musisz przejść krótką weryfikację.\n\n' +
                '### Jak się zweryfikować?\n' +
                '> **01**  Kliknij przycisk poniżej.\n' +
                '> **02**  Przepisz kod CAPTCHA z okna.\n' +
                '> **03**  Otrzymaj dostęp do serwera.\n\n' +
                'Jeśli wystąpi problem, skontaktuj się z administracją.'
            )
            .setFooter({
                text: 'BIOMESBLOCKMC • SYSTEM WERYFIKACJI',
                ...(ikonaSerwera ? { iconURL: ikonaSerwera } : {})
            })
            .setTimestamp();

        if (ikonaSerwera) {
            embed.setThumbnail(ikonaSerwera);
        }

        const przycisk = new ButtonBuilder()
            .setCustomId('weryfikacja_btn')
            .setLabel('Zweryfikuj się')
            .setEmoji('✨')
            .setStyle(ButtonStyle.Primary);

        const komponenty = new ActionRowBuilder()
            .addComponents(przycisk);

        await kanal.send({
            embeds: [embed],
            components: [komponenty]
        });

        await message.reply({
            content: '✅ Panel weryfikacji BIOMESBLOCKMC został wysłany!',
            allowedMentions: { repliedUser: false }
        });
    });

    // OBSŁUGA INTERAKCJI
    client.on('interactionCreate', async (interaction) => {

        // Kliknięcie przycisku weryfikacji
        if (
            interaction.isButton() &&
            interaction.customId === 'weryfikacja_btn'
        ) {
            const member = await interaction.guild.members.fetch(
                interaction.user.id
            );

            if (member.roles.cache.has(rolaUzytkownikID)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(kolorBiomes)
                            .setTitle('✓ Jesteś już zweryfikowany')
                            .setDescription(
                                'Twoje konto ma już dostęp do **BIOMESBLOCKMC**.\n' +
                                'Możesz korzystać z dostępnych kanałów!'
                            )
                    ],
                    ephemeral: true
                });
            }

            const kodCaptcha = wygenerujKod(5);
            captchaKody.set(interaction.user.id, kodCaptcha);

            const modal = new ModalBuilder()
                .setCustomId('captcha_modal')
                .setTitle('BIOMESBLOCKMC • Weryfikacja');

            const input = new TextInputBuilder()
                .setCustomId('captcha_input')
                .setLabel(`Twój kod CAPTCHA: ${kodCaptcha}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Wpisz 5 znaków kodu...')
                .setMinLength(5)
                .setMaxLength(5)
                .setRequired(true);

            const row = new ActionRowBuilder()
                .addComponents(input);

            modal.addComponents(row);

            await interaction.showModal(modal);
        }

        // Sprawdzenie kodu CAPTCHA
        if (
            interaction.isModalSubmit() &&
            interaction.customId === 'captcha_modal'
        ) {
            const wpisanyKod = interaction.fields
                .getTextInputValue('captcha_input')
                .trim()
                .toUpperCase();

            const poprawnyKod = captchaKody.get(interaction.user.id);

            if (!poprawnyKod || wpisanyKod !== poprawnyKod) {
                captchaKody.delete(interaction.user.id);

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('✕ Nieprawidłowy kod')
                            .setDescription(
                                'Wpisany kod CAPTCHA jest niepoprawny lub wygasł.\n\n' +
                                'Kliknij przycisk weryfikacji i spróbuj ponownie.'
                            )
                            .setFooter({
                                text: 'BIOMESBLOCKMC • WERYFIKACJA'
                            })
                    ],
                    ephemeral: true
                });
            }

            captchaKody.delete(interaction.user.id);

            try {
                const member = await interaction.guild.members.fetch(
                    interaction.user.id
                );

                await member.roles.add(rolaUzytkownikID);
                await member.roles.remove(rolaNiezweryfikowanyID);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(kolorBiomes)
                            .setTitle('✓ Weryfikacja zakończona')
                            .setDescription(
                                'Kod CAPTCHA został poprawnie zweryfikowany!\n\n' +
                                'Witaj na **BIOMESBLOCKMC**.\n' +
                                'Możesz już korzystać z serwera.'
                            )
                            .setFooter({
                                text: 'BIOMESBLOCKMC • MIŁEJ GRY!'
                            })
                            .setTimestamp()
                    ],
                    ephemeral: true
                });

            } catch (error) {
                console.error('Błąd nadawania ról:', error);

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle('✕ Wystąpił błąd')
                            .setDescription(
                                'Nie udało się zakończyć weryfikacji.\n' +
                                'Skontaktuj się z administracją BIOMESBLOCKMC.'
                            )
                            .setFooter({
                                text: 'BIOMESBLOCKMC • POMOC TECHNICZNA'
                            })
                    ],
                    ephemeral: true
                });
            }
        }
    });
};
