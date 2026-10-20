/** A retry of the same actor/course/bytes recovers the same immutable upload. */
export async function uploadOriginal(file: File, editionId: string): Promise<{ id: string }> {
  if (file.size === 0 || file.size > 20 * 1024 * 1024) throw new Error('asset_too_large_or_empty')
  const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  const hexadecimal = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('')
  const response = await fetch(`/study/assets?editionId=${encodeURIComponent(editionId)}`, {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': file.type, 'Idempotency-Key': `asset-v1:${editionId}:${file.type}:${hexadecimal}` },
    body: file,
  })
  if (!response.ok) throw new Error('upload_failed')
  return response.json() as Promise<{ id: string }>
}
