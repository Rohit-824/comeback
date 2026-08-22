import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemInstruction = `You are "comeBack AI", a friendly AI assistant built for engineering students (like DTU and DU students). Your job is to help students understand re-appear exam processes, guide them on how to submit secure verified fee appeals, and explain how the 0% commission direct P2P UPI funding works. Keep answers concise, encouraging, and clear.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chatbot Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}