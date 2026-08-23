import { NextResponse } from 'next/server';

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

    // Using the Interactions API (generally available as of June 2026) instead of
    // the legacy :generateContent endpoint. The legacy endpoint has a widely-reported
    // bug rejecting new "auth" (AQ.) API keys with a 401 ACCESS_TOKEN_TYPE_UNSUPPORTED
    // error, even when passed correctly via x-goog-api-key. The Interactions API does
    // not have this problem.
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          input: `You are "comeBack AI", a friendly assistant for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes and explain 0% commission direct P2P UPI funding.\n\nUser Question: ${latestMessage}`
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      return NextResponse.json({ reply: `Gemini Error: ${data.error.message}` });
    }

    // Interactions API responses put model text inside steps[].content[]
    // (SDKs surface this as `output_text`; the raw REST response requires walking steps).
    let replyText = 'I am here to help you with your college fee appeals!';
    const steps = data?.steps || [];
    const modelStep = steps.find((s: any) => s.type === 'model_output');
    const textBlock = modelStep?.content?.find((c: any) => c.type === 'text');
    if (textBlock?.text) {
      replyText = textBlock.text;
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ reply: `Error: ${error.message}` });
  }
}