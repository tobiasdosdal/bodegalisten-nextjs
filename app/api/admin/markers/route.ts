import { NextRequest, NextResponse } from 'next/server'
import { queryMany, queryOne, execute } from '@/lib/db'
import { Marker } from '@/types'
import { auth } from '@clerk/nextjs/server'

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Marker ID is required' },
        { status: 400 }
      )
    }

    // Check if marker exists
    const existingMarker = queryOne<Marker>('SELECT * FROM markers WHERE id = ?', [id])
    if (!existingMarker) {
      return NextResponse.json(
        { success: false, error: 'Marker not found' },
        { status: 404 }
      )
    }

    const updateFields: string[] = []
    const values: unknown[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'active' || key === 'published') {
        updateFields.push(`${key} = ?`)
        values.push(value ? 1 : 0)
      } else if (key !== 'id') {
        updateFields.push(`${key} = ?`)
        values.push(value)
      }
    })

    updateFields.push(`updated_at = ?`)
    values.push(new Date().toISOString())

    values.push(id)

    const sql = `UPDATE markers SET ${updateFields.join(', ')} WHERE id = ?`
    queryMany<Marker>(sql, values)

    const marker = queryOne<Marker>('SELECT * FROM markers WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      data: marker,
    })
  } catch (error) {
    console.error('Error updating marker:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update marker',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Marker ID is required' },
        { status: 400 }
      )
    }

    // Check if marker exists
    const marker = queryOne<Marker>('SELECT * FROM markers WHERE id = ?', [id])
    if (!marker) {
      return NextResponse.json(
        { success: false, error: 'Marker not found' },
        { status: 404 }
      )
    }

    execute('DELETE FROM markers WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Marker deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting marker:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete marker',
      },
      { status: 500 }
    )
  }
}
