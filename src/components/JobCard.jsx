import React from 'react';
import VerifiedBadge from './VerifiedBadge.jsx';
import UnverifiedBadge from './UnverifiedBadge.jsx';

export default function JobCard({ job, enter = true, variant }) {
  const base = 'group relative rounded-xl p-3 sm:p-5 shadow-sm transition-colors duration-200 hover:shadow-md h-full';
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
            className={`border border-[#020202] dark:border-[#020202] w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover p-1 bg-transparent dark:bg-white`}
            src={imgSrc} 
            alt="Company logo" onClick={() => setPreviewOpen(true)} />
          {job.verified ? (
            <span className="absolute -right-1 -bottom-1 shadow ring-2 ring-white rounded-full" title="Verified">
              <VerifiedBadge className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          ) : (
            <span className="absolute -right-1 -bottom-1 shadow ring-2 ring-white rounded-full" title="Unverified">
              <UnverifiedBadge className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          )}
          
        </div>
        <div className={`text-xs sm:text-sm flex items-center gap-1 min-w-0 flex-1 ${variant==='amber' ? 'text-amber-200' : variant==='outline' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
        <strong className="break-words truncate text-xs sm:text-sm">
            @{String(job.company || '').replace(/\s+/g, ' ').trim().toUpperCase()}
        </strong>
          {/* {job.verified ? <VerifiedBadge className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <UnverifiedBadge className="h-2.5 w-2.5 sm:h-3 sm:w-3" />} */}
          {job.sourceTag && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border border-[#020202] text-[#020202] bg-white dark:bg-white dark:text-[#020202]">{job.sourceTag}</span>
          )}
        </div>
      </div>
      
      <p className="text-xs sm:text-sm leading-5 sm:leading-6 pt-1 break-words overflow-hidden">
        {job.experienceYears ? `${job.experienceYears} жилийн туршлагатай ` : ''}
        <span className="break-words text-xs sm:text-sm">"{job.title}"</span> <strong className="font-semibold text-xs sm:text-sm">{job.salary}</strong> цалин авч байна.
       </p>
      <div className={`mt-3 flex items-center justify-between text-xs sm:text-sm ${variant==='amber' ? 'text-amber-200/90' : variant==='outline' ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
        <span className="text-xs sm:text-sm">{job.timeAgo}</span>
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


