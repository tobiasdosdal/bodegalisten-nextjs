import { NextRequest, NextResponse } from 'next/server'
import { queryOne, queryMany, execute } from '@/lib/db'
import { Map } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const map = queryOne<Map>('SELECT * FROM maps WHERE code = ?', [code])

    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Map not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: map,
    })
  } catch (error) {
    console.error('Error fetching map:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch map',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()

    const {
      name,
      description,
      friendly_url,
      meta_title,
      meta_description,
      meta_image,
      background_image,
      logo,
      active,
      pwa_enable,
      language,
      languages_enabled,
      show_in_first_page,
    } = body

    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = ?`)
      values.push(name)
      paramIndex++
    }
    if (description !== undefined) {
      updates.push(`description = ?`)
      values.push(description)
      paramIndex++
    }
    if (friendly_url !== undefined) {
      updates.push(`friendly_url = ?`)
      values.push(friendly_url)
      paramIndex++
    }
    if (meta_title !== undefined) {
      updates.push(`meta_title = ?`)
      values.push(meta_title)
      paramIndex++
    }
    if (meta_description !== undefined) {
      updates.push(`meta_description = ?`)
      values.push(meta_description)
      paramIndex++
    }
    if (meta_image !== undefined) {
      updates.push(`meta_image = ?`)
      values.push(meta_image)
      paramIndex++
    }
    if (background_image !== undefined) {
      updates.push(`background_image = ?`)
      values.push(background_image)
      paramIndex++
    }
    if (logo !== undefined) {
      updates.push(`logo = ?`)
      values.push(logo)
      paramIndex++
    }
    if (active !== undefined) {
      updates.push(`active = ?`)
      values.push(active ? 1 : 0)
      paramIndex++
    }
    if (pwa_enable !== undefined) {
      updates.push(`pwa_enable = ?`)
      values.push(pwa_enable ? 1 : 0)
      paramIndex++
    }
    if (language !== undefined) {
      updates.push(`language = ?`)
      values.push(language)
      paramIndex++
    }
    if (languages_enabled !== undefined) {
      updates.push(`languages_enabled = ?`)
      values.push(JSON.stringify(languages_enabled))
      paramIndex++
    }
    if (show_in_first_page !== undefined) {
      updates.push(`show_in_first_page = ?`)
      values.push(show_in_first_page ? 1 : 0)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      )
    }

    updates.push(`updated_at = ?`)
    values.push(new Date().toISOString())
    paramIndex++

    values.push(code)

    const sql = `UPDATE maps SET ${updates.join(', ')} WHERE code = ?`
    queryMany<Map>(sql, values)

    const map = queryOne<Map>('SELECT * FROM maps WHERE code = ?', [code])

    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Map not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: map,
    })
  } catch (error) {
    console.error('Error updating map:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update map',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // Check if map exists first
    const map = queryOne<Map>('SELECT * FROM maps WHERE code = ?', [code])
    if (!map) {
      return NextResponse.json(
        {
          success: false,
          error: 'Map not found',
        },
        { status: 404 }
      )
    }

    execute('DELETE FROM maps WHERE code = ?', [code])

    return NextResponse.json({
      success: true,
      message: 'Map deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting map:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete map',
      },
      { status: 500 }
    )
  }
}
