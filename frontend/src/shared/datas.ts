/** `toISOString` dá a data em UTC: no Brasil, depois das 21h, já seria amanhã. */
const local = (agora: Date) => new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString()

export const hojeLocal = (agora = new Date()) => local(agora).slice(0, 10)

/** Formato do `<input type="datetime-local">`. */
export const agoraLocal = (agora = new Date()) => local(agora).slice(0, 16)
