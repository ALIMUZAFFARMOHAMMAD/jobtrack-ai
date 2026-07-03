import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  it('mounts without throwing and renders the shell', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('renders the signed-out gate with a way to get started', () => {
    render(<App />)
    expect(screen.getByText(/Get started free/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
  })
})
