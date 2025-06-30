import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
export async function POST(req: Request) {
    const { title, desc } = await req.json();
    console.log({ title, desc });
    // TODO W2: send to Slack
    const meetUrl = `https://meet.jit.si/bugbuddy-${randomUUID()}`; // temp
    return NextResponse.json({ meetUrl });
}
