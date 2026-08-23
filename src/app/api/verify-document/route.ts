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

    // Using the Interactions API instead of the legacy :generateContent endpoint.
    // The legacy endpoint currently rejects new "auth" (AQ.) API keys with a 401
    // ACCESS_TOKEN_TYPE_UNSUPPORTED error even when using x-goog-api-key correctly.
    // The Interactions API is unaffected and is Google's recommended endpoint going forward.
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          input: [
            { type: 'text', text: validationInstructions },
            {
              type: 'image',
              data: imageBase64,
              mime_type: mimeType || 'image/jpeg'
            }
          ],
          // Structured output: guarantees valid JSON back, no more manual
          // backtick-stripping / JSON.parse gambling.
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean' },
                trustScore: { type: 'number' },
                extractedName: { type: 'string' },
                extractedAmount: { type: 'number' },
                summary: { type: 'string' }
              },
              required: ['isValid', 'trustScore', 'summary']
            }
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      return NextResponse.json({ isValid: false, trustScore: 0, summary: `Gemini API Error: ${data.error.message}` });
    }

    const steps = data?.steps || [];
    const modelStep = steps.find((s: any) => s.type === 'model_output');
    const textBlock = modelStep?.content?.find((c: any) => c.type === 'text');
    let rawText = textBlock?.text;

    // Fallback in case the shape differs from what's documented
    if (!rawText && data?.output_text) {
      rawText = data.output_text;
    }

    if (!rawText) {
      // TEMP DEBUG: return the raw shape in the response itself so it's visible
      // in the browser Network tab (Vercel server logs are harder to reach quickly).
      // Remove _debug once parsing is confirmed working.
      return NextResponse.json({
        isValid: false,
        trustScore: 0,
        summary: 'Could not read AI response.',
        _debug: data
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
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}