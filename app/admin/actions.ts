'use server'

export async function triggerRedeploy(): Promise<{ ok: boolean }> {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!url) return { ok: false }
  const res = await fetch(url, { method: 'POST' })
  return { ok: res.ok }
}
