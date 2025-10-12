import React from 'react';

export default function StatPost({ icon = '👥', value = 0, unit = 'талент', sub = '' }) {
  return (
    <article className="bg-white border border-gray-200 rounded-2xl p-6 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none select-none" aria-hidden>{icon}</span>
        <div>
          <div className="text-3xl md:text-4xl font-extrabold"><span>{value}</span> {unit}</div>
          {sub && <div className="text-slate-600 dark:text-slate-300 text-sm mt-1">{sub}</div>}
        </div>
      </div>
    </article>
  );
}


