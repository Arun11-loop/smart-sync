import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminDashboard from './page'

// Mock the DashboardMap
jest.mock('@/components/ui/DashboardMap', () => {
  return function MockDashboardMap() {
    return <div data-testid="dashboard-map">Mock Map</div>
  }
})

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({
      data: [{ id: '1', description: 'Test Need', location: 'Test Loc', urgency: 'High' }]
    })
  }
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ match: { bestMatchName: 'Arun Kumar', reasoning: 'Perfect match' } }),
  })
) as jest.Mock;

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  it('renders headers, map, and needs list', async () => {
    render(<AdminDashboard />)
    expect(screen.getByRole('heading', { name: /command center/i })).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-map')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getAllByRole('region').length).toBeGreaterThan(0)
    })
  })

  it('handles the AI match process', async () => {
    render(<AdminDashboard />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /match volunteer via ai/i }).length).toBeGreaterThan(0)
    })
    
    const matchButtons = screen.getAllByRole('button', { name: /match volunteer via ai/i })
    fireEvent.click(matchButtons[0])
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Matched: Arun Kumar')).toBeInTheDocument()
      expect(screen.getByText('Perfect match')).toBeInTheDocument()
    })
  })
})
