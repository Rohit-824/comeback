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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}