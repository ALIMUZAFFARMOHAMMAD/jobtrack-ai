import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App.jsx'

function signIn() {
  window.localStorage.setItem('jobtrack_user', JSON.stringify({ name: 'Ali', email: 'ali@example.com' }))
}

function uploadResumeFile(file) {
  fireEvent.click(screen.getByText(/My Resume/i))
  const input = document.querySelector('input[type="file"]')
  fireEvent.change(input, { target: { files: [file] } })
}

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

  it('restores a previously uploaded resume from localStorage instead of resetting on refresh', () => {
    signIn()
    window.localStorage.setItem('jobtrack_resumeText', JSON.stringify('SKILLS: SQL, Power BI, Agile...\nEXPERIENCE:\n- Acme (2020-2024): PM'))
    window.localStorage.setItem('jobtrack_resumeFileName', JSON.stringify('resume.pdf'))
    render(<App />)
    fireEvent.click(screen.getByText(/My Resume/i))
    expect(screen.getByText(/✅ resume\.pdf/)).toBeInTheDocument()
  })

  it('ignores corrupted localStorage data and falls back to the signed-out gate', () => {
    window.localStorage.setItem('jobtrack_user', '{not valid json')
    render(<App />)
    expect(screen.getByText(/Get started free/i)).toBeInTheDocument()
  })

  it('surfaces an error instead of storing placeholder text when a PDF fails to parse', async () => {
    signIn()
    render(<App />)
    uploadResumeFile(new File(['%PDF-1.4 not a real pdf'], 'resume.pdf', { type: 'application/pdf' }))
    await waitFor(() => expect(screen.getByText(/Couldn't read resume\.pdf/i)).toBeInTheDocument(), { timeout: 10000 })
    expect(screen.queryByText(/✅ resume.pdf/)).not.toBeInTheDocument()
  }, 15000)

  it('surfaces an error instead of storing placeholder text when a DOCX fails to parse', async () => {
    signIn()
    render(<App />)
    uploadResumeFile(new File(['not a real zip'], 'resume.docx', { type: 'application/vnd.openxmlformats' }))
    await waitFor(() => expect(screen.getByText(/Couldn't read resume\.docx/i)).toBeInTheDocument())
    expect(screen.queryByText(/✅ resume.docx/)).not.toBeInTheDocument()
  })
})
