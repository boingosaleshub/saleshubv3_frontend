import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// Table name for the automation queue
const QUEUE_TABLE = 'automation_queue';

/**
 * GET - Fetch current queue
 */
export async function GET() {
    try {
        const supabase = createAdminClient();
        
        // Fetch all active queue entries, ordered by join time
        const { data, error } = await supabase
            .from(QUEUE_TABLE)
            .select('*')
            .order('joined_at', { ascending: true });
        
        if (error) {
            // If table doesn't exist, return empty queue with helpful message
            if (error.code === '42P01') {
                console.error('Queue table does not exist. Please create it in Supabase.');
                return NextResponse.json({
                    queue: [],
                    error: 'Queue table not configured'
                });
            }
            throw error;
        }
        
        // Map database fields to expected format
        const queue = (data || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            processType: item.process_type,
            joinedAt: item.joined_at,
            status: item.status
        }));
        
        return NextResponse.json({ queue });
        
    } catch (error) {
        console.error('Queue GET error:', error);
        return NextResponse.json({ 
            queue: [],
            error: 'Failed to fetch queue' 
        }, { status: 500 });
    }
}

/**
 * POST - Join the queue
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, userName, processType } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        
        // Check if user is already in queue
        const { data: existing } = await supabase
            .from(QUEUE_TABLE)
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (existing) {
            // User already in queue, return their position
            const { data: allEntries } = await supabase
                .from(QUEUE_TABLE)
                .select('*')
                .order('joined_at', { ascending: true });
            
            const position = (allEntries || []).findIndex(item => item.user_id === userId);
            const queue = (allEntries || []).map(item => ({
                id: item.id,
                userId: item.user_id,
                userName: item.user_name,
                processType: item.process_type,
                joinedAt: item.joined_at,
                status: item.status
            }));
            
            return NextResponse.json({ position, queue });
        }
        
        // Add new entry to queue
        const { error: insertError } = await supabase
            .from(QUEUE_TABLE)
            .insert({
                user_id: userId,
                user_name: userName || 'Guest',
                process_type: processType || 'Coverage Plot',
                joined_at: new Date().toISOString(),
                status: 'Waiting'
            });
        
        if (insertError) {
            // If table doesn't exist, provide helpful error
            if (insertError.code === '42P01') {
                console.error('Queue table does not exist. Please create it in Supabase.');
                return NextResponse.json({ 
                    error: 'Queue table not configured. Please run the migration.',
                    position: 0,
                    queue: []
                }, { status: 500 });
            }
            throw insertError;
        }
        
        // Fetch updated queue and return position
        const { data: allEntries } = await supabase
            .from(QUEUE_TABLE)
            .select('*')
            .order('joined_at', { ascending: true });
        
        const position = (allEntries || []).findIndex(item => item.user_id === userId);
        const queue = (allEntries || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            processType: item.process_type,
            joinedAt: item.joined_at,
            status: item.status
        }));
        
        return NextResponse.json({ position, queue });

    } catch (error) {
        console.error('Queue POST error:', error);
        return NextResponse.json({ 
            error: 'Failed to join queue',
            position: 0,
            queue: []
        }, { status: 500 });
    }
}

/**
 * DELETE - Leave the queue
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const supabase = createAdminClient();
        
        // Remove user from queue
        const { error: deleteError } = await supabase
            .from(QUEUE_TABLE)
            .delete()
            .eq('user_id', userId);
        
        if (deleteError && deleteError.code !== '42P01') {
            throw deleteError;
        }
        
        // Fetch remaining queue
        const { data: allEntries } = await supabase
            .from(QUEUE_TABLE)
            .select('*')
            .order('joined_at', { ascending: true });
        
        const queue = (allEntries || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            userName: item.user_name,
            processType: item.process_type,
            joinedAt: item.joined_at,
            status: item.status
        }));

        return NextResponse.json({ success: true, queue });

    } catch (error) {
        console.error('Queue DELETE error:', error);
        return NextResponse.json({ 
            error: 'Failed to leave queue',
            success: false,
            queue: []
        }, { status: 500 });
    }
}
