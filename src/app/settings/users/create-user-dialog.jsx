'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createUser } from "@/actions/user-actions"
import { Plus } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export function CreateUserDialog({ onUserCreated }) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const result = await createUser(formData)

        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else if (result.warning) {
            toast.warning(result.warning, {
                duration: 20000, // Give them 20 seconds to copy the link
                action: result.recoveryLink ? {
                    label: 'Copy Link',
                    onClick: () => {
                        navigator.clipboard.writeText(result.recoveryLink)
                        toast.success('Link copied to clipboard')
                    }
                } : undefined
            })
            setOpen(false)
            e.target.reset()
            onUserCreated()
        } else {
            toast.success(
                result.emailSent
                    ? 'User created successfully. Password setup email sent.'
                    : 'User created successfully.'
            )
            setOpen(false)
            e.target.reset() // Reset form after successful creation
            onUserCreated()
        }
    }

    // Reset form when dialog opens
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Form will be reset when dialog closes
            const form = document.getElementById('create-user-form')
            if (form) form.reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-[#E41F26] hover:bg-[#B5121B] text-white">
                    <Plus className="mr-2 h-4 w-4" /> {t("addUser")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("addNewUser")}</DialogTitle>
                    <DialogDescription>
                        {t("createUserDesc")}
                    </DialogDescription>
                </DialogHeader>
                <form id="create-user-form" onSubmit={handleSubmit} className="grid gap-4 py-4" autoComplete="off">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            {t("name")}
                        </Label>
                        <Input id="name" name="name" className="col-span-3" required autoComplete="off" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            {t("email")}
                        </Label>
                        <Input id="email" name="email" type="email" className="col-span-3" required autoComplete="off" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            {t("role")}
                        </Label>
                        <Select name="role" defaultValue="User">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t("selectRole")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="User">{t("userRole")}</SelectItem>
                                <SelectItem value="Admin">{t("adminRole")}</SelectItem>
                                <SelectItem value="Super Admin">{t("superAdminRole")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("creating") : t("createUser")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
