'use client'

import { useId, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { DeleteUserDialog } from './delete-user-dialog'
import { EditUserDialog } from './edit-user-dialog'
import { deleteUser } from '@/actions/user-actions'
import { toast } from 'sonner'

export function UserTable({ users, onRefresh }) {
    const id = useId()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [userToDelete, setUserToDelete] = useState(null)
    const [userToEdit, setUserToEdit] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!userToDelete) return

        setIsDeleting(true)
        const result = await deleteUser(userToDelete.id)
        setIsDeleting(false)
        setUserToDelete(null)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('User deleted successfully')
            onRefresh()
        }
    }

    return (
        <div className='w-full'>
            <div className='overflow-hidden rounded-md border bg-white dark:bg-zinc-900'>
                <Table>
                    <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                            <TableHead className="w-[50px]">
                                <Checkbox id={id} aria-label='select-all' />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className='text-right'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map(user => (
                                <TableRow key={user.id} className='has-data-[state=checked]:bg-muted/50'>
                                    <TableCell>
                                        <Checkbox id={`table-checkbox-${user.id}`} aria-label={`user-checkbox-${user.id}`} />
                                    </TableCell>
                                    <TableCell className='font-medium'>{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="capitalize">{user.role}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className='text-right'>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => setUserToEdit(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => setUserToDelete(user)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter className='bg-transparent'>
                        <TableRow className='hover:bg-transparent'>
                            <TableCell colSpan={5}>Total Users</TableCell>
                            <TableCell className='text-right'>{users.length}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>

            <DeleteUserDialog
                open={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />

            <EditUserDialog
                user={userToEdit}
                open={!!userToEdit}
                onOpenChange={(open) => !open && setUserToEdit(null)}
                onUserUpdated={onRefresh}
            />
        </div>
    )
}
