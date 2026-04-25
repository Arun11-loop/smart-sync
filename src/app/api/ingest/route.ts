import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = image.type;

    const prompt = `You are an expert data extractor. Analyze this image of a field report or survey. 
Extract the following information and return ONLY a valid JSON object (no markdown formatting, no code blocks):
{
  "urgency": "High | Medium | Low",
  "location": "The extracted location name",
  "description": "A brief 1-sentence summary of the need"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        { inlineData: { data: base64Data, mimeType } }
      ]
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(rawText);

    // Save to real Supabase database
    const { error: dbError } = await supabase
      .from('needs_reports')
      .insert([
        { 
          urgency: parsedData.urgency, 
          location: parsedData.location, 
          description: parsedData.description 
        }
      ]);

    if (dbError) {
       console.error("Supabase Error:", dbError);
       throw new Error("Failed to save to database");
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Ingestion Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
  }
}
