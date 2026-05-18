'use client';

export default function DivisionsPage() {
  const divisions = [
    {
      icon: '⚔️',
      title: 'Engineering Corps',
      desc: 'The backbone of the legion. Responsible for high-performance backends, scalable infrastructure, and the core protocols that keep the walls standing.',
      stats: [
        { label: 'Builders', val: '58' },
        { label: 'Main Projects', val: '12' },
        { label: 'Priority', val: 'S-Rank' }
      ]
    },
    {
      icon: '🧠',
      title: 'AI Research Wing',
      desc: 'Exploring the frontier of intelligence. Implementing agentic workflows, neural architectures, and tactical data analysis to outmaneuver the titans.',
      stats: [
        { label: 'Researchers', val: '36' },
        { label: 'Models', val: '08' },
        { label: 'Priority', val: 'A-Rank' }
      ]
    },
    {
      icon: '🎨',
      title: 'Design Battalion',
      desc: 'Crafting the visual interfaces of the future. Responsible for UI/UX strategy, glassmorphic design systems, and tactical data visualization.',
      stats: [
        { label: 'Designers', val: '27' },
        { label: 'Systems', val: '15' },
        { label: 'Priority', val: 'A-Rank' }
      ]
    },
    {
      icon: '🎮',
      title: 'Game Dev Unit',
      desc: 'Building the simulations of tomorrow. Developing procedural worlds, interactive experiences, and high-fidelity tactical trainers.',
      stats: [
        { label: 'Developers', val: '22' },
        { label: 'Worlds', val: '05' },
        { label: 'Priority', val: 'B-Rank' }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="px-8 py-16 border-b bg-white">
        <div className="max-w-7xl mx-auto">
          <span className="text-[11px] font-black text-red-600 uppercase tracking-[3px] mb-3 block">
            Legion Structural Hierarchy
          </span>
          <h1 className="text-[48px] lg:text-[64px] font-black tracking-tighter leading-none text-gray-900">
            TACTICAL DIVISIONS
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-8 py-16 w-full">
        <div className="max-w-2xl mb-20">
          <h2 className="text-[40px] font-black tracking-tight text-gray-900 mb-6 uppercase">Six Forces. One Mission.</h2>
          <p className="text-[17px] text-gray-500 leading-relaxed">
            The legion is divided into specialized units, each responsible for a critical aspect of our technological evolution. Choose your path and dedicate your heart to the build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {divisions.map((div, i) => (
            <div key={i} className="group relative p-12 border rounded-2xl bg-white hover:border-red-600 hover:-translate-y-2 transition-all shadow-sm hover:shadow-2xl hover:shadow-red-50 overflow-hidden">
              {/* ACCENT DECOR */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-red-600/5 transition-colors" />
              
              <div className="text-5xl mb-8 relative z-10">{div.icon}</div>
              <h3 className="text-[32px] font-black tracking-tight text-gray-900 mb-4 uppercase">{div.title}</h3>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-10">
                {div.desc}
              </p>

              <div className="flex gap-10 border-t pt-8">
                {div.stats.map((stat, j) => (
                  <div key={j} className="flex flex-col">
                    <span className="text-[24px] font-black text-gray-900 leading-none mb-1 uppercase tracking-tighter">
                      {stat.val}
                    </span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
