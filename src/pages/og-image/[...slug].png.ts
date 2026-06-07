import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import { getAllPosts } from "@/data/post";
import { getFormattedDate } from "@/utils/date";
import { readCache, writeToCache } from "./_cacheUtil";
import { ogMarkup } from "./_ogMarkup";
import { getFont400, getFont700 } from "./_fetchFont";

const ogOptions: SatoriOptions = {
	fonts: [
		{
			data: Buffer.alloc(0), // placeholder, replaced in GET
			name: "Noto Sans SC",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.alloc(0),
			name: "Noto Sans SC",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	// Fetch fonts from Google CDN (cached in memory for the build duration)
	const [font400, font700] = await Promise.all([getFont400(), getFont700()]);
	ogOptions.fonts[0].data = font400;
	ogOptions.fonts[1].data = font700;

	// check the og-image cache
	let pngBuffer = readCache(title, pubDate);
	if (!pngBuffer) {
		console.info(`Generating new OG image for: ${title}`);
		const postDate = getFormattedDate(pubDate, {
			month: "long",
			weekday: "long",
		});
		const svg = await satori(ogMarkup(title, postDate), ogOptions);
		pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
		writeToCache(title, pubDate, pngBuffer);
	}

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.values()
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}))
		.toArray();
}
