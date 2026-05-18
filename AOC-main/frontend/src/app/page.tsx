'use client';

import Link from 'next/link';
import { useGlobalFeed } from '@/hooks/use-data';
import { formatDistanceToNow } from 'date-fns';
import { Skiper28 } from '@/components/Skiper28';

export default function HomePage() {
  const { data: activityData, isLoading: activityLoading } = useGlobalFeed(1);

  return (
    <div className="flex flex-col">
      {/* HERO SECTION */}
      <Skiper28 />

      {/* HOW IT WORKS SECTION */}
      <section className="bg-gray-50 border-y py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-black text-red-600 uppercase tracking-[2px] mb-4 block">Process</span>
            <h2 className="text-3xl font-black tracking-tight mb-4 text-gray-900">Find builders. Form teams. Build fast.</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed">From discovering teammates to shipping projects — the entire hackathon workflow in one platform.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '1', title: 'Create Your Profile', desc: 'Add your skills, stack, experience level, and availability. Let others find you.' },
              { num: '2', title: 'Discover Builders', desc: 'Search by skill, stack, or availability. Find the right people for your team.' },
              { num: '3', title: 'Form Your Team', desc: 'Create a team, define roles, and invite builders. Or join an open team.' },
              { num: '4', title: 'Build & Ship', desc: 'Coordinate projects, track progress, and enter hackathons together as a unit.' }
            ].map((step, i) => (
              <div key={i} className="bg-white border rounded-2xl p-8 hover:border-red-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {step.num}
                </div>
                <h3 className="font-bold text-[15px] mb-3">{step.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-black text-red-600 uppercase tracking-[2px] mb-4 block">Platform</span>
          <h2 className="text-3xl font-black tracking-tight mb-4 text-gray-900">Everything you need to build together</h2>
          <p className="text-gray-500 text-[15px] leading-relaxed">Not just another community — a complete collaboration infrastructure for student builders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Builder Discovery', desc: 'Search and filter builders by skill, tech stack, experience, and availability.' },
            { title: 'Team Formation', desc: 'Create teams, define open roles, and recruit members. Smart matching suggests skills.' },
            { title: 'Hackathon Tracker', desc: 'Browse upcoming hackathons, coordinate team participation, and track deadlines.' },
            { title: 'Project Workspaces', desc: 'Each project gets a living workspace with members, repos, tasks, and progress.' },
            { title: 'Builder Reputation', desc: 'Build credibility through projects, hackathons, and contributions. Proof of work.' },
            { title: 'Smart Matching', desc: 'Get notified when teams need your exact skills, or when a hackathon matches you.' }
          ].map((feat, i) => (
            <div key={i} className="bg-white border rounded-2xl p-8 hover:border-gray-300 hover:shadow-sm transition-all">
              <h3 className="font-bold text-[15px] mb-3">{feat.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE ACTIVITY - FULLY CONNECTED */}
      <section className="bg-gray-50 border-y py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-black text-red-600 uppercase tracking-[2px] mb-4 block">Realtime</span>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">What&apos;s happening right now</h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white border rounded-2xl overflow-hidden shadow-sm">
            {activityLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col">
                {activityData?.data.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      {/* Icon based on activity type can be added here */}
                      <span className="text-[10px]">⚡</span>
                    </div>
                    <div className="flex-1 text-[13px] text-gray-600">
                      <span className="font-bold text-gray-900">{act.user.fullName}</span> 
                      {act.activityType === 'joined_team' && ' joined team '}
                      {act.activityType === 'created_team' && ' created team '}
                      {act.activityType === 'applied_to_team' && ' applied to '}
                      <span className="font-bold text-gray-900">{act.metadata.teamName || act.metadata.entityName || 'a new entity'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(act.createdAt))} ago
                    </span>
                  </div>
                ))}
                {(!activityData || activityData.data.length === 0) && (
                  <div className="p-12 text-center text-gray-400 text-sm italic">
                    The feed is quiet... for now.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-3xl mx-auto px-8 py-32 text-center">
        <h2 className="text-[36px] font-black tracking-tighter leading-tight mb-6">
          Stop looking for teammates.<br />
          Start <span className="text-red-600">building</span> with them.
        </h2>
        <p className="text-[16px] text-gray-500 leading-relaxed mb-10">
          Join 1,240+ builders who are forming teams, shipping projects, and winning hackathons together.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register" className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200">
            Join the Community
          </Link>
          <Link href="/builders" className="px-8 py-3 border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all">
            Browse Builders
          </Link>
        </div>
      </section>
    </div>
  );
}
