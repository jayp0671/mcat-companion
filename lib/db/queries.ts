export async function notImplementedQuery(name: string) {
  return { ok: false, message: `${name} query is scaffolded but not implemented yet.` };
}
