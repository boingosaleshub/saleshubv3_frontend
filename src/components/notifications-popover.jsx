import React, { useEffect, useState, useCallback, useRef } from "react";
import { Mail, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function NotificationsPopover() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [open, setOpen] = useState(false);

    const prevUnreadCountRef = useRef(0);
    const initialLoadRef = useRef(true);

    const isAdmin = ["Admin", "Super Admin"].includes(user?.app_metadata?.role) || ["Admin", "Super Admin"].includes(user?.user_metadata?.role);

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;
        try {
            const supabase = createClient();

            // Note: Since we don't have direct DB access, we will query rom_proposals 
            // and simulate notifications on the fly if a real notifications table fails or is missing.
            // But ideally, we query a proper `notifications` table.
            // Let's rely on `rom_proposals` to generate notifications dynamically to avoid breaking the app if the user hasn't run the SQL yet!

            // For Admins: Show pending ROMs as "X has made a ROM Generation process"
            // For Users: We can't easily show "X has accepted" without tracking it. 
            // So we'll try to fetch from a `notifications` table, fallback to empty if it doesn't exist.

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            let realNotifications = [];
            if (!error && data) {
                realNotifications = data;
            }

            let simulatedNotifications = [];

            if (isAdmin) {
                // For Admins, always show Pending ROM requests as action-required notifications
                const { data: proposals, error: propError } = await supabase
                    .from('rom_proposals')
                    .select('id, user_id, venue_name, created_at')
                    .eq('approval_status', 'Pending')
                    .order('created_at', { ascending: false });

                if (!propError && proposals) {
                    const userIds = [...new Set(proposals.map(p => p.user_id))];
                    let usersMap = {};
                    if (userIds.length > 0) {
                        const { data: usersData } = await supabase
                            .from('Users')
                            .select('id, name')
                            .in('id', userIds);
                        if (usersData) {
                            usersData.forEach(u => usersMap[u.id] = u.name);
                        }
                    }

                    simulatedNotifications = proposals.map(p => ({
                        id: `sim_admin_${p.id}`,
                        rom_id: p.id,
                        type: 'ROM_REQUEST',
                        message: `${usersMap[p.user_id] || 'A user'} has made a ROM Generation process for ${p.venue_name}`,
                        is_read: false,
                        created_at: p.created_at
                    }));
                }
            } else if (error) {
                // If user is not admin and 'notifications' table schema is missing, fallback to simulated
                const { data: proposals, error: propError } = await supabase
                    .from('rom_proposals')
                    .select('id, venue_name, approval_status, updated_at')
                    .eq('user_id', user.id)
                    .in('approval_status', ['Approved', 'Rejected'])
                    .order('updated_at', { ascending: false })
                    .limit(10);

                if (!propError && proposals) {
                    simulatedNotifications = proposals.map(p => ({
                        id: `sim_user_${p.id}_${p.approval_status}`,
                        rom_id: p.id,
                        type: p.approval_status === 'Approved' ? 'ROM_ACCEPTED' : 'ROM_REJECTED',
                        message: `An Admin has ${p.approval_status.toLowerCase()} your ROM Request for ${p.venue_name}`,
                        is_read: false,
                        created_at: p.updated_at
                    }));
                }
            }

            // Combine and sort
            const allNotifications = [...realNotifications, ...simulatedNotifications];
            allNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setNotifications(allNotifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const playNotificationSound = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // Resume context if suspended (browsers block autoplay without interaction)
            if (ctx.state === 'suspended') {
                ctx.resume().catch(e => console.log("AudioContext resume failed:", e));
            }

            // Oscillator for a "ting" sound
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6

            // Envelope
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Failed to play notification sound", e);
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const supabase = createClient();

        let channel;
        try {
            channel = supabase.channel('notifications-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
                    fetchNotifications();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'rom_proposals' }, () => {
                    fetchNotifications();
                })
                .subscribe();
        } catch (e) {
            console.error("Realtime subscription error", e);
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [user?.id, fetchNotifications]);

    // Robust trigger for sound and toasts:
    // If unread count increases after initial load, a new notification arrived
    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.is_read).length;

        if (initialLoadRef.current) {
            if (!loading) {
                initialLoadRef.current = false;
                prevUnreadCountRef.current = unreadCount;
            }
            return;
        }

        if (unreadCount > prevUnreadCountRef.current && notifications.length > 0) {
            playNotificationSound();
            const newest = notifications.find(n => !n.is_read);
            if (newest) {
                toast(newest.message || "New notification", {
                    description: "Just now",
                    action: {
                        label: 'View',
                        onClick: () => setOpen(true)
                    }
                });
            }
        }
        prevUnreadCountRef.current = unreadCount;
    }, [notifications, loading, playNotificationSound]);

    const handleMarkAsRead = async (id, isSimulated = false) => {
        if (isSimulated) return; // Can't mark fallback notifications as read
        try {
            const supabase = createClient();
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const supabase = createClient();
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    }

    const handleAction = async (notification, action) => {
        setProcessingId(notification.id);
        try {
            const supabase = createClient();
            const newStatus = action === 'approve' ? 'Approved' : 'Rejected';

            // 1. Update ROM proposal
            const { error: updateError } = await supabase
                .from('rom_proposals')
                .update({ approval_status: newStatus })
                .eq('id', notification.rom_id);

            if (updateError) throw updateError;

            // 2. Mark this notification as read if it's a real one
            if (!notification.id.startsWith('sim_')) {
                await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
            }

            // 3. Create a notification for the user who made the proposal
            // We need to fetch the proposal's user_id
            const { data: proposalData } = await supabase.from('rom_proposals').select('user_id, venue_name').eq('id', notification.rom_id).single();

            if (proposalData) {
                const adminName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Admin";
                await supabase.from('notifications').insert({
                    user_id: proposalData.user_id,
                    actor_id: user.id,
                    actor_name: adminName,
                    rom_id: notification.rom_id,
                    type: action === 'approve' ? 'ROM_ACCEPTED' : 'ROM_REJECTED',
                    message: `${adminName} has ${newStatus.toLowerCase()} your ROM Request for ${proposalData.venue_name}`,
                });
            }

            toast.success(`ROM Proposal ${newStatus.toLowerCase()} successfully`);
            fetchNotifications();

        } catch (err) {
            console.error("Error processing action:", err);
            toast.error("Failed to process proposal action.");
        } finally {
            setProcessingId(null);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Facebook style 9+
    const displayCount = unreadCount > 9 ? "9+" : unreadCount;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Mail className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                            {displayCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden" forceMount>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50 dark:bg-zinc-900/50">
                    <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-transparent" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-1">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Mail className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm font-medium text-gray-500">No notifications</p>
                            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex flex-col gap-2 p-3 my-1 rounded-md transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 outline-none ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                onClick={() => {
                                    if (!notification.is_read && !notification.id.startsWith('sim_')) {
                                        handleMarkAsRead(notification.id);
                                    }
                                    if (notification.type === 'ROM_REQUEST') {
                                        setOpen(false);
                                        router.push(`/all-roms/${notification.rom_id}`);
                                    } else {
                                        setOpen(false);
                                        router.push(`/my-roms`);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm tracking-tight leading-snug ${!notification.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.created_at).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Compact Accept/Reject buttons for Admins directly on the notification */}
                                {notification.type === 'ROM_REQUEST' && (
                                    <div className="flex items-center gap-2 mt-2 ml-7">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                                            disabled={processingId === notification.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(notification, 'approve');
                                            }}
                                        >
                                            {processingId === notification.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Accept'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                            disabled={processingId === notification.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(notification, 'reject');
                                            }}
                                        >
                                            {processingId === notification.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Reject'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
