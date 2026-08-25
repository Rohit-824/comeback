import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || 'Hello';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'GEMINI_API_KEY is missing in .env.local' });
    }

    // Using the official SDK instead of raw fetch(). The new "Auth" (AQ.-prefixed)
    // API keys currently fail against hand-built REST calls with
    // ACCESS_TOKEN_TYPE_UNSUPPORTED, on both the legacy generateContent endpoint
    // and the newer Interactions endpoint. The SDK handles whatever request
    // signing/format the new key type actually requires.
    const ai = new GoogleGenAI({ apiKey });

    let replyText = 'I am here to help you with your college fee appeals!';
    let debugInfo: any = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are "comeBack AI", a friendly assistant for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes and explain 0% commission direct P2P UPI funding.\n\nUser Question: ${latestMessage}`
      });

      if (response.text) {
        replyText = response.text;
      } else {
        debugInfo = response;
      }
    } catch (sdkErr: any) {
      console.error('Gemini SDK error:', sdkErr);
      return NextResponse.json({
        reply: `Gemini SDK Error: ${sdkErr.message || String(sdkErr)}`
      });
    }

    return NextResponse.json(debugInfo ? { reply: replyText, _debug: debugInfo } : { reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ reply: `Error: ${error.message}` });
  }
}