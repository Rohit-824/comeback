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

    // OpenRouter is OpenAI-API-compatible. Using free (:free) vision-capable models
    // — no credit card required. Free-model lineup rotates and can hit rate limits
    // (429), so we try a couple of models in sequence before giving up.
    const openrouter = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    });

    const mt = mimeType || 'image/jpeg';
    const promptText = `${validationInstructions}

Return ONLY a clean JSON object (no markdown, no backticks, no extra text):
{
  "isValid": boolean,
  "trustScore": number,
  "extractedName": string,
  "extractedAmount": number,
  "summary": string
}

For "trustScore": always a whole number integer from 0 to 100 (e.g. 95, not 0.95). Never a decimal or fraction.
For "summary": write one short, clear sentence a student will understand, in plain language.
- If valid: confirm what you saw, e.g. "This looks like a valid college ID with a photo and roll number."
- If invalid: state exactly what's wrong, e.g. "This does not look like a valid college ID — no roll number or college logo is visible." or "This marksheet shows a different subject than expected."
Do not use technical terms like "JSON", "API", "model", or "confidence score" in the summary.`;

    // Ordered fallback list. If one free model is rate-limited or down, try the next.
    const modelsToTry = [
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free'
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const completion = await openrouter.chat.completions.create({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
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
          lastError = new Error('Empty response from model');
          continue;
        }

        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          const parsed = JSON.parse(cleanedText);

          // Defensive normalization: some models return trustScore as a 0-1
          // decimal instead of a 0-100 integer, which breaks integer DB columns.
          if (typeof parsed.trustScore === 'number') {
            let score = parsed.trustScore;
            if (score > 0 && score <= 1) {
              score = score * 100;
            }
            parsed.trustScore = Math.round(Math.max(0, Math.min(100, score)));
          } else {
            parsed.trustScore = 0;
          }

          return NextResponse.json(parsed);
        } catch (parseErr) {
          lastError = new Error(`Non-JSON response: ${cleanedText.slice(0, 200)}`);
          continue;
        }
      } catch (apiErr: any) {
        console.error(`OpenRouter error with model ${model}:`, apiErr);
        lastError = apiErr;
        // 429 / provider errors: try the next model in the list instead of failing outright.
        continue;
      }
    }

    // All models failed — return a friendly, non-technical message to the user
    // instead of leaking raw API error text (e.g. "429 Provider returned error").
    console.error('All document verification models failed. Last error:', lastError);
    return NextResponse.json({
      isValid: false,
      trustScore: 0,
      summary: 'Our document verification service is a bit busy right now. Please wait a moment and try uploading again.'
    });
  } catch (error: any) {
    console.error('AI Verification Error:', error);
    return NextResponse.json({ isValid: false, trustScore: 0, summary: `AI validation error: ${error.message}` });
  }
}