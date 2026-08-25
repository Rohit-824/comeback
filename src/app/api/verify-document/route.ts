import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType, docType, expectedSubject, expectedGrade, expectedAmount } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ isValid: false, summary: 'No document image provided.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: 'Server Error: OPENROUTER_API_KEY is missing in .env.local.'
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

    // OpenRouter is OpenAI-API-compatible. Using Gemma's free vision-capable model
    // — no credit card required. Free-model lineup rotates; if this ID stops working,
    // check openrouter.ai/models filtered to "free" + "vision" for a current replacement.
    const openrouter = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    const mt = mimeType || 'image/jpeg';

    try {
      const completion = await openrouter.chat.completions.create({
        model: 'google/gemma-4-31b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${validationInstructions}

Return ONLY a clean JSON object (no markdown, no backticks, no extra text):
{
  "isValid": boolean,
  "trustScore": number,
  "extractedName": string,
  "extractedAmount": number,
  "summary": string
}`
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mt};base64,${imageBase64}` }
              }
            ]
          }
        ]
      });

      const rawText = completion.choices[0]?.message?.content;

      if (!rawText) {
        return NextResponse.json({
          isValid: false,
          trustScore: 0,
          summary: 'Could not read AI response.',
          _debug: completion
        });
      }

      // Free vision models don't always support strict JSON schema mode,
      // so strip any markdown fencing the model might add anyway.
      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseErr) {
        return NextResponse.json({
          isValid: false,
          trustScore: 0,
          summary: `AI returned a non-JSON response: ${cleanedText.slice(0, 200)}`
        });
      }

      return NextResponse.json(parsed);
    } catch (apiErr: any) {
      console.error('OpenRouter API error:', apiErr);
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: `OpenRouter Error: ${apiErr.message || String(apiErr)}`
      });
    }
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}