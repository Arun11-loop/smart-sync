import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Fetch volunteers
    const { data: volunteers, error: dbError } = await supabase.from('volunteers').select('*');
    if (dbError) throw new Error("Failed to fetch volunteers from Supabase");

    const prompt = `You are an AI Voice Dispatch Coordinator.
A commander just said: "${transcript}"

Here is the list of available volunteers:
${JSON.stringify(volunteers, null, 2)}

Task:
1. Parse the commander's statement into a structured crisis need.
2. Select the absolute best volunteer to dispatch based on skills, distance, and availability.

Return ONLY a valid JSON object in this format:
{
  "need": {
    "urgency": "High",
    "location": "Extracted location name",
    "description": "Brief summary of the need"
  },
  "match": {
    "bestMatchId": "v...",
    "bestMatchName": "...",
    "reasoning": "A concise 1-sentence explanation of why they are dispatched."
  }
}
Make sure urgency is one of: High, Medium, Low.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt]
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(rawText);

    // Save the need
    const { data: needData, error: insertError } = await supabase
      .from('needs_reports')
      .insert([parsedData.need])
      .select('*')
      .single();

    if (insertError) {
      console.error("Insert Error", insertError);
      throw new Error("Failed to save need");
    }

    return NextResponse.json({ success: true, need: needData, match: parsedData.match });
  } catch (error: any) {
    console.error('Dispatch Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process dispatch' }, { status: 500 });
  }
}
