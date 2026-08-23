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

    // Pass the AQ. key as a Bearer token instead of a URL query param
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are "comeBack AI", a friendly assistant for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes and explain 0% commission direct P2P UPI funding.\n\nUser Question: ${latestMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiRes.json();
    
    if (data.error) {
      return NextResponse.json({ reply: `Gemini Error: ${data.error.message}` });
    }

    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      'I am here to help you with your college fee appeals!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ reply: `Error: ${error.message}` });
  }
}