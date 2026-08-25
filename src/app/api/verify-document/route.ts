import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, docType, expectedSubject, expectedGrade, expectedAmount } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ isValid: false, summary: 'No document image provided.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: 'Server Error: GEMINI_API_KEY is missing in .env.local.'
      });
    }

    let validationInstructions = 'Check if this image is a valid student document.';
    if (docType === 'collegeId') {
      validationInstructions = 'Check if this is a valid College Student ID Card with a photo, logo, and roll number.';
    } else if (docType === 'marksheet') {
      validationInstructions = `Check if this is a valid marksheet showing subject ${expectedSubject} and grade ${expectedGrade}.`;
    } else if (docType === 'feeChallan') {
      validationInstructions = `Check if this is an official fee challan for amount ₹${expectedAmount}.`;
    }

    // Using the official SDK instead of raw fetch() — see chat route for why.
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: validationInstructions },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType || 'image/jpeg'
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              trustScore: { type: Type.NUMBER },
              extractedName: { type: Type.STRING },
              extractedAmount: { type: Type.NUMBER },
              summary: { type: Type.STRING }
            },
            required: ['isValid', 'trustScore', 'summary']
          }
        }
      });

      const rawText = response.text;

      if (!rawText) {
        return NextResponse.json({
          isValid: false,
          trustScore: 0,
          summary: 'Could not read AI response.',
          _debug: response
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        return NextResponse.json({
          isValid: false,
          trustScore: 0,
          summary: `AI returned a non-JSON response: ${rawText.slice(0, 200)}`
        });
      }

      return NextResponse.json(parsed);
    } catch (sdkErr: any) {
      console.error('Gemini SDK error:', sdkErr);
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: `Gemini SDK Error: ${sdkErr.message || String(sdkErr)}`
      });
    }
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}