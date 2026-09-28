import { resolveImage } from "@/lib/images";

export const dynamic = "force-dynamic";

/** Legacy `/images/pexels/<file>.jpg` URLs → CDN photo (no `public/` folder required). */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return new Response(null, {
    status: 308,
    headers: {
      Location: resolveImage(`/images/pexels/${name}`),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
