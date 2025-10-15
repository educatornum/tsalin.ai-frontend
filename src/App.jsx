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

const asset = (p) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
  const path = String(p || '').replace(/^\/+/, '');
  return `${base}${path}`;
};

export default function App() {
  const [selectedJob, setSelectedJob] = React.useState(null);
  const openJob = (job) => setSelectedJob(job);
  const closeJob = () => setSelectedJob(null);
  const handlePostClick = () => {
    const el = document.getElementById('salary-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleUnlockClick = () => {
    console.log('🔓 Unlock button clicked!');
    console.log('Current isUnlocked:', isUnlocked);
    console.log('Current salary count:', localStorage.getItem('salarySubmissionCount'));
    
    // Hide the overlay immediately (session only)
    console.log('Hiding overlay...');
    setIsUnlocked(true);
    
    // Force step to 1
    console.log('Setting forceStep1 to true...');
    setForceStep1(true);
    
    // Scroll to salary section
    console.log('Starting scroll in 100ms...');
    setTimeout(() => {
      const el = document.getElementById('salary-section');
      if (el) {
        console.log('✅ Found salary-section element, scrolling...');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.log('❌ Salary section not found, scrolling to top');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };
  const [isFormActive, setIsFormActive] = React.useState(false);
  const [salaryPosts, setSalaryPosts] = React.useState([]);
  const [salaryPostsLoading, setSalaryPostsLoading] = React.useState(false);
  const [salaryPostsError, setSalaryPostsError] = React.useState('');
  const [filterSource, setFilterSource] = React.useState('');
  const [filterVerified, setFilterVerified] = React.useState(''); // '', 'verified', 'not_verified'
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [forceStep1, setForceStep1] = React.useState(false);

  // Check unlock status from localStorage based on salary submission counter
  React.useEffect(() => {
    const salaryCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
    const unlocked = salaryCount >= 1;
    console.log('Salary submission count:', salaryCount, 'Unlocked:', unlocked);
    setIsUnlocked(unlocked);
  }, []);

  // Listen for salary submission events from SalarySection
  React.useEffect(() => {
    const handleSalarySubmitted = () => {
      const salaryCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
      const unlocked = salaryCount >= 1;
      console.log('Salary submitted, count:', salaryCount, 'Unlocked:', unlocked);
      setIsUnlocked(unlocked);
    };

    window.addEventListener('salarySubmitted', handleSalarySubmitted);
    return () => window.removeEventListener('salarySubmitted', handleSalarySubmitted);
  }, []);

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
    setSalaryPostsLoading(true);
    setSalaryPostsError('');
    try {
      const params = new URLSearchParams();
      if (source) params.set('source', source);
      // Only send is_verified=true to backend, filter "not verified" on frontend
      if (verifiedFilter === 'verified') params.set('is_verified', 'true');
      const q = params.toString();
      const url = `/api/salary-posts${q ? `?${q}` : ''}`;
      console.log('🔍 Fetching:', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      console.log('📊 Received posts:', list.length, 'posts');
      console.log('🎯 Verified filter:', verifiedFilter);
      console.log('📋 Sample post:', list[0]);
      // Filter on frontend
      const filtered = verifiedFilter === ''
        ? list
        : verifiedFilter === 'verified'
          ? list.filter((p) => Boolean(p?.is_verified))
          : list.filter((p) => !Boolean(p?.is_verified));
      console.log('✅ Filtered posts:', filtered.length, 'posts');
      setSalaryPosts(filtered.map(mapPost));
    } catch (e) {
      setSalaryPostsError('Алдаа: цалингийн постуудаа ачаалж чадсангүй');
      setSalaryPosts([]);
    } finally {
      setSalaryPostsLoading(false);
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
    <div className="app min-h-screen overflow-x-hidden md:overflow-x-hidden relative">
      <div className={`transition-all duration-300 ${!isUnlocked ? 'blur-sm pointer-events-none' : ''}`}>
        <Header onPostClick={handlePostClick} onUnlockClick={handleUnlockClick} isUnlocked={isUnlocked} />
      </div>

      {/* Blur Overlay - shows when not unlocked */}
      {!isUnlocked && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 max-w-lg mx-4 shadow-2xl text-center">
            <div className="mb-8">
              <div className="text-7xl mb-6">🔒</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Монголын цалингийн ил тод байдлыг хамтдаа сайжруулъя
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Мэдээллээ оруулснаар илүү олон функц, гүнзгий шинжилгээ болон цалингийн харьцуулалт нээх болно.
              </p>
            </div>
            
            <button
              onClick={() => {
                console.log('🎯 Overlay button clicked!');
                handleUnlockClick();
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
            >
              ЦАЛИНГАА ОРУУЛ
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 flex items-start justify-center gap-2 max-w-md mx-auto">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-left">Бүх мэдээлэл таны нэр, байгууллагын нэрээс ангид, бүрэн нууцлалтай хадгалагдана.</span>
            </p>
          </div>
        </div>
      )}

      <main className={`w-full transition-all duration-300 ${!isUnlocked ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Salary posts area with form and stats (matches mock) */}
        <section className="relative w-full h-auto lg:h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="px-[40px] w-full mx-auto py-6">
            <div className="relative rounded-none border-0 bg-transparent shadow-none p-0">
              <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] xl:grid-cols-[35%_65%] gap-4 lg:gap-6">
                {/* Left column: form */}
                <div className="px-0" onMouseDown={(e)=>{ e.stopPropagation(); setIsFormActive(true); }}>
                  <div className="lg:sticky lg:top-4">
                    {/* <SalaryTab/> */}
                    <SalarySection compact isUnlocked={isUnlocked} setIsUnlocked={setIsUnlocked} forceStep1={forceStep1} setForceStep1={setForceStep1} />
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

                  {/* Filters: 2 rows on mobile, 1 row on desktop */}
                  <div className="mb-4 space-y-2 sm:space-y-0">
                    {/* Row 1: Verified filters */}
                    <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto px-1 sm:px-0">
                      <button onClick={()=>handleVerifiedFilter('')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified===''? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}>
                        Бүгд
                      </button>
                      <button onClick={()=>handleVerifiedFilter('verified')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified==='verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}>
                        <VerifiedBadge className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" /> <span className="hidden sm:inline">Баталгаажсан</span>
                      </button>
                      <button onClick={()=>handleVerifiedFilter('not_verified')} className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified==='not_verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202]'} text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0`}>
                        <UnverifiedBadge className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" /> <span className="hidden sm:inline">Баталгаажаагүй</span>
                      </button>
                      
                      {/* Source filters - inline on desktop only */}
                      <button onClick={()=>handleFilter('')} className={`hidden sm:flex px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterSource===''? 'bg-[#fbd433] text-[#020202] border-[#fbd433]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-xs sm:text-sm items-center gap-1 sm:gap-2 shrink-0`}> Бүгд</button>
                      <button onClick={()=>handleFilter('user_submission')} className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='user_submission'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} items-center shrink-0`}><img src={asset('logo-svg/Symbol Black.svg')} alt="TSALIN.ai" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" /></button>
                      <button onClick={()=>handleFilter('cv_upload')} className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='cv_upload'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} items-center shrink-0`}><img src={asset('cv.png')} alt="CV_upload" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" /></button>
                      <button onClick={()=>handleFilter('lambda')} className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='lambda'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} items-center shrink-0`}><img src={asset('lamb-logo.png')} alt="lambda" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" /></button>
                    </div>
                    
                    {/* Row 2: Source filters - mobile only */}
                    <div className="flex sm:hidden flex-nowrap items-center gap-1.5 overflow-x-auto px-1">
                      <button onClick={()=>handleFilter('')} className={`px-2 py-1.5 rounded-full border ${filterSource===''? 'bg-[#fbd433] text-[#020202] border-[#fbd433]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} text-xs flex items-center gap-1 shrink-0`}> Бүгд</button>
                      <button onClick={()=>handleFilter('user_submission')} className={`px-2 py-1.5 rounded-full border ${filterSource==='user_submission'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} shrink-0`}><img src={asset('logo-svg/Symbol Black.svg')} alt="TSALIN.ai" className="h-4 w-4" /></button>
                      <button onClick={()=>handleFilter('cv_upload')} className={`px-2 py-1.5 rounded-full border ${filterSource==='cv_upload'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} shrink-0`}><img src={asset('cv.png')} alt="CV_upload" className="h-4 w-4" /></button>
                      <button onClick={()=>handleFilter('lambda')} className={`px-2 py-1.5 rounded-full border ${filterSource==='lambda'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202]'} shrink-0`}><img src={asset('lamb-logo.png')} alt="lambda" className="h-4 w-4" /></button>
                    </div>
                  </div>

                  {/* Loading state */}
                  {salaryPostsLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Уншиж байна...</p>
                      </div>
                    </div>
                  )}

                  {/* No data message */}
                  {!salaryPostsLoading && salaryPosts.length === 0 && (
                    <div className="flex items-center justify-center h-64 px-4">
                      <div className="text-center max-w-sm">
                        <div className="text-5xl sm:text-6xl mb-4">📭</div>
                        <p className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Дата олдсонгүй</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Өөр шүүлт сонгож үзээрэй</p>
                      </div>
                    </div>
                  )}

                  {/* Animated columns - 4 max */}
                  {!salaryPostsLoading && salaryPosts.length > 0 && (
                    <div className={`transition ${isFormActive? 'blur-[2px]' : ''}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 h-auto lg:h-[75vh] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] overflow-hidden content-start">
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
                      <ul className={`hidden lg:block space-y-4 animate-scroll hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[2].map((job, idx) => (
                          <li key={`c3-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                      {/* Column 4 */}
                      <ul className={`hidden xl:block space-y-4 animate-scroll-reverse sm:mt-24 hover:[animation-play-state:paused] ${selectedJob ? '[animation-play-state:paused]' : ''}`}>
                        {cols[3].map((job, idx) => (
                          <li key={`c4-${idx}`} onClick={()=>openJob(job)}><JobCard job={job} enter={false} /></li>
                        ))}
                      </ul>
                      
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <JobModal job={selectedJob} onClose={closeJob} />
      </main>

      {/* <Fab /> */}
      {/* <button className="
        fixed 
        left-3 sm:left-4 sm:bottom-14 
        bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full 
        px-3 py-1.5 sm:px-4 sm:py-2 
        shadow-lg flex items-center gap-2 text-gray-900 dark:text-white
        text-xs sm:text-sm z-50">
        Powered by Lambda <img src={asset('lamb-logo.png')} alt="Lambda" className="h-3 w-3 sm:h-4 sm:w-4" />
      </button> */}
      <footer className="fixed inset-x-0 bottom-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <a 
          href="https://lambda.global" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-center text-sm sm:text-base md:text-lg text-[#020202] py-2 sm:py-3 md:py-4 dark:text-gray-400 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          Powered by Lambda <img src={asset('lamb-logo.png')} alt="Lambda" className="h-4 w-4 sm:h-5 sm:w-5" />
        </a>
      </footer>
    </div>
  );
}


