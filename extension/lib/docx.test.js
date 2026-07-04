import { describe, it, expect, beforeEach } from 'vitest'
import JSZip from 'jszip'
import { textToDocxBlob } from './docx.js'

// textToDocxBlob reads window.JSZip (vendored locally for the real extension,
// since MV3 CSP forbids remote scripts). In tests we point it at the same
// JSZip library via npm, so this exercises the real ZIP read/write round-trip.
beforeEach(() => {
  globalThis.window = globalThis.window || globalThis
  window.JSZip = JSZip
})

async function loadParts(blob) {
  const buf = await blob.arrayBuffer()
  const zip = await JSZip.loadAsync(buf)
  return zip
}

describe('textToDocxBlob', () => {
  it('produces a zip with the required OOXML parts', async () => {
    const blob = await textToDocxBlob('Jane Doe\nSoftware Engineer')
    const zip = await loadParts(blob)
    expect(zip.file('[Content_Types].xml')).toBeTruthy()
    expect(zip.file('_rels/.rels')).toBeTruthy()
    expect(zip.file('word/document.xml')).toBeTruthy()
  })

  it('renders each line as its own paragraph', async () => {
    const blob = await textToDocxBlob('Line one\nLine two')
    const zip = await loadParts(blob)
    const xml = await zip.file('word/document.xml').async('string')
    expect(xml).toContain('<w:t xml:space="preserve">Line one</w:t>')
    expect(xml).toContain('<w:t xml:space="preserve">Line two</w:t>')
    expect(xml.match(/<w:p>/g)).toHaveLength(2)
  })

  it('renders blank lines as empty paragraphs', async () => {
    const blob = await textToDocxBlob('First\n\nThird')
    const zip = await loadParts(blob)
    const xml = await zip.file('word/document.xml').async('string')
    expect(xml).toContain('<w:p/>')
  })

  it('escapes XML-sensitive characters', async () => {
    const blob = await textToDocxBlob('Skills: C++ & <Python>')
    const zip = await loadParts(blob)
    const xml = await zip.file('word/document.xml').async('string')
    expect(xml).toContain('Skills: C++ &amp; &lt;Python&gt;')
  })

  it('throws a clear error when JSZip is not loaded', async () => {
    window.JSZip = undefined
    await expect(textToDocxBlob('anything')).rejects.toThrow(/JSZip/)
  })
})
