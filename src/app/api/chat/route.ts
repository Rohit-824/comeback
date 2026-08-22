import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Extract the latest message correctly from frontend state
    const latestMessage = messages[messages.length - 1]?.content || 'Hello';

    // Format full chat history so Gemini knows the context
    const historyPrompt = messages.map((m: any) => 
      `${m.role === 'user' ? 'Student' : 'comeBack AI'}: ${m.content}`
    ).join('\n');

    const prompt = `You are "comeBack AI", a friendly and intelligent assistant built for engineering students in Delhi (DTU, DU, NSUT). 
    Your core purpose is to help students understand re-appear exam processes, guide them on how to submit verified fee appeals, and explain how 0% commission direct P2P UPI funding works. 
    Keep your answers helpful, conversational, and direct.

Here is the conversation history:
${historyPrompt}
comeBack AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const replyText = response.text || 'I am here to help you with your college fee appeals!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ 
      reply: `comeBack AI is here to help with your re-appear fee support and 0% P2P UPI transfers. (Error: ${error.message})` 
    }, { status: 200 });
  }
}