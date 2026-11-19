/** Server messages the admin may see, in Mongolian. Anything else is shown after a general Mongolian sentence. */
const MESSAGES: [RegExp, string][] = [
  [/^Unauthorized/i, 'Нэвтрэх шаардлагатай'],
  [/^Server error/i, 'Серверийн алдаа гарлаа'],
  [/^Not found/i, 'Олдсонгүй'],
  [/^Invalid (id|tour)/i, 'Буруу дугаар'],
  [/^Invalid body/i, 'Буруу өгөгдөл'],
  [/^Invalid (\w+)/i, 'Буруу утга оруулсан байна'],
  [/^Nothing to update/i, 'Өөрчлөх зүйл алга'],
  [/^Too many/i, 'Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу'],
  [/^Title is required/i, 'Гарчиг заавал оруулна уу'],
  [/^Slug is required/i, 'Вэб хаяг (slug) заавал оруулна уу'],
  [/^Category is required/i, 'Ангилал сонгоно уу'],
  [/^Date is invalid/i, 'Огноо буруу байна'],
  [/^Name is required/i, 'Нэр заавал оруулна уу'],
  [/^Tour is required/i, 'Аялал сонгоно уу'],
  [/^The review needs at least 10 characters/i, 'Сэтгэгдэл дор хаяж 10 тэмдэгттэй байх ёстой'],
  [/Another article already uses this address/i, 'Энэ вэб хаягийг өөр нийтлэл ашиглаж байна. Өөр хаяг сонгоно уу'],
  [/Start date is invalid/i, 'Эхлэх огноо буруу байна'],
  [/End date is invalid/i, 'Дуусах огноо буруу байна'],
  [/End date must not be before/i, 'Дуусах огноо эхлэх огнооноос өмнө байж болохгүй'],
  [/Enrolled cannot be negative/i, 'Бүртгэгдсэн хүний тоо сөрөг байж болохгүй'],
  [/Maximum must not be below the minimum/i, 'Дээд хэмжээ доод хэмжээнээс бага байж болохгүй'],
  [/(Minimum|Maximum) participants must be at least 1/i, 'Оролцогчдын тоо дор хаяж 1 байх ёстой'],
  [/Price is invalid/i, 'Үнэ буруу байна'],
  [/Status is invalid/i, 'Төлөв буруу байна'],
  [/File is too large/i, 'Файл хэт том байна'],
  [/Use a JPG|Unsupported file type/i, 'JPG, PNG, WebP эсвэл AVIF зураг ашиглана уу'],
  [/not a readable (photo|picture)/i, 'Энэ файлыг зураг болгон уншиж чадсангүй'],
  [/does not match the structure/i, 'Текстийн бүтэц буруу байна'],
  [/Unknown text group/i, 'Тодорхойгүй хэсэг'],
  [/Upload failed/i, 'Зураг оруулахад алдаа гарлаа'],
  [/Could not save/i, 'Хадгалж чадсангүй'],
  [/relation .* does not exist|Could not find the table|schema cache/i, 'Өгөгдлийн сангийн хүснэгт олдсонгүй. Migration-уудыг бүгдийг нь ажиллуулсан эсэхээ шалгана уу'],
  [/fetch failed/i, 'Өгөгдлийн сантай холбогдож чадсангүй. Supabase-ийн тохиргоог шалгана уу'],
]

/** Mongolian text for a server message. */
export function messageMn(message: string): string {
  for (const [rx, mn] of MESSAGES) if (rx.test(message)) return mn
  return `Алдаа гарлаа (${message})`
}

/** Calls an admin API route and returns its `data`; throws an Error with a Mongolian message. */
export async function adminCall<T = unknown>(url: string, method = 'GET', body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Сервертэй холбогдож чадсангүй')
  }
  let json: { data?: T; error?: string } = {}
  try {
    json = await res.json()
  } catch {
    // no JSON body
  }
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login'
    throw new Error('Нэвтрэх шаардлагатай')
  }
  if (!res.ok) throw new Error(messageMn(json.error ?? `HTTP ${res.status}`))
  return json.data as T
}

/** Short Mongolian text for a failed save, with the reason in brackets. */
export const saveFailed = (e: unknown) => `Хадгалж чадсангүй${e instanceof Error && e.message ? ` (${e.message})` : ''}`
