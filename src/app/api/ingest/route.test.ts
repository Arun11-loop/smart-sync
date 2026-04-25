/**
 * @jest-environment node
 */
import { POST } from './route';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null })
  }
}));

// Mock the Gemini API
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          urgency: 'High',
          location: 'Sector 4',
          description: 'Medical supplies needed'
        })
      })
    }
  }))
}));

describe('POST /api/ingest', () => {
  it('returns 400 if no image is provided', async () => {
    const formData = new FormData();
    const request = new Request('http://localhost:3000/api/ingest', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('No image provided');
  });

  it('processes image and returns structured JSON', async () => {
    const formData = new FormData();
    // Create a mock blob masquerading as an image
    const blob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    formData.append('image', blob, 'test.jpg');

    const request = new Request('http://localhost:3000/api/ingest', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.urgency).toBe('High');
    expect(data.data.location).toBe('Sector 4');
  });
});
