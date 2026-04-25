import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { needDescription } = await request.json();

    if (!needDescription) {
      return NextResponse.json({ error: 'Need description is required' }, { status: 400 });
    }

    // Fetch actual volunteers from Supabase
    const { data: volunteers, error: dbError } = await supabase
      .from('volunteers')
      .select('*');

    if (dbError) throw new Error("Failed to fetch volunteers from Supabase");

    const prompt = `You are an AI logistics coordinator for a disaster response team.
A new urgent need has been reported: "${needDescription}"

Here is the list of available volunteers:
${JSON.stringify(volunteers, null, 2)}

Analyze the need and the volunteers. Choose the absolute best volunteer for this specific task based on their skills, distance, and availability.
Return your answer STRICTLY as a JSON object (no markdown, no backticks) in the following format:
{
  "bestMatchId": "v...",
  "bestMatchName": "...",
  "reasoning": "A concise 1-sentence explanation of why they are the perfect match."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt]
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(rawText);

    return NextResponse.json({ success: true, match: parsedData });
  } catch (error: any) {
    console.error('Matching Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to match volunteer' }, { status: 500 });
  }
}
