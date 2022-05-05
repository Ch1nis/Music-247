import { Command, CommandContext } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";
import { PlayerState } from "@music/player";
import { videoToEmbed } from "@music";
import { unreachable } from "@util";

export class SkipCommand extends Command {
    constructor() {
        super({
            name: "skip",
            description: "Skips current song.",
        });
    }

    async run(
        { message, guild, member }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Skip command doesn't require arguments!"
            );
        }

        const player = JukeBox.the().getPlayer(guild.id);
        if (!player || !player.isPlaying) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        // User should be in the same channel with the bot
        const channelId = member.voice.channel?.id;
        if (player.channelId !== channelId) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to skip tracks!"
            );
            return;
        }

        try {
            const skipped = player.skip();
            if (player.state === PlayerState.Stopped) {
                await message.channel.send("No more songs in queue.");
                return;
            }
            const current = player.nowPlaying();
            if (!current) {
                unreachable(
                    "`queue.current` should not be `null` if `queue.state` is not `Stopped`."
                );
            }
            const embed = videoToEmbed(current, {
                title: `Skipped ${skipped.title} and currently playing ${current.title}`,
            });
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            logger.error(`${error} occurred while handling skip command`);
        }
    }
}
