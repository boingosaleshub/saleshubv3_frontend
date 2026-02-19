import { NextResponse } from 'next/server';

// In-memory queue storage (no database required)
// Note: This resets on server restart, which is acceptable for queue management
let queue = [];

const STALE_ENTRY_TTL_MS = 6 * 60 * 1000; // 6 minutes – matches the frontend process timeout

function purgeStaleEntries() {
    const cutoff = Date.now() - STALE_ENTRY_TTL_MS;
    queue = queue.filter(item => new Date(item.joinedAt).getTime() > cutoff);
}

/**
 * GET - Fetch current queue
 */
export async function GET() {
    try {
        purgeStaleEntries();
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

        purgeStaleEntries();

        // Check if user is already in queue
        const existingIndex = queue.findIndex(item => item.userId === userId);

        if (existingIndex !== -1) {
            // User already in queue, return their position
            return NextResponse.json({
                position: existingIndex,
                queue
            });
        }

        // Add new entry to queue
        const newEntry = {
            id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            userName: userName || 'Guest',
            processType: processType || 'Coverage Plot',
            joinedAt: new Date().toISOString(),
            status: 'Waiting'
        };

        queue.push(newEntry);

        // Return position (0-indexed, so last position is length - 1)
        const position = queue.length - 1;

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

        // Remove user from queue
        queue = queue.filter(item => item.userId !== userId);

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

/**
 * PATCH - Update queue entry status (e.g., mark as processing)
 */
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { userId, status } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Find and update the user's queue entry
        const entryIndex = queue.findIndex(item => item.userId === userId);

        if (entryIndex === -1) {
            return NextResponse.json({ error: 'User not found in queue' }, { status: 404 });
        }

        queue[entryIndex].status = status || queue[entryIndex].status;

        return NextResponse.json({
            success: true,
            entry: queue[entryIndex],
            queue
        });

    } catch (error) {
        console.error('Queue PATCH error:', error);
        return NextResponse.json({
            error: 'Failed to update queue entry',
            success: false
        }, { status: 500 });
    }
}
