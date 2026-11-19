import { NextRequest } from 'next/server'
import { verifyAdmin, apiError, apiSuccess } from '@/lib/api-helpers'
import { getSearchConsoleDashboard, SearchConsoleError } from '@/lib/google/search-console'

export const dynamic = 'force-dynamic'

function noStore(response: Response): Response {
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export async function GET(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) return noStore(apiError('Unauthorized', 401))

    const data = await getSearchConsoleDashboard()
    return noStore(apiSuccess(data))
  } catch (error) {
    if (error instanceof SearchConsoleError) {
      return noStore(apiError(error.message, error.status))
    }
    return noStore(apiError('Could not load Google Search Console data', 500))
  }
}
