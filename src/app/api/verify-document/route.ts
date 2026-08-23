import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, docType, expectedSubject, expectedGrade, expectedAmount } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ isValid: false, summary: 'No document image provided.' }, { status: 400 });
    }

    let validationInstructions = '';

    if (docType === 'collegeId') {
      validationInstructions = `Check this image to see if it is a valid College Student ID Card. It MUST contain a student photo/portrait, a college name or logo, and a student roll number or ID. If it is a random photo, landscape, or blank, set "isValid" to false and "summary" to "Invalid ID card: missing student photo, college logo, or roll number."`;
    } else if (docType === 'marksheet') {
      validationInstructions = `Check this image to see if it is a valid university marksheet or grade report showing a back/re-appear subject. The user entered Subject Code: "${expectedSubject}" and Grade: "${expectedGrade}". If the document is unrelated or does not match academic grades, set "isValid" to false and "summary" to "Invalid marksheet document. Please upload a genuine result sheet showing your back subjects."`;
    } else if (docType === 'feeChallan') {
      validationInstructions = `Check this image to see if it is an official fee challan, payment receipt, or university fee notice supporting a re-appear fee. The expected fee amount is ₹${expectedAmount}. If it is a random photo or unrelated picture, set "isValid" to false and "summary" to "Invalid fee challan: document does not appear to be a valid university fee receipt or notice."`;
    } else {
      validationInstructions = `Check if this image is a valid student document. If it is a random photo or unrelated, set "isValid" to false.`;
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
              text: `${validationInstructions}
              
              Return ONLY a clean JSON object (no markdown formatting, no backticks, no extra text):
              {
                "isValid": boolean,
                "trustScore": number (0 if invalid, 70-99 if valid),
                "extractedName": string,
                "extractedAmount": number,
                "summary": string
              }`
            }
          ]
        }
      ],
    });

    const rawText = response.text || '{}';
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}