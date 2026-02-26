-- Run this script in your Supabase SQL editor to enable persistent notifications
-- Or you can rely on the dynamic fallback implementation which is already working based on rom_proposals

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public."Users"(id) ON DELETE CASCADE,
    actor_name TEXT,
    rom_id UUID REFERENCES public.rom_proposals(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);
    
-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
