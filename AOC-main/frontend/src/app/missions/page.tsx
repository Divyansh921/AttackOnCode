'use client';

import { useState } from 'react';

export default function MissionsPage() {
  const [tab, setTab] = useState('active');

  const missions = [
    {
      rank: 'S',
      rankColor: 'text-amber-500',
      tags: ['System', 'Priority'],
      title: 'Operation Genesis',
      desc: 'Develop the core infrastructure for the legion\'s tactical communication platform.',
      rewards: [
        { label: 'XP Reward', val: '5,000 XP' },
        { label: 'Badge', val: 'LEGACY BUILDER' },
        { label: 'Status', val: 'IN PROGRESS', valColor: 'text-green-500' }
      ]
    },
    {
      rank: 'A',
      rankColor: 'text-red-600',
      tags: ['AI', 'Research'],
      title: 'AI Warfare Sprint',
      category: 'main',
      desc: 'Implement agentic workflows using advanced LLMs to automate tactical data gathering.',
      rewards: [
        { label: 'XP Reward', val: '2,400 XP' },
        { label: 'Badge', val: 'INTEL CORE' },
        { label: 'Deadline', val: 'JUN 08', valColor: 'text-red-600' }
      ]
    },
    {
      rank: 'B',
      rankColor: 'text-gray-400',
      tags: ['UI/UX', 'Design'],
      title: 'UI Combat Challenge',
      category: 'active',
      desc: 'Design a glassmorphic dashboard interface for the long-distance enemy scouting formation.',
      rewards: [
        { label: 'XP Reward', val: '1,200 XP' },
        { label: 'Badge', val: 'VISUAL VANGUARD' },
        { label: 'Deadline', val: 'JUN 22', valColor: 'text-red-600' }
      ]
    },
    {
      rank: 'S',
      rankColor: 'text-purple-500',
      tags: ['Backend', 'Scale'],
      title: 'Titan Architecture',
      category: 'archive',
      desc: 'Refactor the WebSocket gateway to handle 10,000 concurrent connections.',
      rewards: [
        { label: 'XP Reward', val: '8,000 XP' },
        { label: 'Badge', val: 'TITAN SLAYER' },
        { label: 'Status', val: 'COMPLETED', valColor: 'text-gray-400' }
      ]
    }
  ];

  const filteredMissions = missions.filter(m => m.category === tab || (!m.category && tab === 'active'));

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="px-8 py-16 border-b bg-white relative overflow-hidden">
        {/* GRID OVERLAY */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,4,41,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(217,4,41,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-[11px] font-black text-red-600 uppercase tracking-[3px] mb-3 block">
            Operations & Tactical Objectives
          </span>
          <h1 className="text-[48px] lg:text-[64px] font-black tracking-tighter leading-none text-gray-900">
            MISSION HUB
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-8 py-12 w-full">
        {/* TABS */}
        <div className="flex gap-10 border-b mb-12 overflow-x-auto">
          {['Active Operations', 'Main Missions', 'Special Raids', 'Archive'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t.toLowerCase().split(' ')[0])}
              className={`pb-4 text-[20px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
                tab === t.toLowerCase().split(' ')[0]
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-400 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* MISSION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((m, i) => (
            <div key={i} className="group grid grid-cols-[100px_1fr] gap-8 p-10 border rounded-xl bg-white hover:border-red-600 hover:translate-x-2 transition-all cursor-pointer shadow-sm">
              <div className={`text-[80px] font-black leading-none text-center ${m.rankColor} opacity-20 group-hover:opacity-100 transition-opacity`}>
                {m.rank}
              </div>
              <div className="flex flex-col">
                <div className="flex gap-2 mb-4">
                  {m.tags.map((tag, j) => (
                    <span key={j} className="text-[9px] font-black px-2 py-1 bg-gray-50 border rounded uppercase tracking-widest text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <h4 className="text-[28px] font-black tracking-tight text-gray-900 mb-3 uppercase leading-none">
                  {m.title}
                </h4>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
                  {m.desc}
                </p>
                
                <div className="flex flex-col gap-2 pt-6 border-t">
                  {m.rewards.map((reward, k) => (
                    <div key={k} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <span className="text-gray-300">{reward.label}</span>
                      <span className={reward.valColor || 'text-red-600'}>{reward.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* LOCKED MISSION */}
          <div className="group grid grid-cols-[100px_1fr] gap-8 p-10 border border-dashed rounded-xl bg-gray-50/30 opacity-60">
             <div className="text-[64px] font-black leading-none text-center text-gray-200">?</div>
             <div className="flex flex-col">
                <div className="flex gap-2 mb-4">
                  <span className="text-[9px] font-black px-2 py-1 bg-gray-50 border rounded uppercase tracking-widest text-gray-400">Secret</span>
                </div>
                <h4 className="text-[28px] font-black tracking-tight text-gray-900 mb-3 uppercase leading-none">Midnight Build Raid</h4>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-8">A surprise high-pressure build session revealed only when the time comes.</p>
                <div className="flex flex-col gap-2 pt-6 border-t">
                   <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <span className="text-gray-300">XP Reward</span>
                      <span className="text-gray-400">???? XP</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                      <span className="text-gray-300">Status</span>
                      <span className="text-gray-400">LOCKED</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
