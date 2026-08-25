import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || 'Hello';
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'GROQ_API_KEY is missing in .env.local' });
    }

    // Groq is fully OpenAI-API-compatible: same SDK, just a different baseURL.
    // Free tier, no credit card required.
    const groq = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    try {
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content:
              'You are "comeBack AI", a friendly assistant for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes and explain 0% commission direct P2P UPI funding.'
          },
          {
            role: 'user',
            content: latestMessage
          }
        ]
      });

      const replyText =
        completion.choices[0]?.message?.content ||
        'I am here to help you with your college fee appeals!';

      return NextResponse.json({ reply: replyText });
    } catch (apiErr: any) {
      console.error('Groq API error:', apiErr);
      return NextResponse.json({
        reply: `Groq Error: ${apiErr.message || String(apiErr)}`
      });
    }
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ reply: `Error: ${error.message}` });
  }
}