import React from 'react';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import JobCard from './components/JobCard.jsx';
import Fab from './components/Fab.jsx';
import jobs from './data/jobs.js';
import JobModal from './components/JobModal.jsx';
import SalarySection from './components/SalarySection.jsx';
import SalaryTab from './components/SalaryTab.jsx';
import TopStats from './components/TopStats.jsx';
import StatPost from './components/StatPost.jsx';
import VerifiedBadge from './components/VerifiedBadge.jsx';
import UnverifiedBadge from './components/UnverifiedBadge.jsx';

export default function App() {
  const [selectedJob, setSelectedJob] = React.useState(null);
  const openJob = (job) => setSelectedJob(job);
  const closeJob = () => setSelectedJob(null);
  const handlePostClick = () => {
    const el = document.getElementById('salary-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const [isFormActive, setIsFormActive] = React.useState(false);
  const [salaryPosts, setSalaryPosts] = React.useState([]);
  const [salaryPostsError, setSalaryPostsError] = React.useState('');
  const [filterSource, setFilterSource] = React.useState('');
  const [filterVerified, setFilterVerified] = React.useState(''); // '', 'verified', 'not_verified'

  // Helpers
  const formatCurrency = (num) => {
    if (typeof num !== 'number') return '';
    return num.toLocaleString('mn-MN');
  };
  const toTimeAgo = (iso) => {
    try {
      const then = new Date(iso).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - then) / 1000));
      if (diff < 60) return 'саяхан';
      const m = Math.floor(diff / 60);
      if (m < 60) return `${m} минутын өмнө`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} цагийн өмнө`;
      const d = Math.floor(h / 24);
      return `${d} өдөрийн өмнө`;
    } catch { return ''; }
  };

  const mapPost = (p) => ({
    company: p?.industry_id?.name_mn || '—',
    title: p?.position_id?.name_mn || '—',
    salary: `${formatCurrency(p?.salary)}₮`,
    timeAgo: toTimeAgo(p?.createdAt),
    logo: '/image.png',
    verified: Boolean(p?.is_verified),
    description: '',
    source: p?.source,
    experienceYears: p?.experience_years
  });

  const fetchPosts = async (source = '', verifiedFilter = '') => {
    setSalaryPostsError('');
    try {
      const params = new URLSearchParams();
      if (source) params.set('source', source);
      if (verifiedFilter === 'verified') params.set('is_verified', 'true');
      if (verifiedFilter === 'not_verified') params.set('is_verified', 'false');
      const q = params.toString();
      const res = await fetch(`https://tsalin-ai.onrender.com/api/salary-posts${q ? `?${q}` : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const filtered = verifiedFilter === ''
        ? list
        : list.filter((p) => verifiedFilter === 'verified' ? Boolean(p?.is_verified) : !Boolean(p?.is_verified));
      setSalaryPosts(filtered.map(mapPost));
    } catch (e) {
      setSalaryPostsError('Алдаа: цалингийн постуудаа ачаалж чадсангүй');
      setSalaryPosts([]);
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    fetchPosts(filterSource, filterVerified);
    return () => { cancelled = true; };
  }, [filterSource, filterVerified]);

  const handleFilter = (src) => {
    setFilterSource(src);
  };
  const handleVerifiedFilter = (vf) => {
    setFilterVerified(vf);
  };

  const posts = salaryPosts.length ? salaryPosts : jobs;
  // Distribute posts across 4 columns without duplication
  const columnsCount = 4;
  const cols = Array.from({ length: columnsCount }, () => []);
  posts.forEach((p, i) => { cols[i % columnsCount].push(p); });

  return (
    <div className="app min-h-screen overflow-x-hidden md:overflow-x-hidden">
      <Header onPostClick={handlePostClick} />

      <main className="w-full">
        {/* Salary posts area with form and stats (matches mock) */}
        <section className="relative w-full h-auto lg:h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="px-[40px] w-full mx-auto py-6">
            <div className="relative rounded-none border-0 bg-transparent shadow-none p-0">
              <div className="grid grid-cols-1 md:grid-cols-[45%_55%] gap-2">
                {/* Left column: form */}
                <div className="px-0" onMouseDown={(e)=>{ e.stopPropagation(); setIsFormActive(true); }}>
                  <div className="lg:sticky lg:top-4">
                    {/* <SalaryTab/> */}
                    <SalarySection compact />
                  </div>
                </div>

                {/* Right column: stats + animated posts */}
                <div className="px-0" onMouseDown={()=>setIsFormActive(false)}>
                  {/* Two big stat posts */}
                  {/* <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 transition ${isFormActive? 'blur-[1.5px]' : ''}`}>
                    <div className="sm:justify-self-center max-w-[280px] w-full">
                      <StatPost icon={<VerifiedBadge className="h-6 w-6" />} value={77} unit="талент" sub="цалингаа тооцоолуулж" />
                    </div>
                    <div className="sm:justify-self-end max-w-[380px] w-full">
                      <StatPost icon={<VerifiedBadge className="h-6 w-6" />} value={211} unit="цалингийн" sub="мэдээлэл баталгаажсан байна" />
                    </div>
                  </div> */}

                  {/* Filters: source + verified on one row */}
                  <div className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto">
                    <button onClick={()=>handleVerifiedFilter('')} className={`ml-2 px-4 py-2 rounded-full border ${filterVerified===''? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-sm flex items-center gap-2 shrink-0`}>
                      Бүгд
                    </button>
                    <button onClick={()=>handleVerifiedFilter('verified')} className={`px-4 py-2 rounded-full border ${filterVerified==='verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-sm flex items-center gap-2 shrink-0`}>
                      <VerifiedBadge className="h-5 w-5 md:h-6 md:w-6" /> Баталгаажсан
                    </button>
                    <button onClick={()=>handleVerifiedFilter('not_verified')} className={`px-4 py-2 rounded-full border ${filterVerified==='not_verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-sm flex items-center gap-2 shrink-0`}>
                      <UnverifiedBadge className="h-5 w-5 md:h-6 md:w-6" /> Баталгаажаагүй
                    </button>
                    <h2 className="text-[#020202] dark:text-white text-sm md:text-base font-medium whitespace-nowrap shrink-0">Эх сурвалж:</h2>
                    <button onClick={()=>handleFilter('')} className={`px-4 py-2 rounded-full border ${filterSource===''? 'bg-[#fbd433] text-[#020202] border-[#fbd433]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-sm shrink-0`}> Бүгд</button>
                    <button onClick={()=>handleFilter('user_submission')} className={`px-4 py-2 rounded-full border ${filterSource==='user_submission'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-sm shrink-0`}><img src="/logo-svg/Symbol Black.svg" alt="TSALIN.ai" className="h-5 w-5 md:h-6 md:w-6" /></button>
                    <button onClick={()=>handleFilter('cv_upload')} className={`px-4 py-2 rounded-full border ${filterSource==='cv_upload'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-sm shrink-0`}><img src="/cv.png" alt="CV_upload" className="h-5 w-5 md:h-6 md:w-6" /></button>
                    <button onClick={()=>handleFilter('lambda')} className={`px-4 py-2 rounded-full border ${filterSource==='lambda'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-sm shrink-0`}><img src="/lamb-logo.png" alt="lambda" className="h-5 w-5 md:h-6 md:w-6" /></button>
                  </div>

                  {/* Animated columns - 4 max */}
                  <div className={`transition ${isFormActive? 'blur-[2px]' : ''}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-auto lg:h-[75vh] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] overflow-hidden content-start">
                      {/* Column 1 */}
                      <ul className={`space-y-4 animate-scroll hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[0].map((job, idx) => (
                          <li key={`c1-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                      {/* Column 2 */}
                      <ul className={`hidden sm:block space-y-4 animate-scroll-reverse sm:mt-24 hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[1].map((job, idx) => (
                          <li key={`c2-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                      {/* Column 3 */}
                      <ul className={`hidden md:block space-y-4 animate-scroll hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[2].map((job, idx) => (
                          <li key={`c3-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                      {/* Column 4 */}
                      <ul className={`hidden lg:block space-y-4 animate-scroll-reverse sm:mt-24 hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[3].map((job, idx) => (
                          <li key={`c4-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <JobModal job={selectedJob} onClose={closeJob} />
      </main>

      {/* <Fab />
      <button className="
        fixed 
        p-2 left-5 bottom-5 bg-white border
        border-gray-200 rounded-full 
        px-4 py-2 shadow-lg flex items-center gap-2 text-gray-900">
        Powered by Lambda <img src="/lamb-logo.png" alt="Lambda" className="h-4 w-4" />
      </button>
      <footer className="fixed inset-x-0 bottom-0 z-40">
        <h1 className="text-center text-lg text-[#020202] p-4 dark:text-gray-400">
          2025 © Tsalin.ai
        </h1>
      </footer> */}
    </div>
  );
}


