import { MessageEmbed } from "discord.js";
import { google } from "googleapis";
import { API_KEY } from "@config";
import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

export const youtube = google.youtube("v3");

export async function queryVideo(query: string): Promise<Video> {
    const list = await youtube.search.list({
        auth: API_KEY,
        part: ["id", "snippet"],
        maxResults: 1,
        q: query,
    });
    if (!list.data.items || list.data.items.length === 0) {
        throw new Error("No results found.");
    }

    const { id, snippet } = list.data.items[0];
    if (!id || !snippet) {
        throw new Error("No results found.");
    }

    const { channelTitle, title, description, thumbnails } = snippet;
    if (
        !id?.videoId ||
        !channelTitle ||
        !title ||
        !description ||
        !thumbnails?.default?.url
    ) {
        throw new Error("No results found.");
    }

    return {
        id: id.videoId,
        title,
        description,
        channel: channelTitle,
        thumbnail: thumbnails.default.url,
    };
}

export interface Video {
    id: string;
    title: string;
    description: string;
    channel: string;
    thumbnail: string;
}

export function videoToEmbed(video: Video, opt?: Partial<Video>): MessageEmbed {
    opt = opt || {};
    let { title, description, channel, thumbnail } = { ...video, ...opt };
    return new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .addField("Channel", channel)
        .setImage(thumbnail);
}

export function videoUrl({ id }: Video): string {
    return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Convert YouTube video to `AudioResource<Video>` that is playable in Discord with
 * YouTube video's metadata.
 * @param video YouTube video
 * @param optimize optimize the audio by disabling variable volume
 * @returns AudioResource
 */
export function videoToAudioResource(
    video: Video,
    optimize?: boolean
): AudioResource<Video> {
    const url = videoUrl(video);
    const stream = ytdl(url, {
        filter: "audioonly",
    });
    let inlineVolume = !optimize;
    return createAudioResource(stream, {
        inlineVolume,
        metadata: video,
    });
}
