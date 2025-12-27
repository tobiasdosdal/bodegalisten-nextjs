import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, execute } from '@/lib/db'
import { Marker, Map } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const map = queryOne<Map>('SELECT id FROM maps WHERE code = ?', [code])

    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Map not found',
        },
        { status: 404 }
      )
    }

    const markers = queryMany<Marker>(
      'SELECT * FROM markers WHERE map_id = ? AND active = 1 AND published = 1 ORDER BY name',
      [map.id]
    )

    return NextResponse.json({
      success: true,
      data: markers,
    })
  } catch (error) {
    console.error('Error fetching markers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch markers',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()

    const map = queryOne<Map>('SELECT id FROM maps WHERE code = ?', [code])

    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Map not found',
        },
        { status: 404 }
      )
    }

    const {
      name,
      lat,
      lon,
      description,
      category,
      street,
      city,
      postal_code,
      phone,
      website,
      email,
      hours,
      image,
      published = false,
      active = true,
    } = body

    if (!name || lat === undefined || lon === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, lat, and lon are required',
        },
        { status: 400 }
      )
    }

    const insertSql = `
      INSERT INTO markers (map_id, name, lat, lon, description, category, street, city, postal_code, phone, website, email, hours, image, published, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const queryParams = [
      map.id,
      name,
      lat,
      lon,
      description || null,
      category || null,
      street || null,
      city || null,
      postal_code || null,
      phone || null,
      website || null,
      email || null,
      hours || null,
      image || null,
      published ? 1 : 0,
      active ? 1 : 0,
    ]

    execute(insertSql, queryParams)

    // Get the inserted marker (last inserted for this map)
    const marker = queryOne<Marker>('SELECT * FROM markers WHERE map_id = ? ORDER BY id DESC LIMIT 1', [map.id])

    if (!marker) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create marker',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: marker,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating marker:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create marker',
      },
      { status: 500 }
    )
  }
}
