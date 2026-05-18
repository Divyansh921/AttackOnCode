'use client';

import { useBuilders, useGlobalFeed } from '@/hooks/use-data';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityPage() {
  const { data: buildersData, isLoading: buildersLoading } = useBuilders();
  const { data: activityData, isLoading: activityLoading } = useGlobalFeed(1);

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="px-8 py-16 border-b bg-white">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] font-black text-red-600 uppercase tracking-[3px] mb-3 block">
            Legion Roster & Performance
          </span>
          <h1 className="text-[48px] lg:text-[64px] font-black tracking-tighter leading-none text-gray-900">
            MEMBER DIRECTORY
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* MAIN LIST */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">LEGION RANKINGS</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Updated just now
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {buildersLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 w-full bg-gray-50 border rounded-xl animate-pulse" />
              ))
            ) : (
              buildersData?.data.map((builder: any, i: number) => (
                <div key={builder.id} className="grid grid-cols-[40px_48px_1fr_120px_100px] items-center gap-6 px-8 py-5 border rounded-xl bg-white hover:border-red-600 hover:translate-x-2 transition-all group">
                  <span className="text-[20px] font-black text-gray-200 group-hover:text-red-100">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-gray-400">
                    {builder.fullName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-gray-900">{builder.username}</span>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{builder.role || 'Builder'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-gray-900">842.5k</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reputation</span>
                  </div>
                  <div className="flex justify-end">
                     <button className="text-[11px] font-black text-red-600 uppercase tracking-widest hover:underline">Profile</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-8">
          {/* STATS */}
          <div className="p-8 border rounded-2xl bg-white">
            <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-6 border-b pb-4">LEGION STATS</h3>
            <div className="space-y-4">
              {[
                { label: 'Total Builders', val: '1,234' },
                { label: 'Total XP', val: '842.5k' },
                { label: 'Deployments', val: '24,871' },
                { label: 'Avg Commit Rate', val: '12.4/day' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-[14px] font-black text-gray-900">{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE ACTIVITY */}
          <div className="p-8 border rounded-2xl bg-white">
            <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-6 border-b pb-4">LIVE ACTIVITY</h3>
            <div className="flex flex-col gap-6">
              {activityLoading ? (
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                activityData?.data.map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-1.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <p className="text-[13px] text-gray-600 leading-snug">
                        <span className="font-bold text-gray-900">{act.user.fullName}</span>
                        {' '}{act.activityType.replace('_', ' ')} on <span className="font-bold text-gray-900">{act.metadata.teamName || act.metadata.entityName || 'Ecosystem'}</span>
                      </p>
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        {formatDistanceToNow(new Date(act.createdAt))} ago
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
