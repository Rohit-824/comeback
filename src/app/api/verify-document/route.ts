import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
        {
          text: 'Analyze this student document (fee receipt or marks record). Check if it looks valid and extract details. Return a clean JSON object with fields: "isValid" (boolean), "trustScore" (number between 90 to 99), "extractedName" (string), "extractedAmount" (number), and "summary" (string).'
        }
      ],
    });

    return NextResponse.json({ result: response.text });
  } catch (error) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify document' }, { status: 500 });
  }
}