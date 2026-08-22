import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(); // Uses GEMINI_API_KEY from process.env

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1]?.content || 'Hello';

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || '' }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: {
        systemInstruction: 'You are "comeBack AI", a friendly and intelligent assistant built for engineering students in Delhi (DTU, DU, NSUT). Help students understand re-appear exam processes, guide them on how to submit verified fee appeals, and explain how 0% commission direct P2P UPI funding works. Keep answers concise, helpful, and encouraging.',
      }
    });

    const response = await chat.sendMessage({
      message: latestMessage
    });

    const replyText = response.text || 'I am here to help you with your college fee appeals!';

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chatbot API Error Details:', error);
    return NextResponse.json({ 
      reply: 'I encountered a brief connection glitch. Please try sending your message again!' 
    }, { status: 200 }); // Returning 200 with fallback text prevents UI hanging
  }
}