import { NextResponse } from 'next/server'
import { getSearchSuggestionsService } from '@/lib/services/searchService'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const products = await getSearchSuggestionsService(query)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
