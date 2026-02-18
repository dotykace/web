export async function POST(req: Request) {
  const body = await req.json()
  console.log("CLIENT LOG:", body.msg)
  return new Response("ok")
}