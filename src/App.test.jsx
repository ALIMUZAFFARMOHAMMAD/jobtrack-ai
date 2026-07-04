import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('mounts without throwing and renders the shell', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('renders the signed-out gate with a way to get started', () => {
    render(<App />)
    expect(screen.getByText(/Get started free/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
  })

  it('restores a signed-in user from localStorage instead of showing the auth gate', () => {
    window.localStorage.setItem('jobtrack_user', JSON.stringify({ name: 'Ali', email: 'ali@example.com' }))
    render(<App />)
    expect(screen.queryByText(/Get started free/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Hi Ali!/i)).toBeInTheDocument()
  })

  it('restores previously tracked jobs from localStorage', () => {
    window.localStorage.setItem('jobtrack_user', JSON.stringify({ name: 'Ali', email: 'ali@example.com' }))
    window.localStorage.setItem('jobtrack_jobs', JSON.stringify([
      { id: 1, company: 'Acme', title: 'PM', location: 'Remote', status: 'Applied', date: '2026-07-01', score: 0 },
    ]))
    render(<App />)
    expect(screen.getByText('PM')).toBeInTheDocument()
    expect(screen.getByText(/Acme/)).toBeInTheDocument()
  })

  it('ignores corrupted localStorage data and falls back to the signed-out gate', () => {
    window.localStorage.setItem('jobtrack_user', '{not valid json')
    render(<App />)
    expect(screen.getByText(/Get started free/i)).toBeInTheDocument()
  })
})
