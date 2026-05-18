'use client';

import { useState, useMemo } from 'react';
import { useBuilders } from '@/hooks/use-data';

export default function BuildersPage() {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const { data, isLoading } = useBuilders();

  const filteredBuilders = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(builder => {
      const matchesSearch = 
        builder.fullName.toLowerCase().includes(search.toLowerCase()) ||
        builder.username.toLowerCase().includes(search.toLowerCase());
      
      const matchesSkill = skillFilter 
        ? builder.skills?.some((s: any) => 
            (typeof s === 'string' ? s : s.skill?.name || '').toLowerCase().includes(skillFilter.toLowerCase())
          )
        : true;

      return matchesSearch && matchesSkill;
    });
  }, [data, search, skillFilter]);

  return (
    <div className="flex flex-col">
      <header className="max-w-7xl mx-auto px-8 py-10 w-full">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Builder Directory</h1>
        <p className="text-[15px] text-gray-500 font-medium">Find developers, designers, and researchers to build with.</p>
      </header>

      <div className="max-w-7xl mx-auto px-8 w-full pb-20">
        {/* SEARCH & FILTERS */}
        <div className="flex flex-wrap gap-4 mb-10">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border rounded-xl w-full max-w-[320px] focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50 transition-all">
            <span className="text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search builders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'Frontend', label: 'Frontend' },
              { id: 'Backend', label: 'Backend' },
              { id: 'AI', label: 'ML / AI' },
              { id: 'UI', label: 'UI/UX' },
              { id: 'Mobile', label: 'Mobile' }
            ].map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSkillFilter(skillFilter === skill.id ? null : skill.id)}
                className={`px-4 py-2.5 text-[12px] font-bold rounded-xl border transition-all whitespace-nowrap ${
                  skillFilter === skill.id
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {skill.label}
              </button>
            ))}
          </div>
        </div>

        {/* BUILDER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-50 border rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              {filteredBuilders.map((builder: any) => (
                <div key={builder.id} className="bg-white border rounded-2xl p-6 flex flex-col hover:border-gray-300 hover:shadow-md transition-all group">
                  <div className="flex gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-[16px] border border-red-100 group-hover:scale-105 transition-transform">
                      {builder.fullName.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[15px] tracking-tight truncate">{builder.fullName}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      </div>
                      <span className="text-[12px] text-gray-400 font-medium truncate">{builder.college || 'Builder Ecosystem'}</span>
                    </div>
                    <div className="ml-auto">
                       <span className="text-[9px] font-black px-2 py-1 rounded-full bg-green-50 text-green-700 uppercase tracking-widest border border-green-100">
                         Available
                       </span>
                    </div>
                  </div>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(builder.skills || ['React', 'NestJS', 'UI Design']).slice(0, 4).map((skill: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-4 gap-2 mb-6 pt-5 border-t">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-900">{builder._count?.teams || 0}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Teams</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-900">{builder._count?.projects || 0}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Projects</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-900">12</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PRs</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-gray-900">840</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-900 text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95">
                    Invite to Team
                  </button>
                </div>
              ))}

              {filteredBuilders.length === 0 && (
                <div className="col-span-full py-32 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-4 grayscale">🔍</div>
                  <h3 className="font-black text-gray-900 mb-2">No builders match your search</h3>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
