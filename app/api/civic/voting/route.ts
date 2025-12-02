import { getZipVotingProfile } from "@/lib/civic/votingProfile"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get("zip")

  if (!zip) {
    return new Response(JSON.stringify({ error: "Missing zip parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const profile = getZipVotingProfile(zip)
  if (!profile) {
    return new Response(JSON.stringify({ error: "ZIP not supported" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }

  return Response.json(profile)
}
