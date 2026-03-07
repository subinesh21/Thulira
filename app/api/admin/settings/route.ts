import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    // Require admin authentication
    const adminCheck = await requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    await connectDB();

    try {
        let settings = await Settings.findOne();

        // If no settings document exists, create a default one
        if (!settings) {
            settings = await Settings.create({});
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    // Require admin authentication
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    await connectDB();

    try {
        const updates = await req.json();

        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings(updates);
        } else {
            // Deep merge updates or just replace fields
            Object.assign(settings, updates);
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
    }
}
