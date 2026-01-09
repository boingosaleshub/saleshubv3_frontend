'use client'

import { useState } from 'react'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2, Pencil, Calendar } from 'lucide-react'
import { DeleteUserDialog } from './delete-user-dialog'
import { EditUserDialog } from './edit-user-dialog'
import { deleteUser } from '@/actions/user-actions'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

export function UserTable({ users, onRefresh }) {
    const { t } = useLanguage()

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
            <Card className='overflow-hidden rounded-xl border bg-white dark:bg-[#1a1d21] dark:border-gray-800 shadow-lg'>
                <Table>
                    <TableHeader className='bg-gray-50/50 dark:bg-gray-900/50'>
                        <TableRow className='hover:bg-transparent border-gray-100 dark:border-gray-800'>
                            <TableHead className="pl-6 py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">{t("name")}</TableHead>
                            <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">{t("role")}</TableHead>
                            <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold text-muted-foreground">{t("joined")}</TableHead>
                            <TableHead className='text-right py-4 pr-6 uppercase tracking-wider text-xs font-semibold text-muted-foreground'>{t("actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    {t("noUsersFound")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map(user => (
                                <TableRow 
                                    key={user.id} 
                                    className='group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors'
                                >
                                    <TableCell className='pl-6 py-4'>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                                                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-medium text-xs">
                                                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className='font-semibold text-sm text-gray-900 dark:text-gray-100'>
                                                    {user.name || 'N/A'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge 
                                            variant={user.role === 'admin' || user.role === 'owner' ? 'default' : 'secondary'}
                                            className={`
                                                ${user.role === 'admin' || user.role === 'owner' 
                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 border-0' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'} 
                                                capitalize font-medium px-2.5 py-0.5 shadow-none
                                            `}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='text-right pr-6 py-4'>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                                                onClick={() => setUserToEdit(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-gray-900 dark:text-gray-100 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
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
                    <TableFooter className='bg-transparent border-t border-gray-100 dark:border-gray-800'>
                        <TableRow className='hover:bg-transparent'>
                            <TableCell colSpan={3} className="pl-6 py-4 font-medium text-muted-foreground">{t("totalUsers")}</TableCell>
                            <TableCell className='text-right pr-6 py-4 font-bold text-gray-900 dark:text-gray-100'>{users.length}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Card>

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
