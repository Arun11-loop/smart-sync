import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FieldReportPage from './page'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { urgency: 'High', location: 'Sector 4', description: 'Need water' } }),
  })
) as jest.Mock;

describe('FieldReportPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  it('renders the upload interface', () => {
    render(<FieldReportPage />)
    expect(screen.getByText('Field Reporter')).toBeInTheDocument()
    expect(screen.getByText(/Snap a photo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Process Image/i })).toBeDisabled()
  })

  it('allows file selection and processing', async () => {
    render(<FieldReportPage />)
    
    const fileInput = screen.getByTestId('file-upload')
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    // Check if UI updated
    expect(screen.getByText('hello.png')).toBeInTheDocument()
    
    const processBtn = screen.getByRole('button', { name: /Process Image/i })
    expect(processBtn).toBeEnabled()
    
    fireEvent.click(processBtn)
    
    // Expect loading state
    expect(screen.getByRole('button', { name: /Processing image with AI/i })).toBeInTheDocument()
    
    // Wait for the mock API response to populate the UI
    await waitFor(() => {
      expect(screen.getByText('AI Extracted Data')).toBeInTheDocument()
      expect(screen.getByText('Sector 4')).toBeInTheDocument()
    })
  })
})
