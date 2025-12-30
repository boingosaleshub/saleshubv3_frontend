'use client'

import { useEffect, useState } from 'react'
import { getUsers } from '@/actions/user-actions'
import { UserTable } from './user-table'
import { CreateUserDialog } from './create-user-dialog'
import { toast } from 'sonner'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setLoading(true)
        const result = await getUsers()
        if (result.error) {
            toast.error(result.error)
        } else {
            setUsers(result.data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">System Users</h1>
                <CreateUserDialog onUserCreated={fetchUsers} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <UserTable users={users} onRefresh={fetchUsers} />
            )}
        </div>
    )
}
