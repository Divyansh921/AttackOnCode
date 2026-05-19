'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useTeams, useApplyToTeam } from '@/hooks/use-teams';
import { useSearchParams } from 'next/navigation';

function TeamsContent() {
  const searchParams = useSearchParams();
  const hackathonId = searchParams.get('hackathonId');
  
  const [filter, setFilter] = useState<string>('recruiting');
  const { data, isLoading } = useTeams({ hackathonId: hackathonId || undefined });
  const applyMutation = useApplyToTeam();

  const handleApply = async (teamId: string) => {
    try {
      await applyMutation.mutateAsync({ openingId: teamId, message: 'I want to join' });
      alert('Application sent successfully!');
    } catch (err) {
      alert('Failed to send application. You might already be in this team or have a pending application.');
    }
  };

  const filteredTeams = useMemo(() => {
    if (!data?.data) return [];
    if (filter === 'all') return data.data;
    if (filter === 'recruiting') return data.data.filter(t => t.status === 'recruiting');
    // More complex filters (needs frontend, etc) can be implemented by checking roles
    return data.data;
  }, [data, filter]);

  return (
    <div className="flex flex-col">
      <header className="max-w-7xl mx-auto px-8 py-10 w-full flex justify-between items-end">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Team Hub</h1>
          <p className="text-[15px] text-gray-500 font-medium">Browse open teams, apply to join, or create your own.</p>
        </div>
        <Link 
          href="/teams/create" 
          className="px-6 py-2.5 bg-red-600 text-white text-[13px] font-black uppercase tracking-wider rounded-lg hover:bg-red-700 transition-all shadow-sm shadow-red-100"
        >
          Create Team
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-8 w-full pb-20">
        {/* FILTERS */}
        <div className="flex gap-2 flex-wrap mb-10">
          {[
            { id: 'recruiting', label: 'Recruiting' },
            { id: 'all', label: 'All Teams' },
            { id: 'needs-frontend', label: 'Needs Frontend' },
            { id: 'needs-backend', label: 'Needs Backend' },
            { id: 'needs-designer', label: 'Needs Designer' },
            { id: 'sih-2026', label: 'SIH 2026' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all border ${
                filter === f.id
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* TEAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-50 border rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              {filteredTeams.map((team: any) => (
                <div key={team.id} className="bg-white border rounded-2xl p-7 flex flex-col hover:border-gray-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-[18px] tracking-tight group-hover:text-red-600 transition-colors">
                      {team.name}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                      team.status === 'recruiting' ? 'bg-green-50 text-green-700' : 
                      team.status === 'full' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {team.status}
                    </span>
                  </div>

                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6 line-clamp-2">
                    {team.description || "Building something amazing for the next generation of builders."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {team.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[11px] font-semibold text-gray-500">
                        {tag}
                      </span>
                    ))}
                    {(!team.tags || team.tags.length === 0) && ['React', 'NestJS', 'Prisma'].map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[11px] font-semibold text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* NEEDS SECTION */}
                  <div className="mb-6">
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Open Positions</div>
                    <div className="flex flex-wrap gap-2">
                      {/* In a real scenario, this would come from team.members or a specific needs field */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-red-200 bg-red-50/30 rounded-lg text-[12px] font-bold text-red-600">
                        <span>⚡</span> UI Designer
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-red-200 bg-red-50/30 rounded-lg text-[12px] font-bold text-red-600">
                        <span>⚡</span> Backend
                      </span>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto pt-5 border-t flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        {team.members?.slice(0, 4).map((m: any, i: number) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                            {m.user?.username?.charAt(0) || 'U'}
                          </div>
                        ))}
                      </div>
                      <span className="text-[12px] font-bold text-gray-400">
                        {team.members?.length || 0}/6
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                      <span>🏆</span> {team.hackathon?.name || 'Open Project'}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleApply(team.id)}
                    disabled={team.status === 'full' || applyMutation.isPending}
                    className={`mt-4 w-full py-2.5 rounded-lg text-[13px] font-black uppercase tracking-wider transition-all border ${
                      team.status === 'full' 
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 text-gray-900 hover:bg-red-600 hover:text-white hover:border-red-600'
                    }`}
                  >
                    {team.status === 'full' ? 'Team Full' : applyMutation.isPending ? 'Applying...' : 'Apply to Join'}
                  </button>
                </div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="col-span-full py-32 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 grayscale">👥</div>
                  <h3 className="font-black text-gray-900 mb-2">No teams found</h3>
                  <p className="text-sm text-gray-500">Be the first one to create a team for this event!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading teams...</div>}>
      <TeamsContent />
    </Suspense>
  );
}
