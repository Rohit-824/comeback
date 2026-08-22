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
      return NextResponse.json({ reply: 'API key is missing in environment variables.' });
    }

    // Direct REST API call to Gemini (bypasses default credential lookups)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are "comeBack AI", a friendly assistant built for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes, guide them on how to submit verified fee appeals, and explain how 0% commission direct P2P UPI funding works. Keep answers concise, helpful, and encouraging.\n\nUser Question: ${latestMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();

    const replyText = 
      data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      'I am here to help you with your college fee appeals and re-appear guidance!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ 
      reply: 'comeBack AI is ready to help you with your re-appear fee support and 0% P2P transfers!' 
    }, { status: 200 });
  }
}