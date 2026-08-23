import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || 'Hello';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are "comeBack AI", a friendly and intelligent assistant for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes, guide them on how to submit verified fee appeals, and explain how 0% commission direct P2P UPI funding works. Keep answers concise, helpful, and encouraging.\n\nUser Question: ${latestMessage}`,
    });

    const replyText = response.text || 'I am here to help you with your college fee appeals and re-appear guidance!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ 
      reply: `comeBack AI is ready to help! (Error: ${error.message || 'Connection glitch'})` 
    });
  }
}