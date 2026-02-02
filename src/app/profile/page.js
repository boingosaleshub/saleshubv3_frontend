"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/components/providers/language-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    User,
    Mail,
    Shield,
    Pencil,
    UserCircle,
    Lock,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle
} from "lucide-react";
import { updateProfile, changePassword } from "./actions";

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const { t } = useLanguage();

    // Initial State derived from store
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password Section State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: "", new: "" });
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    // Password Visibility State
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: ""
    });

    // Populate form data when user is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.user_metadata?.name || user.email?.split("@")[0] || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
    const userEmail = user?.email || "No email";
    const userRole = user?.app_metadata?.role || "User";

    const handleStartEditing = () => {
        setIsEditing(true);
        if (user) {
            setFormData({
                name: user.user_metadata?.name || user.email?.split("@")[0] || "",
                email: user.email || ""
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.user_metadata?.name || user.email?.split("@")[0] || "",
                email: user.email || ""
            });
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateProfile(formData);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Profile updated successfully");

            if (user) {
                setUser({
                    ...user,
                    email: formData.email,
                    user_metadata: {
                        ...user.user_metadata,
                        name: formData.name
                    }
                });
            }

            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    // Password Handlers
    const handlePasswordDiscard = () => {
        setShowPasswordForm(false);
        setPasswordData({ current: "", new: "" });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
    };

    const handlePasswordSaveClick = () => {
        if (!passwordData.current) {
            toast.error("Please enter your current password");
            return;
        }
        if (!passwordData.new) {
            toast.error("Please enter a new password");
            return;
        }
        if (passwordData.current === passwordData.new) {
            toast.error("New password cannot be the same as the current password");
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }
        setShowPasswordConfirm(true);
    };

    const handleConfirmPasswordChange = async () => {
        setIsPasswordSaving(true);
        try {
            const result = await changePassword(passwordData.current, passwordData.new);

            if (result.error) {
                toast.error(result.error);
                setShowPasswordConfirm(false); // keep form open to retry
                return;
            }

            toast.success("Password changed successfully");
            handlePasswordDiscard(); // Close form
            setShowPasswordConfirm(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to change password");
        } finally {
            setIsPasswordSaving(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#3D434A] to-[#4a5058] dark:from-[#3D434A] dark:to-[#4a5058] py-8 px-6 border-b-4 border-red-600 rounded-t-2xl mx-4 mt-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg ring-4 ring-white/20">
                            <span className="text-2xl font-bold text-white">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-900"></div>
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {t("profile") || "Profile"}
                        </h2>
                        <p className="text-gray-300 text-sm mt-1">
                            Manage your account information
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mx-4 py-6 space-y-6">
                {/* Profile Information Card */}
                <Card className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-[#E41F26]" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Account Information
                                </h3>
                            </div>
                            {!isEditing && (
                                <Button
                                    onClick={handleStartEditing}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-[#E41F26]"
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* Profile Fields */}
                        <div className="p-6 space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <Input
                                    value={isEditing ? formData.name : userName}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`max-w-md transition-colors ${!isEditing ? "bg-gray-50 dark:bg-zinc-800/50 border-transparent" : "bg-white dark:bg-zinc-950"}`}
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <Input
                                    value={isEditing ? formData.email : userEmail}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    readOnly={!isEditing}
                                    className={`max-w-md transition-colors ${!isEditing ? "bg-gray-50 dark:bg-zinc-800/50 border-transparent" : "bg-white dark:bg-zinc-950"}`}
                                />
                            </div>

                            {/* Update Profile Actions */}
                            {isEditing && (
                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="bg-[#E41F26] hover:bg-red-700 text-white"
                                    >
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        disabled={isLoading}
                                    >
                                        Discard
                                    </Button>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="relative pt-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white dark:bg-zinc-900/80 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Access Level
                                    </span>
                                </div>
                            </div>

                            {/* Role Field */}
                            <div className="relative bg-gradient-to-r from-[#E41F26]/5 to-transparent dark:from-[#E41F26]/10 dark:to-transparent rounded-xl p-4 border border-[#E41F26]/20">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#E41F26] to-red-700 shadow-sm">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Role
                                        </label>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-sm font-semibold bg-[#E41F26]/10 text-[#E41F26] border border-[#E41F26]/30 px-3 py-1 shadow-sm"
                                            >
                                                {userRole}
                                            </Badge>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Assigned by administrator
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Section */}
                            <div className="flex flex-col items-start gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="pb-1 text-sm font-medium text-gray-500 hover:text-[#E41F26] dark:text-gray-400 dark:hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <Lock className="h-4 w-4" />
                                    {showPasswordForm ? "Hide Password Form" : "Change Password"}
                                </button>

                                {/* Password Change Form */}
                                {showPasswordForm && (
                                    <div className="w-full space-y-4 pl-0 md:pl-6 animate-in fade-in slide-in-from-top-2 duration-200 border-l-2 border-gray-100 dark:border-zinc-800 ml-1">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Current Password
                                            </label>
                                            <div className="relative max-w-md">
                                                <Input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="Enter current password"
                                                    value={passwordData.current}
                                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                    className="bg-white dark:bg-zinc-950 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                New Password
                                            </label>
                                            <div className="relative max-w-md">
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    className="bg-white dark:bg-zinc-950 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                onClick={handlePasswordSaveClick}
                                                className="bg-[#E41F26] hover:bg-red-700 text-white"
                                            >
                                                Save Password
                                            </Button>
                                            <Button
                                                onClick={handlePasswordDiscard}
                                                variant="outline"
                                            >
                                                Discard
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Password Confirmation Alert Dialog */}
            <AlertDialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure about changing your Password?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You will need to use your new password next time you log in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowPasswordConfirm(false)}>No</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmPasswordChange();
                            }}
                            className="bg-[#E41F26] hover:bg-red-700 text-white"
                            disabled={isPasswordSaving}
                        >
                            {isPasswordSaving ? "Saving..." : "Yes"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
