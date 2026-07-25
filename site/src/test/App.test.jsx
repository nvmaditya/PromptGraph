import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock IntersectionObserver as a class constructor
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver

describe('App', () => {
  it('renders main navigation links', () => {
    render(<App />)
    expect(screen.getByText('pipeline')).toBeInTheDocument()
    expect(screen.getByText('how it works')).toBeInTheDocument()
    expect(screen.getByText('quickstart')).toBeInTheDocument()
  })

  it('renders hero heading and hook', () => {
    render(<App />)
    expect(screen.getByText(/Describe your project/i)).toBeInTheDocument()
  })

  it('renders section headings', () => {
    render(<App />)
    expect(screen.getByText('Six agents, one pass, production-ready output')).toBeInTheDocument()
    expect(screen.getByText('How quality gets enforced')).toBeInTheDocument()
    expect(screen.getByText('Three minutes to your first run')).toBeInTheDocument()
  })
})
