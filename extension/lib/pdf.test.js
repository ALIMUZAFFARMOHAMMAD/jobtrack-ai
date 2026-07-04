import { describe, it, expect, beforeEach } from 'vitest'
import { jsPDF } from 'jspdf'
import { textToPdfBlob } from './pdf.js'

// textToPdfBlob reads window.jspdf.jsPDF (vendored locally for the real extension,
// since MV3 CSP forbids remote scripts). In tests we point it at the same jsPDF
// library via npm, matching what the vendored UMD build exposes.
beforeEach(() => {
  globalThis.window = globalThis.window || globalThis
  window.jspdf = { jsPDF }
})

async function readHeaderAndTrailer(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer())
  const head = new TextDecoder().decode(buf.slice(0, 8))
  const tail = new TextDecoder().decode(buf.slice(-16))
  return { size: buf.length, head, tail }
}

describe('textToPdfBlob', () => {
  it('produces a valid PDF with the correct header and trailer', async () => {
    const blob = textToPdfBlob('Jane Doe\nSoftware Engineer')
    const { size, head, tail } = await readHeaderAndTrailer(blob)
    expect(head).toBe('%PDF-1.3')
    expect(tail).toContain('%%EOF')
    expect(size).toBeGreaterThan(0)
  })

  it('paginates long text across multiple pages', async () => {
    const longText = Array.from({ length: 200 }, (_, i) => `Line ${i}`).join('\n')
    const blob = textToPdfBlob(longText)
    const buf = new Uint8Array(await blob.arrayBuffer())
    const text = new TextDecoder('latin1').decode(buf)
    const pageMatches = text.match(/\/Type\s*\/Page[^s]/g) || []
    expect(pageMatches.length).toBeGreaterThan(1)
  })

  it('throws a clear error when jsPDF is not loaded', () => {
    window.jspdf = undefined
    expect(() => textToPdfBlob('anything')).toThrow(/jsPDF/)
  })
})
