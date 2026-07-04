import { describe, it, expect, beforeEach, vi } from 'vitest'
import { todayStr, addApp, deleteApp, getApps, statsFrom, lastNDays, toCSV } from './db.js'

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

describe('todayStr', () => {
  it('formats a date as local YYYY-MM-DD', () => {
    const d = new Date(2026, 0, 5, 12, 0, 0) // Jan 5 2026, local noon
    expect(todayStr(d)).toBe('2026-01-05')
  })
})

describe('addApp / getApps / deleteApp', () => {
  it('adds a new application with defaults', async () => {
    const { added, rec } = await addApp({ company: 'Acme', title: 'PM', url: 'https://acme.com/jobs/1' })
    expect(added).toBe(true)
    expect(rec.company).toBe('Acme')
    expect(rec.title).toBe('PM')
    expect(rec.status).toBe('Applied')
    expect(rec.source).toBe('manual')

    const apps = await getApps()
    expect(apps).toHaveLength(1)
  })

  it('defaults missing company/title to placeholders', async () => {
    const { rec } = await addApp({ url: 'https://example.com/job' })
    expect(rec.company).toBe('Unknown')
    expect(rec.title).toBe('Unknown role')
  })

  it('dedupes the same URL logged twice on the same day', async () => {
    await addApp({ company: 'Acme', title: 'PM', url: 'https://acme.com/jobs/1' })
    const second = await addApp({ company: 'Acme', title: 'PM', url: 'https://acme.com/jobs/1' })
    expect(second.added).toBe(false)
    expect(second.reason).toBe('duplicate')

    const apps = await getApps()
    expect(apps).toHaveLength(1)
  })

  it('allows the same URL when other query/hash differs but path matches (still dedupes)', async () => {
    await addApp({ url: 'https://acme.com/jobs/1?ref=x' })
    const second = await addApp({ url: 'https://acme.com/jobs/1?ref=y' })
    expect(second.added).toBe(false)
  })

  it('treats different URLs as distinct applications', async () => {
    await addApp({ url: 'https://acme.com/jobs/1' })
    const second = await addApp({ url: 'https://acme.com/jobs/2' })
    expect(second.added).toBe(true)
    expect(await getApps()).toHaveLength(2)
  })

  it('deletes an application by id', async () => {
    const { rec } = await addApp({ url: 'https://acme.com/jobs/1' })
    const remaining = await deleteApp(rec.id)
    expect(remaining).toHaveLength(0)
    expect(await getApps()).toHaveLength(0)
  })
})

describe('statsFrom', () => {
  it('counts total and today, and computes streak', () => {
    const today = todayStr()
    const apps = [
      { date: today },
      { date: today },
    ]
    const stats = statsFrom(apps)
    expect(stats.total).toBe(2)
    expect(stats.todayCount).toBe(2)
    expect(stats.streak).toBe(1)
  })

  it('returns zero streak when nothing logged today', () => {
    const stats = statsFrom([{ date: '2000-01-01' }])
    expect(stats.todayCount).toBe(0)
    expect(stats.streak).toBe(0)
  })
})

describe('lastNDays', () => {
  it('returns n entries ending today, oldest first', () => {
    const today = todayStr()
    const out = lastNDays({ [today]: 3 }, 7)
    expect(out).toHaveLength(7)
    expect(out[out.length - 1]).toEqual({ date: today, count: 3 })
    expect(out[0].count).toBe(0)
  })
})

describe('toCSV', () => {
  it('produces a header row plus one row per application, newest first', () => {
    const csv = toCSV([
      { date: '2026-01-01', company: 'A', title: 'X', status: 'Applied', source: 'manual', method: 'manual', url: 'u1', ts: '2026-01-01T00:00:00.000Z' },
      { date: '2026-01-02', company: 'B', title: 'Y', status: 'Applied', source: 'manual', method: 'manual', url: 'u2', ts: '2026-01-02T00:00:00.000Z' },
    ])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('date,company,title,status,source,method,url,ts')
    expect(lines[1]).toContain('B') // newest (later ts) first
    expect(lines[2]).toContain('A')
  })

  it('quotes fields containing commas or quotes', () => {
    const csv = toCSV([
      { date: '2026-01-01', company: 'Acme, Inc.', title: 'Say "hi"', status: 'Applied', source: 'manual', method: 'manual', url: 'u', ts: '2026-01-01T00:00:00.000Z' },
    ])
    expect(csv).toContain('"Acme, Inc."')
    expect(csv).toContain('"Say ""hi"""')
  })
})
