/**
 * @jest-environment node
 */
import { POST } from './route';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'Test Volunteer' }], error: null })
  }
}));

// Mock the Gemini API
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          bestMatchId: 'v1',
          bestMatchName: 'Arun Kumar',
          reasoning: 'Arun is only 2km away and has First Aid skills.'
        })
      })
    }
  }))
}));

describe('POST /api/match', () => {
  it('returns 400 if no description is provided', async () => {
    const request = new Request('http://localhost:3000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('matches a volunteer using AI', async () => {
    const request = new Request('http://localhost:3000/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ needDescription: 'Need medical help fast' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.match.bestMatchName).toBe('Arun Kumar');
    expect(data.match.reasoning).toContain('First Aid');
  });
});
