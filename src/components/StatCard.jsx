import React from 'react';

export default function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="text-2xl" aria-hidden>{icon}</div>
        <div>
          <div className="flex items-end gap-2 font-extrabold text-2xl text-slate-900">
            <span className="text-5xl leading-none">{value}</span>
            <span>талент</span>
          </div>
          <div className="text-lg text-gray-700 mt-2">{label}</div>
        </div>
      </div>
    </div>
  );
}


