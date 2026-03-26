type PdfLoadCompatibilityOptions = {
  disableStream?: boolean
  disableRange?: boolean
  disableAutoFetch?: boolean
}

export function buildPdfLoadCompatibilityOptions(
  userAgent: string | undefined,
): PdfLoadCompatibilityOptions {
  if (!isSafariBrowser(userAgent)) {
    return {}
  }

  return {
    disableStream: true,
    disableRange: true,
    disableAutoFetch: true,
  }
}

function isSafariBrowser(userAgent: string | undefined): boolean {
  if (!userAgent) {
    return false
  }

  const normalized = userAgent.toLowerCase()
  const isSafariEngine = normalized.includes('safari')
  const isOtherBrowser =
    normalized.includes('chrome') ||
    normalized.includes('crios') ||
    normalized.includes('chromium') ||
    normalized.includes('fxios') ||
    normalized.includes('edgios') ||
    normalized.includes('opr/') ||
    normalized.includes('android')

  return isSafariEngine && !isOtherBrowser
}
