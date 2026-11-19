/**
 * Website texts the team can edit. The built-in text lives in messages/*.json;
 * a saved override replaces a whole text group (namespace) for one language.
 * Pure module (no framework imports).
 */

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Text groups offered in the admin panel, with a plain-language name for each. */
export const TEXT_GROUPS = [
  { key: 'hero', labelMn: 'Нүүр хуудас: том зураг ба гарчиг' },
  { key: 'stats', labelMn: 'Нүүр хуудас: тоон мэдээлэл' },
  { key: 'featuredTours', labelMn: 'Нүүр хуудас: онцлох аяллууд' },
  { key: 'recentlyAddedTours', labelMn: 'Нүүр хуудас: шинэ аяллууд' },
  { key: 'destinations', labelMn: 'Нүүр хуудас: чиглэлүүд' },
  { key: 'impact', labelMn: 'Нүүр хуудас: бидний амлалтууд' },
  { key: 'whyUs', labelMn: 'Нүүр хуудас: яагаад бид' },
  { key: 'gallery', labelMn: 'Фото галерей (гарчиг)' },
  { key: 'bookingCTA', labelMn: 'Нүүр хуудас: холбогдох урилга' },
  { key: 'about', labelMn: 'Бидний тухай хуудас' },
  { key: 'services', labelMn: 'Үйлчилгээ хуудас' },
  { key: 'info', labelMn: 'Аяллын мэдээлэл хуудас' },
  { key: 'culture', labelMn: 'Соёл, түүх хуудасны гарчиг' },
  { key: 'blog', labelMn: 'Блог хуудасны гарчиг' },
  { key: 'contact', labelMn: 'Холбоо барих хуудас (түгээмэл асуулт, мэдээлэл)' },
  { key: 'departures', labelMn: 'Бүлгийн аяллын хуудас' },
  { key: 'testimonials', labelMn: 'Сэтгэгдлийн хэсгийн гарчиг' },
  { key: 'footer', labelMn: 'Хуудасны доод хэсэг' },
  { key: 'nav', labelMn: 'Цэсний нэрс' },
] as const
export type TextGroupKey = (typeof TEXT_GROUPS)[number]['key']
export const TEXT_GROUP_KEYS: string[] = TEXT_GROUPS.map((g) => g.key)

const isObj = (v: unknown): v is { [k: string]: Json } => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Shape check for an edited group: it must have the same structure as the
 * built-in text (same keys, strings stay strings, lists stay lists, and list
 * items keep the shape of the first built-in item). Prevents a broken edit from
 * crashing a page. Returns the cleaned value or null when it does not fit.
 */
export function conformToDefault(value: unknown, def: Json): Json | null {
  if (typeof def === 'string') return typeof value === 'string' ? value.slice(0, 20000) : null
  if (typeof def === 'number' || typeof def === 'boolean' || def === null) return typeof value === typeof def ? (value as Json) : null
  if (Array.isArray(def)) {
    if (!Array.isArray(value)) return null
    const template = def[0]
    if (template === undefined) return value.length === 0 ? [] : null
    const out: Json[] = []
    for (const item of value.slice(0, 200)) {
      const c = conformToDefault(item, template)
      if (c === null) return null
      out.push(c)
    }
    return out
  }
  if (isObj(def)) {
    if (!isObj(value)) return null
    const out: { [k: string]: Json } = {}
    for (const k of Object.keys(def)) {
      const c = conformToDefault(value[k], def[k])
      out[k] = c === null ? def[k] : c
    }
    return out
  }
  return null
}

/** Messages with the saved text groups applied (a group in `overrides` replaces the built-in one). */
export function applyTextOverrides<T extends Record<string, unknown>>(messages: T, overrides: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...messages }
  for (const [ns, data] of Object.entries(overrides)) {
    if (ns in messages && TEXT_GROUP_KEYS.includes(ns)) {
      const fitted = conformToDefault(data, messages[ns] as Json)
      if (fitted !== null) out[ns] = fitted
    }
  }
  return out as T
}
