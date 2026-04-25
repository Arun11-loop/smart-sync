import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardMap from './DashboardMap'

// Mock the google maps hook
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }: any) => <div data-testid="mock-google-map">{children}</div>,
}))

describe('DashboardMap Component', () => {
  it('renders the map container successfully', () => {
    render(<DashboardMap />)
    const mapElement = screen.getByTestId('dashboard-map')
    expect(mapElement).toBeInTheDocument()
    
    const mockMap = screen.getByTestId('mock-google-map')
    expect(mockMap).toBeInTheDocument()
  })
})
