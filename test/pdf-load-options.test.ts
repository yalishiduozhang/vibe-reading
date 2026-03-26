import test from 'node:test'
import assert from 'node:assert/strict'

import { buildPdfLoadCompatibilityOptions } from '../src/features/reader/pdf-load-options.ts'

test('buildPdfLoadCompatibilityOptions disables stream-related options for Safari', () => {
  const options = buildPdfLoadCompatibilityOptions(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  )

  assert.deepEqual(options, {
    disableStream: true,
    disableRange: true,
    disableAutoFetch: true,
  })
})

test('buildPdfLoadCompatibilityOptions keeps defaults for Chromium browsers on iOS', () => {
  const options = buildPdfLoadCompatibilityOptions(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/133.0.6943.120 Mobile/15E148 Safari/604.1',
  )

  assert.deepEqual(options, {})
})

test('buildPdfLoadCompatibilityOptions keeps defaults for unknown user agents', () => {
  assert.deepEqual(buildPdfLoadCompatibilityOptions(undefined), {})
  assert.deepEqual(buildPdfLoadCompatibilityOptions(''), {})
})
