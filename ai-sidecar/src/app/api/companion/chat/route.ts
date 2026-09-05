import { NextRequest, NextResponse } from "next/server";
import { orchestrator } from "@/lib/provider/orchestrator";
import { sidecarStore } from "@/lib/storage/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId = `sess-${Date.now()}`, history = [], context = {} } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required and cannot be empty." }, { status: 400 });
    }

    // Save session activity
    let session = sidecarStore.getSession(sessionId);
    if (!session) {
      session = {
        sessionId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        userConstraints: {},
        messages: [],
      };
    }
    session.lastActiveAt = new Date().toISOString();
    session.messages.push({
      id: `msg-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });
    sidecarStore.saveSession(session);

    // Set up Server-Sent Events stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of orchestrator.streamChat(message, history, context)) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.close();
        } catch (err: any) {
          const errorEvent = `data: ${JSON.stringify({ type: "error", payload: { message: err.message } })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process chat turn." }, { status: 500 });
  }
}
