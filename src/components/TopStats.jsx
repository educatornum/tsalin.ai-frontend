import React from 'react';

export default function TopStats({
  title = 'Өнөөдөр',
  left = { value: 0, unit: 'талент', sub: 'цалингаа тооцоолуулж' },
  right = { value: 0, unit: 'цалингийн', sub: 'мэдээлэл баталгаажсан байна' },
  timestamp = '4 цагийн өмнө'
}) {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg px-4 sm:px-6 py-4 w-[min(960px,100vw-48px)]">
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">👥</span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100"><span>{left.value}</span> {left.unit}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{left.sub}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">👤</span>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100"><span>{right.value}</span> {right.unit}</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">{right.sub}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">{timestamp}</div>
    </div>
  );
}


