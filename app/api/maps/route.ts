import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, execute } from '@/lib/db'
import { Map } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active') === 'true'

    let sql = 'SELECT * FROM maps'
    const params: unknown[] = []

    if (active) {
      sql += ' WHERE active = 1'
    }

    sql += ' ORDER BY created_at DESC'

    const maps = queryMany<Map>(sql, params)

    return NextResponse.json({
      success: true,
      data: maps,
    })
  } catch (error) {
    console.error('Error fetching maps:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maps',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      description,
      friendly_url,
      active = true,
      pwa_enable = true,
      language = 'da',
    } = body

    if (!code || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code and name are required',
        },
        { status: 400 }
      )
    }

    const insertSql = `
      INSERT INTO maps (code, name, description, friendly_url, active, pwa_enable, language)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const params = [code, name, description || null, friendly_url || null, active ? 1 : 0, pwa_enable ? 1 : 0, language]
    execute(insertSql, params)

    // Get the inserted map
    const map = queryOne<Map>('SELECT * FROM maps WHERE code = ?', [code])

    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create map',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: map,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating map:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create map',
      },
      { status: 500 }
    )
  }
}
