'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-20 lg:py-32">
      {/* HERO */}
      <div className="mb-20">
        <h1 className="text-[36px] lg:text-[44px] font-black tracking-tight leading-[1.1] mb-6">
          We help students find teammates and build things together.
        </h1>
        <p className="text-[17px] text-gray-500 leading-relaxed">
          Attack on Code is a collaborative ecosystem built around one simple idea: no student should have to hack alone. We connect builders, coordinate teams, and make hackathon participation seamless.
        </p>
      </div>

      {/* PROBLEM SECTION */}
      <section className="mb-20">
        <h2 className="text-[20px] font-black tracking-tight mb-8">The problem we solve</h2>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
          Every semester, thousands of students want to participate in hackathons but face the same frustrating barriers:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: '"I don\'t know anyone."', a: 'Talented students building alone because they haven\'t found the right people yet.' },
            { q: '"I can\'t find a team."', a: 'Hackathon registration closes and you still don\'t have teammates.' },
            { q: '"We need a designer."', a: 'Teams with 4 backend developers and no one to make the demo look good.' },
            { q: '"I missed the deadline."', a: 'No centralized place to track hackathons, deadlines, and team formation status.' }
          ].map((p, i) => (
            <div key={i} className="p-6 border rounded-xl bg-white hover:border-gray-300 transition-colors">
              <h4 className="font-bold text-[14px] mb-2">{p.q}</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">{p.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="mb-20">
        <h2 className="text-[20px] font-black tracking-tight mb-8">How we fix it</h2>
        <div className="space-y-6">
          {[
            { icon: '🔍', title: 'Builder Discovery', desc: 'A searchable directory where students list their skills, stack, and availability. Find your perfect teammate in seconds.' },
            { icon: '👥', title: 'Team Formation', desc: 'Create teams, define open roles, and recruit members. Or browse teams that need your exact skills.' },
            { icon: '🏆', title: 'Hackathon Coordination', desc: 'Track upcoming events, see which teams are forming, and coordinate participation as a community.' },
            { icon: '💻', title: 'Project Workspaces', desc: 'Every project gets a living page with contributors, tasks, repos, and contributor needs.' },
            { icon: '📈', title: 'Builder Reputation', desc: 'Earn credibility through projects, hackathons, and peer recognition. Visible proof of contribution.' }
          ].map((s, i) => (
            <div key={i} className="flex gap-5 group">
              <div className="w-10 h-10 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-[18px] group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                {s.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[15px]">{s.title}</span>
                <p className="text-[14px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="mb-20">
        <h2 className="text-[20px] font-black tracking-tight mb-8">Our values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🔨', title: 'Build First', desc: 'Ship, don\'t talk. Learning by doing beats tutorials every time.' },
            { icon: '👥', title: 'Team Over Solo', desc: 'The best work happens in teams. We make teaming up effortless.' },
            { icon: '💡', title: 'Open Access', desc: 'No gatekeeping. Every builder is welcome regardless of experience.' }
          ].map((v, i) => (
            <div key={i} className="p-8 border rounded-2xl text-center flex flex-col items-center">
              <span className="text-2xl mb-4">{v.icon}</span>
              <h4 className="font-bold text-[14px] mb-2 uppercase tracking-widest">{v.title}</h4>
              <p className="text-[12px] text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BOX */}
      <div className="bg-gray-50 border rounded-3xl p-12 text-center">
        <h2 className="text-[24px] font-black tracking-tight mb-4">Ready to find your team?</h2>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-8">Join 1,240+ builders who are connecting, collaborating, and shipping together.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
            Join Community
          </Link>
          <Link href="/builders" className="px-8 py-3 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-white transition-all">
            Browse Builders
          </Link>
        </div>
      </div>
    </div>
  );
}
