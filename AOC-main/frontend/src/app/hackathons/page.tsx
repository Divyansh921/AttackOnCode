'use client';

import { useState } from 'react';
import { useHackathons, useExpressInterest } from '@/hooks/use-data';
import { format } from 'date-fns';

type HackathonFilter = 'upcoming' | 'ongoing' | 'past';

export default function HackathonsPage() {
  const [filter, setFilter] = useState<HackathonFilter>('upcoming');
  const { data, isLoading } = useHackathons(filter);
  const expressInterestMutation = useExpressInterest();

  const handleInterest = async (id: string) => {
    try {
      await expressInterestMutation.mutateAsync(id);
      alert('Interest registered! You will receive updates about this hackathon.');
    } catch (err) {
      alert('Failed to register interest.');
    }
  };

  return (
    <div className="flex flex-col">
      <header className="max-w-7xl mx-auto px-8 py-10 w-full">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Hackathon Tracker</h1>
        <p className="text-[15px] text-gray-500 font-medium">Track upcoming hackathons, coordinate team participation, and never miss a deadline.</p>
      </header>

      <div className="max-w-7xl mx-auto px-8 w-full pb-20">
        {/* STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { num: '18', label: 'Hackathons Participated' },
            { num: '7', label: 'Wins' },
            { num: '86', label: 'Teams Formed' },
            { num: '340+', label: 'Builders Participated' }
          ].map((stat, i) => (
            <div key={i} className="bg-white border rounded-xl p-6 text-center">
              <div className="text-3xl font-black tracking-tight text-gray-900">{stat.num}</div>
              <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 border-b mb-10 overflow-x-auto">
          {(['upcoming', 'ongoing', 'past'] as HackathonFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 text-[13px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
                filter === f
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-400 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* HACKATHON LIST */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 w-full bg-gray-50 border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {data?.data.map((hack) => (
                <div key={hack.id} className="bg-white border rounded-2xl p-8 flex flex-col lg:flex-row items-center gap-10 hover:border-gray-300 hover:shadow-md transition-all group">
                  {/* DATE BOX */}
                  <div className="flex flex-col items-center justify-center min-w-[80px]">
                    <div className="text-[32px] font-black leading-none text-gray-900">
                      {format(new Date(hack.startDate), 'dd')}
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 mt-1">
                      {format(new Date(hack.startDate), 'MMM')}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="text-[17px] font-black text-gray-900 group-hover:text-red-600 transition-colors">
                      {hack.name}
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                      {hack.description || "The ecosystem's next big challenge. Form a team and start building."}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                        <span className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">👥</span>
                        {hack._count?.teams || 0} teams forming
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                        <span className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">🎯</span>
                        {hack._count?.interests || 0} builders interested
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                        <span className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-[10px]">📍</span>
                        {hack.mode} · {hack.location || 'Remote'}
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="hidden lg:flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-red-50 text-red-600 uppercase tracking-widest border border-red-100">
                      Team Formation Open
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      Deadline: {hack.registrationDeadline ? format(new Date(hack.registrationDeadline), 'MMM dd') : 'TBD'}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    <Link 
                      href={`/teams?hackathonId=${hack.id}`}
                      className="w-full py-2.5 bg-red-600 text-white text-center text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-red-700 transition-all shadow-sm shadow-red-100"
                    >
                      Find a Team
                    </Link>
                    <button 
                      onClick={() => handleInterest(hack.id)}
                      disabled={expressInterestMutation.isPending}
                      className="w-full py-2.5 border border-gray-200 text-gray-600 text-center text-[12px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                    >
                      {expressInterestMutation.isPending ? 'Processing...' : 'Show Interest'}
                    </button>
                  </div>
                </div>
              ))}

              {(!data || data.data.length === 0) && (
                <div className="py-32 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 grayscale">🏆</div>
                  <h3 className="font-black text-gray-900 mb-2">No hackathons found</h3>
                  <p className="text-sm text-gray-500">Check back later or change your filter.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
