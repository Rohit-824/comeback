import { NextResponse } from 'next/server';

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

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Gemini API keys are NOT OAuth tokens, so they can't go in
          // an "Authorization: Bearer ..." header. Use the dedicated
          // x-goog-api-key header instead (or a ?key= query param).
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: mimeType || 'image/jpeg'
                  }
                },
                {
                  text: `${validationInstructions} 
                  
                  Return ONLY a clean JSON object (no markdown, no backticks):
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
          ]
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      return NextResponse.json({ isValid: false, trustScore: 0, summary: `Gemini API Error: ${data.error.message}` });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseErr) {
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: 'AI returned a non-JSON response. Please try again.'
      });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}