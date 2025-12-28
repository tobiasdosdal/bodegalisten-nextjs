import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import { handleApiError } from '@/lib/api-error-handler'
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
    return handleApiError(error, 'Failed to fetch map')
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

    if (name !== undefined) {
      updates.push(`name = ?`)
      values.push(name)
    }
    if (description !== undefined) {
      updates.push(`description = ?`)
      values.push(description)
    }
    if (friendly_url !== undefined) {
      updates.push(`friendly_url = ?`)
      values.push(friendly_url)
    }
    if (meta_title !== undefined) {
      updates.push(`meta_title = ?`)
      values.push(meta_title)
    }
    if (meta_description !== undefined) {
      updates.push(`meta_description = ?`)
      values.push(meta_description)
    }
    if (meta_image !== undefined) {
      updates.push(`meta_image = ?`)
      values.push(meta_image)
    }
    if (background_image !== undefined) {
      updates.push(`background_image = ?`)
      values.push(background_image)
    }
    if (logo !== undefined) {
      updates.push(`logo = ?`)
      values.push(logo)
    }
    if (active !== undefined) {
      updates.push(`active = ?`)
      values.push(active ? 1 : 0)
    }
    if (pwa_enable !== undefined) {
      updates.push(`pwa_enable = ?`)
      values.push(pwa_enable ? 1 : 0)
    }
    if (language !== undefined) {
      updates.push(`language = ?`)
      values.push(language)
    }
    if (languages_enabled !== undefined) {
      updates.push(`languages_enabled = ?`)
      values.push(JSON.stringify(languages_enabled))
    }
    if (show_in_first_page !== undefined) {
      updates.push(`show_in_first_page = ?`)
      values.push(show_in_first_page ? 1 : 0)
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
    values.push(code)

    const sql = `UPDATE maps SET ${updates.join(', ')} WHERE code = ?`
    execute(sql, values)

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
    return handleApiError(error, 'Failed to update map')
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
    return handleApiError(error, 'Failed to delete map')
  }
}
