import { MessageEmbed } from "discord.js";
import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";
import { bold, italic } from "@discordjs/builders";

export class QueueCommand extends Command {
    constructor() {
        super({
            name: "queue",
            description: "Displays song queue.",
        });
    }

    async run(
        { message, guild }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Now playing command doesn't require arguments!"
            );
        }
        const player = JukeBox.the().getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const queue = player.queue.map(({ title }, index) => {
            const number = bold(`${index + 1}.`);
            return `${number} ${italic(title)}`;
        });
        const description = queue.join("\n");

        const embed = new MessageEmbed({
            title: `Currently playing ${italic(player.nowPlaying.title)}`,
            description,
            color: "#123123",
        });

        await message.channel.send({ embeds: [embed] });
    }
}
