import React from 'react';
import VerifiedBadge from './VerifiedBadge.jsx';
import UnverifiedBadge from './UnverifiedBadge.jsx';

export default function JobCard({ job, enter = true, variant }) {
  const base = 'group relative rounded-xl p-5 shadow-sm transition-colors duration-200 hover:shadow-md h-full';
  const normal = 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 border border-[#020202] dark:border-[#020202]';
  const amber = 'bg-amber-800/90 border border-amber-700 text-amber-50 hover:bg-amber-700/90';
  const outline = 'bg-transparent border border-white/30 text-white hover:border-white/60 hover:bg-white/5';
  const cardClasses = `${base} ${variant==='amber' ? amber : variant==='outline' ? outline : normal} ${enter ? 'animate-card-enter' : ''}`;

  const shareText = `${job.experienceYears ? `${job.experienceYears} жилийн туршлагатай ` : ''}"${job.title}" ${job.salary} цалин авч байна.`;

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

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const baseU = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
  const imgSrc = job.source === 'lambda'
    ? `${baseU}lamb-logo.png`
    : (job.source === 'cv_upload'
      ? `${baseU}cv.png`
      : `${baseU}logo-svg/Symbol-Red.svg`);

  return (
    <article className={cardClasses}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img 
            className={`border border-[#020202] dark:border-[#020202] w-10 h-10 rounded-full object-cover p-1 bg-transparent dark:bg-white`}
            src={imgSrc} 
            alt="Company logo" onClick={() => setPreviewOpen(true)} />
          {job.verified ? (
            <span className="absolute -right-1 -bottom-1 shadow ring-2 ring-white rounded-full" title="Verified">
              <VerifiedBadge className="h-4 w-4" />
            </span>
          ) : (
            <span className="absolute -right-1 -bottom-1 shadow ring-2 ring-white rounded-full" title="Unverified">
              <UnverifiedBadge className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className={`text-sm flex items-center gap-1 min-w-0 ${variant==='amber' ? 'text-amber-200' : variant==='outline' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
        <strong className="break-words">
            @{String(job.company || '').replace(/\s+/g, ' ').trim().toUpperCase()}
        </strong>
          {job.verified ? <VerifiedBadge className="h-3 w-3" /> : <UnverifiedBadge className="h-3 w-3" />}
          {job.sourceTag && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border border-[#020202] text-[#020202] bg-white dark:bg-white dark:text-[#020202]">{job.sourceTag}</span>
          )}
        </div>
      </div>
      <p className="text-sm leading-6 pt-1">
        {job.experienceYears ? `${job.experienceYears} жилийн туршлагатай ` : ''}
        "{job.title}" <strong className="font-semibold">{job.salary}</strong> цалин авч байна.
       </p>
      <div className={`mt-3 flex items-center justify-between text-sm ${variant==='amber' ? 'text-amber-200/90' : variant==='outline' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
        <span>{job.timeAgo}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onShareFacebook} className={`inline-flex items-center justify-center h-7 w-7 rounded-full ${variant==='outline' ? 'border border-white/40 text-white' : 'border border-slate-300 text-blue-600'} bg-white dark:bg-slate-900`} aria-label="Share on Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.77l-.44 2.91h-2.33v7.03C18.34 21.2 22 17.06 22 12.06Z" />
            </svg>
          </button>
          <button type="button" onClick={onShareInstagram} className={`inline-flex items-center justify-center h-7 w-7 rounded-full ${variant==='outline' ? 'border border-white/40 text-white' : 'border border-slate-300 text-pink-600'} bg-white dark:bg-slate-900`} aria-label="Share on Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z" />
            </svg>
          </button>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4">
            <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
              <img src={imgSrc} alt="Logo preview" className="w-28 h-28 rounded-full object-cover border border-[#020202] dark:border-[#020202] bg-transparent dark:bg-white" />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}


