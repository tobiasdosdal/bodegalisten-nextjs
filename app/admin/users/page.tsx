'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { Users, ExternalLink, ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
}

function formatDate(timestamp: number | null): string {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        })

        // Check if redirected (means not authenticated)
        if (response.redirected) {
          throw new Error('Du skal være logget ind')
        }

        const text = await response.text()
        console.log('API Response:', response.status, text)

        if (!response.ok) {
          let errorMessage = 'Failed to fetch users'
          try {
            const errorData = JSON.parse(text)
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
          throw new Error(errorMessage)
        }

        const data = JSON.parse(text)
        setUsers(data.users)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err instanceof Error ? err.message : 'Kunne ikke hente brugere')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'Bruger',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bodega-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-bodega-accent" />
            </div>
          )}
          <div>
            <p className="font-medium text-white">
              {row.original.firstName || row.original.lastName
                ? `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim()
                : 'Unavngivet'}
            </p>
            <p className="text-sm text-gray-400">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Oprettet
          <ArrowUpDown className="w-4 h-4" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-400">{formatDate(row.getValue('createdAt'))}</span>
      ),
    },
    {
      accessorKey: 'lastSignInAt',
      header: 'Sidst Logget Ind',
      cell: ({ row }) => (
        <span className="text-gray-400">{formatDate(row.getValue('lastSignInAt'))}</span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-bodega-rounded">Brugere</h1>
          <p className="text-gray-400">Administrer brugere via Clerk</p>
        </div>
        <a
          href="https://dashboard.clerk.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] text-white font-medium rounded-xl hover:bg-white/[0.1] transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Clerk Dashboard
        </a>
      </div>

      {/* Stats */}
      <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06] mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-bodega-primary rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Brugere</p>
            <p className="text-3xl font-bold text-white">
              {isLoading ? '...' : users.length}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-bodega-surface rounded-2xl p-6 border border-white/[0.06]">
          <DataTable
            columns={columns}
            data={users}
            searchKey="email"
            searchPlaceholder="Søg efter email..."
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
