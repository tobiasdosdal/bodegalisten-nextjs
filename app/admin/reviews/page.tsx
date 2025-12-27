'use client'

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { DataTable } from '@/components/admin/DataTable'
import { Star, Trash2, ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

interface Review {
  _id: Id<'reviews'>
  barId: Id<'bars'>
  barName: string
  rating: number
  comment?: string
  smoking?: number
  priceLevel?: string
  userId?: string
  userName?: string
  createdAt: number
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-bodega-accent text-bodega-accent'
              : 'text-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const reviews = useQuery(api.reviews.listAll)
  const removeReview = useMutation(api.reviews.remove)

  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const isLoading = reviews === undefined

  const handleDelete = async (review: Review) => {
    if (!confirm(`Er du sikker på at du vil slette denne anmeldelse?`)) {
      return
    }

    setIsDeleting(review._id)
    try {
      await removeReview({ id: review._id })
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Kunne ikke slette anmeldelse')
    } finally {
      setIsDeleting(null)
    }
  }

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'barName',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Bar
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('barName')}</span>,
    },
    {
      accessorKey: 'rating',
      header: 'Bedømmelse',
      cell: ({ row }) => <StarDisplay rating={row.getValue('rating')} />,
    },
    {
      accessorKey: 'comment',
      header: 'Kommentar',
      cell: ({ row }) => {
        const comment = row.getValue('comment') as string | undefined
        return comment ? (
          <span className="text-gray-300 truncate max-w-[200px] block">{comment}</span>
        ) : (
          <span className="text-gray-500">—</span>
        )
      },
    },
    {
      accessorKey: 'userName',
      header: 'Bruger',
      cell: ({ row }) => {
        const userName = row.getValue('userName') as string | undefined
        return userName ? (
          <span className="text-gray-300">{userName}</span>
        ) : (
          <span className="text-gray-500">Anonym</span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Dato
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-400">{formatDate(row.getValue('createdAt'))}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Handlinger',
      cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original)}
          disabled={isDeleting === row.original._id}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
          title="Slet"
        >
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
        </button>
      ),
    },
  ]

  // Calculate stats
  const totalReviews = reviews?.length || 0
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-bodega-rounded">Anmeldelser</h1>
          <p className="text-gray-400">Administrer alle anmeldelser</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <p className="text-sm font-medium text-gray-400">Total Anmeldelser</p>
          <p className="text-3xl font-bold text-white mt-1">{totalReviews}</p>
        </div>
        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <p className="text-sm font-medium text-gray-400">Gennemsnitlig Bedømmelse</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-3xl font-bold text-white">{avgRating}</p>
            <Star className="w-6 h-6 fill-bodega-accent text-bodega-accent" />
          </div>
        </div>
      </div>

      <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
        <DataTable
          columns={columns}
          data={reviews || []}
          searchKey="barName"
          searchPlaceholder="Søg efter bar..."
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
