import React from 'react';

export default function JobModal({ job, onClose }) {
  if (!job) return null;
  const shareText = `${job.experienceYears ? `${job.experienceYears} жилийн туршлагатай ` : ''}${job.title} ${job.salary} цалин авч байна.`;

  const onShareFacebook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const onShareInstagram = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${shareText} ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Текст хуулагдлаа. Instagram-д paste хийнэ үү.');
      } else {
        alert(text);
      }
    } catch {
      // ignore
    }
  };
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-gray-200 overflow-hidden animate-card-enter-y dark:bg-slate-900 dark:border-slate-800">
          <div className="p-5 border-b border-gray-200 flex items-center gap-3 dark:border-slate-800">
            
            
            <img
              className="w-12 h-12 rounded-full border border-[#020202] dark:border-[#020202] bg-transparent dark:bg-white p-1"
              src={
                job.source === 'lambda'
                  ? new URL('lamb-logo.png', import.meta.env.BASE_URL).href
                  : job.source === 'cv_upload'
                  ? new URL('cv.png', import.meta.env.BASE_URL).href
                  : new URL('logo-svg/Symbol-Red.svg', import.meta.env.BASE_URL).href
              }
              alt="Company logo"
            />
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{job.company}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{job.title}</div>
            </div>
          </div>
          <div className="p-5 text-slate-700 text-sm leading-6 dark:text-slate-300">
            {`${job.experienceYears ? `${job.experienceYears} жилийн туршлагатай ` : ''}${job.title} ${job.salary} цалин авч байна.`}
            <div className="mt-4 text-slate-500 dark:text-slate-400">Цалин: {job.salary} · {job.timeAgo}</div>
          </div>
          <div className="p-4 border-t border-gray-200 flex items-center justify-between dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onShareFacebook} className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-blue-600 bg-white hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700" aria-label="Share on Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.91h-2.33v7.03C18.34 21.2 22 17.06 22 12.06Z" />
                </svg>
              </button>
              <button type="button" onClick={onShareInstagram} className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-pink-600 bg-white hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700" aria-label="Share on Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
                </svg>
              </button>
            </div>
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100">Хаах</button>
          </div>
        </div>
      </div>
    </div>
  );
}


