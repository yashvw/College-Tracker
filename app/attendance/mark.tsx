"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MarkAttendancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = searchParams?.get('subject') || '';
  const time = searchParams?.get('time') || '';
  const day = searchParams?.get('day') || '';
  const typeParam = searchParams?.get('type') || '';
  const fromNotificationParam = searchParams?.get('fromNotification') === 'true';

  const [valid, setValid] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState<null | 'attended' | 'missed'>(null);

  useEffect(() => {
    // If opened with ?fromNotification=true, set a session flag so SPA navigation still works
    if (fromNotificationParam) {
      try {
        window.sessionStorage.setItem('fromNotification', 'true');
      } catch (e) {}
    }

    // Allow access if either the query param is present or a sessionStorage flag exists
    const hasSessionFlag = typeof window !== 'undefined' && window.sessionStorage.getItem('fromNotification') === 'true';
    if (fromNotificationParam || hasSessionFlag) {
      setValid(true);
      // remove the session flag after granting access so the page can't be reused indefinitely
      try {
        window.sessionStorage.removeItem('fromNotification');
      } catch (e) {}
    } else {
      setValid(false);
    }
  }, [fromNotificationParam]);

  if (!valid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-gray-900 p-8 rounded-xl text-white text-center">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p>This page can only be accessed via a notification.</p>
        </div>
      </div>
    );
  }

  const handleMark = (markType: 'attended' | 'missed') => {
    try {
      const raw = localStorage.getItem('attendanceData');
      let data: Record<string, { attended: number; missed: number }> = raw ? JSON.parse(raw) : {};

      const key = subject || 'unknown';
      if (!data[key]) {
        data[key] = { attended: 0, missed: 0 };
      }
      if (markType === 'attended') data[key].attended += 1;
      else data[key].missed += 1;

      localStorage.setItem('attendanceData', JSON.stringify(data));
      setAttendanceMarked(markType);

      // Give a short delay so user sees confirmation, then redirect to main attendance page
      setTimeout(() => {
        router.push('/attendance');
      }, 700);
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black px-4">
      <div className="bg-[#0b1320] p-6 md:p-8 rounded-2xl text-white w-full max-w-lg shadow-lg" style={{ minWidth: 320 }}>
        <div className="mb-4">
          <div className="text-4xl font-extrabold" style={{ color: '#FFD600' }}>{day || 'Day'}</div>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold underline text-white">{subject || 'Subject'}</h2>
          {typeParam && (
            <span className="inline-block bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded-full">{typeParam}</span>
          )}
        </div>

        <div className="text-sm text-gray-300 mb-6">{time}</div>

        {attendanceMarked === null ? (
          <div className="flex gap-6 justify-center mt-4">
            <button
              className="px-8 py-3 bg-green-400 text-black rounded-lg font-semibold text-lg shadow-md hover:bg-green-500 transition"
              style={{ minWidth: 140 }}
              onClick={() => handleMark('attended')}
            >
              Attended
            </button>
            <button
              className="px-8 py-3 bg-red-300 text-black rounded-lg font-semibold text-lg shadow-md hover:bg-red-400 transition"
              style={{ minWidth: 140 }}
              onClick={() => handleMark('missed')}
            >
              Missed
            </button>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className={`${attendanceMarked === 'attended' ? 'text-green-400' : 'text-red-400'} font-bold mb-2`}>
              {attendanceMarked === 'attended' ? 'Attendance marked as Attended!' : 'Attendance marked as Missed!'}
            </p>
            <button
              className="px-4 py-2 bg-gray-700 rounded text-white text-base"
              onClick={() => router.push('/attendance')}
            >
              Go to Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
