/**
 * @jest-environment node
 */
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          need: { urgency: 'High', location: 'Test Location', description: 'Test Need' },
          match: { bestMatchId: '1', bestMatchName: 'Test Match', reasoning: 'Test Reasoning' }
        })
      })
    }
  }))
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table) => {
      if (table === 'volunteers') {
        return { select: jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'Test Match' }], error: null }) };
      }
      if (table === 'needs_reports') {
        return { 
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { id: 'need1', urgency: 'High', location: 'Test Location', description: 'Test Need' }, error: null })
        };
      }
      return {};
    })
  }
}));

describe('Dispatch API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if no transcript', async () => {
    const req = {
      json: async () => ({})
    } as any;
    const res = await POST(req) as NextResponse;
    expect(res.status).toBe(400);
  });

  it('processes transcript successfully', async () => {
    const req = {
      json: async () => ({ transcript: 'Test' })
    } as any;
    const res = await POST(req) as NextResponse;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.need.location).toBe('Test Location');
    expect(json.match.bestMatchName).toBe('Test Match');
  });
});
