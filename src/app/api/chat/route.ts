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
      contents: `You are "comeBack AI", a friendly assistant for DTU, DU, and NSUT engineering students. Answer questions regarding re-appear exams and fee support clearly. 
      Student: ${latestMessage}
      comeBack AI:`,
    });

    const replyText = response.text || 'I am here to help you with your college fee appeals!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ 
      reply: 'Hello! I am comeBack AI. I can guide you through submitting your re-appear fee appeals with 0% P2P commission.' 
    }, { status: 200 });
  }
}