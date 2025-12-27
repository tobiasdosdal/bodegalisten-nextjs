'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { DataTable } from '@/components/admin/DataTable'
import { BarForm } from '@/components/admin/BarForm'
import { Plus, ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

interface Bar {
  _id: Id<'bars'>
  name: string
  street?: string
  city?: string
  postalCode?: string
  lat: number
  lon: number
  phone?: string
  website?: string
  hours?: string
  description?: string
  category?: string
  active?: boolean
}

export default function BarsPage() {
  const bars = useQuery(api.bars.listAll)
  const removeBar = useMutation(api.bars.remove)

  const [editingBar, setEditingBar] = useState<Bar | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const isLoading = bars === undefined

  const handleDelete = async (bar: Bar) => {
    if (!confirm(`Er du sikker på at du vil deaktivere "${bar.name}"?`)) {
      return
    }

    setIsDeleting(bar._id)
    try {
      await removeBar({ id: bar._id })
    } catch (error) {
      console.error('Error deleting bar:', error)
      alert('Kunne ikke deaktivere bar')
    } finally {
      setIsDeleting(null)
    }
  }

  const columns: ColumnDef<Bar>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Navn
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const category = row.getValue('category') as string | undefined
        return category ? (
          <span className="text-gray-300">{category}</span>
        ) : (
          <span className="text-gray-500">—</span>
        )
      },
    },
    {
      accessorKey: 'city',
      header: 'By',
      cell: ({ row }) => {
        const city = row.getValue('city') as string | undefined
        return city ? (
          <span className="text-gray-300">{city}</span>
        ) : (
          <span className="text-gray-500">—</span>
        )
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('active') !== false
        return (
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${
              isActive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {isActive ? 'Aktiv' : 'Inaktiv'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Handlinger',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingBar(row.original)
              setShowForm(true)
            }}
            className="p-2 rounded-lg hover:bg-white/[0.1] transition-colors"
            title="Rediger"
          >
            <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            disabled={isDeleting === row.original._id}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
            title="Deaktiver"
          >
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-bodega-rounded">Barer</h1>
          <p className="text-gray-400">Administrer alle barer i Bodegalisten</p>
        </div>
        <button
          onClick={() => {
            setEditingBar(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-bodega-accent text-white font-medium rounded-xl hover:bg-bodega-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tilføj Bar
        </button>
      </div>

      <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
        <DataTable
          columns={columns}
          data={bars || []}
          searchKey="name"
          searchPlaceholder="Søg barer..."
          isLoading={isLoading}
        />
      </div>

      {showForm && (
        <BarForm
          bar={editingBar || undefined}
          onSuccess={() => {
            setShowForm(false)
            setEditingBar(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingBar(null)
          }}
        />
      )}
    </div>
  )
}
