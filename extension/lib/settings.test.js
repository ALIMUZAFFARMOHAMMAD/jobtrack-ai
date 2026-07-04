import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getApiBaseUrl, setApiBaseUrl, getResumeText, setResumeText } from './settings.js'

function makeChromeStorageMock() {
  let store = {}
  return {
    local: {
      get: vi.fn(async (key) => ({ [key]: store[key] })),
      set: vi.fn(async (obj) => {
        store = { ...store, ...obj }
      }),
    },
  }
}

beforeEach(() => {
  globalThis.chrome = { storage: makeChromeStorageMock() }
})

describe('apiBaseUrl', () => {
  it('defaults to an empty string when unset', async () => {
    expect(await getApiBaseUrl()).toBe('')
  })

  it('stores and retrieves a trimmed URL with trailing slashes removed', async () => {
    await setApiBaseUrl('  https://example.vercel.app/// ')
    expect(await getApiBaseUrl()).toBe('https://example.vercel.app')
  })
})

describe('resumeText', () => {
  it('defaults to an empty string when unset', async () => {
    expect(await getResumeText()).toBe('')
  })

  it('stores and retrieves resume text as-is', async () => {
    await setResumeText('Jane Doe\nSoftware Engineer...')
    expect(await getResumeText()).toBe('Jane Doe\nSoftware Engineer...')
  })

  it('treats a missing value as an empty string, not undefined', async () => {
    await setResumeText(undefined)
    expect(await getResumeText()).toBe('')
  })
})
