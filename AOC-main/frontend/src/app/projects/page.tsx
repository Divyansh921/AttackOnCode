'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/use-data';

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading } = useProjects();

  const filteredProjects = useMemo(() => {
    if (!data?.data) return [];
    if (filter === 'all') return data.data;
    if (filter === 'shipped') return data.data.filter(p => p.status === 'shipped' || p.status === 'live');
    if (filter === 'development') return data.data.filter(p => p.status !== 'shipped' && p.status !== 'live');
    if (filter === 'needs-contributors') return data.data.filter(p => p.status !== 'shipped'); // Mock logic
    return data.data;
  }, [data, filter]);

  return (
    <div className="flex flex-col">
      <header className="max-w-7xl mx-auto px-8 py-10 w-full">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Project Workspaces</h1>
        <p className="text-[15px] text-gray-500 font-medium">Living projects with active contributors and progress tracking.</p>
      </header>

      <div className="max-w-7xl mx-auto px-8 w-full pb-20">
        {/* FILTERS */}
        <div className="flex gap-2 flex-wrap mb-10">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'needs-contributors', label: 'Needs Contributors' },
            { id: 'development', label: 'In Development' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'ai', label: 'AI / ML' }
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

        {/* PROJECT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-50 border rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white border rounded-2xl p-7 flex flex-col hover:border-gray-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-[18px] tracking-tight group-hover:text-red-600 transition-colors">
                      {project.name}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                      project.status === 'live' || project.status === 'shipped' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {project.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6 line-clamp-2">
                    {project.description || "Building something amazing for the next generation of builders."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[11px] font-semibold text-gray-500">
                        {tag}
                      </span>
                    ))}
                    {(!project.techStack || project.techStack.length === 0) && ['React', 'NestJS'].map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[11px] font-semibold text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* NEEDS SECTION - Conditional */}
                  {project.status !== 'shipped' && (
                    <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1.5">Looking for contributors</div>
                      <div className="text-[13px] font-bold text-red-800">UI Designer · Backend Engineer</div>
                    </div>
                  )}

                  {/* RECENT ACTIVITY MOCK */}
                  <div className="mb-6">
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Recent Activity</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[12px] text-gray-600">
                        <span className="text-gray-300">✓</span> Auth system completed
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-600">
                        <span className="text-gray-300">⚡</span> 8 PRs merged this week
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto pt-5 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">
                        {project._count?.members || 0} contributors
                      </span>
                    </div>
                    <div className="flex gap-3">
                       <span className="text-[12px] font-bold text-gray-400 flex items-center gap-1">
                         <span>⭐</span> 24
                       </span>
                       <span className="text-[12px] font-bold text-gray-400 flex items-center gap-1">
                         <span>🍴</span> 8
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
