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
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: `Analyze this document. It MUST be a student ID card, a university marksheet showing failed/back subjects, or an official fee challan.
              
              CRITICAL INSTRUCTIONS:
              1. If the image is a random photo, blank, or not a relevant student document, set "isValid" to false.
              2. For invalid documents, set "trustScore" to 0 and "summary" to "Please provide a valid latest college ID card or marksheet in which the student fails."
              3. If valid, extract "extractedName" (string), "extractedAmount" (number), set "isValid" to true, and generate a professional "summary".
              4. For valid documents, provide a "trustScore" between 60-100 based on image clarity and authenticity.
              
              Return ONLY a clean JSON object (no markdown, no extra text):
              {
                "isValid": boolean,
                "trustScore": number,
                "extractedName": string,
                "extractedAmount": number,
                "summary": string
              }`
            }
          ]
        }
      ],
    });

    // Fixed: response.text is a property, not a function
    const rawText = response.text || '{}';
    const text = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return NextResponse.json(JSON.parse(text));
    
  } catch (error) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ error: 'Failed to verify document' }, { status: 500 });
  }
}