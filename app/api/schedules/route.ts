import { NextRequest, NextResponse } from 'next/server';
import {
  addSchedule,
  getSchedules,
  removeSchedule,
  updateSchedule,
  getScheduleCount,
  type NotificationSchedule
} from '@/lib/schedule-store';

// Create a new notification schedule
export async function POST(request: NextRequest) {
  try {
    const scheduleData = await request.json();

    // Validate required fields
    if (!scheduleData.subscription || !scheduleData.title || !scheduleData.body) {
      return NextResponse.json(
        { error: 'Missing required fields: subscription, title, body' },
        { status: 400 }
      );
    }

    if (!scheduleData.type || !['one-time', 'recurring'].includes(scheduleData.type)) {
      return NextResponse.json(
        { error: 'Type must be "one-time" or "recurring"' },
        { status: 400 }
      );
    }

    // Validate type-specific fields
    if (scheduleData.type === 'one-time' && !scheduleData.scheduledTime) {
      return NextResponse.json(
        { error: 'scheduledTime is required for one-time notifications' },
        { status: 400 }
      );
    }

    if (scheduleData.type === 'recurring' && !scheduleData.recurringPattern) {
      return NextResponse.json(
        { error: 'recurringPattern is required for recurring notifications' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    const schedule: NotificationSchedule = {
      id: scheduleData.id || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      subscription: scheduleData.subscription,
      type: scheduleData.type,
      title: scheduleData.title,
      body: scheduleData.body,
      scheduledTime: scheduleData.scheduledTime,
      recurringPattern: scheduleData.recurringPattern,
      data: scheduleData.data || {},
      enabled: scheduleData.enabled !== false,
      createdAt: new Date().toISOString(),
    };

    addSchedule(schedule);

    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      schedule: {
        id: schedule.id,
        type: schedule.type,
        title: schedule.title,
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule', details: error.message },
      { status: 500 }
    );
  }
}

// Get all schedules (for the current user's subscription)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      // Filter schedules by subscription endpoint
      const allSchedules = getSchedules();
      const userSchedules = allSchedules.filter(
        s => s.subscription.endpoint === endpoint
      );

      return NextResponse.json({
        schedules: userSchedules,
        count: userSchedules.length,
      });
    } else {
      // Return all schedules (admin view)
      const allSchedules = getSchedules();

      return NextResponse.json({
        schedules: allSchedules.map(s => ({
          id: s.id,
          type: s.type,
          title: s.title,
          enabled: s.enabled,
          createdAt: s.createdAt,
          lastSent: s.lastSent,
        })),
        count: getScheduleCount(),
      });
    }
  } catch (error: any) {
    console.error('❌ Error getting schedules:', error);
    return NextResponse.json(
      { error: 'Failed to get schedules', details: error.message },
      { status: 500 }
    );
  }
}

// Delete a schedule
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const removed = removeSchedule(id);

    if (removed) {
      return NextResponse.json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule', details: error.message },
      { status: 500 }
    );
  }
}

// Update a schedule (enable/disable, modify time, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const updated = updateSchedule(id, updates);

    if (updated) {
      return NextResponse.json({
        success: true,
        message: 'Schedule updated successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule', details: error.message },
      { status: 500 }
    );
  }
}
