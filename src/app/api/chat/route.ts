import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const latestMessage = messages[messages.length - 1]?.content || 'Hello';

    const chatHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
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

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}