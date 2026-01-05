import { NextResponse } from 'next/server';

// In-memory queue storage (Global scope to persist across hot reloads in dev, 
// though production serverless might reset this depending on deployment)
if (!globalThis.automationQueue) {
    globalThis.automationQueue = [];
}

export async function GET() {
    return NextResponse.json({
        queue: globalThis.automationQueue
    });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, userName, processType } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if user is already in queue
        const existingIndex = globalThis.automationQueue.findIndex(item => item.userId === userId);

        if (existingIndex === -1) {
            // Add to queue
            globalThis.automationQueue.push({
                userId,
                userName: userName || 'Guest',
                processType: processType || 'Coverage Plot',
                joinedAt: new Date().toISOString(),
                status: 'Waiting'
            });
        }

        // Return current position
        // If just added, they are at the end.
        // Index 0 means "Processing" / "It's your turn"
        const position = existingIndex === -1 ? globalThis.automationQueue.length - 1 : existingIndex;

        return NextResponse.json({
            position,
            queue: globalThis.automationQueue
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Remove user from queue
        globalThis.automationQueue = globalThis.automationQueue.filter(item => item.userId !== userId);

        return NextResponse.json({
            success: true,
            queue: globalThis.automationQueue
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
