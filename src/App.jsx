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
import { FaArrowUpRightDots,FaArrowTrendUp,FaLayerGroup } from "react-icons/fa6";
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
    // Hide the overlay immediately (session only)
    setIsUnlocked(true);
    
    // Force step to 1
    setForceStep1(true);
    
    // Scroll to salary section
    setTimeout(() => {
      const el = document.getElementById('salary-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
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
  const [activeTooltip, setActiveTooltip] = React.useState(null);
  const [sourceDescription, setSourceDescription] = React.useState('Бүх эх сурвалж');
  const [verifiedDescription, setVerifiedDescription] = React.useState('Бүх төрлийн дата');
  
  // Animated stats state
  const [animatedStats, setAnimatedStats] = React.useState({
    totalData: 1,
    todayData: 1,
    todayComparisons: 1
  });
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [forceStep1, setForceStep1] = React.useState(false);

  // Animation function for stats
  const animateStats = (targetValue) => {
    const todayData = Math.floor(targetValue * 0.3); // 30% of total for today
    const todayComparisons = Math.floor(targetValue * 0.15); // 15% of total for comparisons
    
    // Animate total data
    const animateNumber = (key, start, end, duration = 2000) => {
      const startTime = performance.now();
      const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // easeOut cubic
        const current = Math.floor(start + (end - start) * easeOut);
        
        setAnimatedStats(prev => ({ ...prev, [key]: current }));
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        }
      };
      requestAnimationFrame(updateNumber);
    };
    
    // Start animations with slight delays for visual effect
    animateNumber('totalData', 1, targetValue, 2000);
    setTimeout(() => animateNumber('todayData', 1, todayData, 1500), 300);
    setTimeout(() => animateNumber('todayComparisons', 1, todayComparisons, 1500), 600);
  };

  // Check unlock status from localStorage based on salary submission counter
  React.useEffect(() => {
    const salaryCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
    const unlocked = salaryCount >= 1;
    setIsUnlocked(unlocked);
  }, []);

  // Listen for salary submission events from SalarySection
  React.useEffect(() => {
    const handleSalarySubmitted = () => {
      const salaryCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
      const unlocked = salaryCount >= 1;
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
      // Filter on frontend
      const filtered = verifiedFilter === ''
        ? list
        : verifiedFilter === 'verified'
          ? list.filter((p) => Boolean(p?.is_verified))
          : list.filter((p) => !Boolean(p?.is_verified));
        console.log('✅ Filtered posts:', filtered.length, 'posts');
        setSalaryPosts(filtered.map(mapPost));
        
        // Animate stats
        animateStats(filtered.length);
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
    // Set description based on source
    if (src === '') setSourceDescription('Бүх эх сурвалж');
    else if (src === 'user_submission') setSourceDescription('Цалин.ai');
    else if (src === 'cv_upload') setSourceDescription('CV- нээс оруулсан');
    else if (src === 'lambda') setSourceDescription('Lambda-с');
  };
  const handleVerifiedFilter = (vf) => {
    setFilterVerified(vf);
    // Set description based on verified filter
    if (vf === '') setVerifiedDescription('Бүх төрөл');
    else if (vf === 'verified') setVerifiedDescription('Баталгаажуулсан мэдээлэл');
    else if (vf === 'not_verified') setVerifiedDescription('Баталгаажаагүй мэдээлэл');
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

                {/* Right column: animated posts */}
                <div className="pb-2" onMouseDown={()=>setIsFormActive(false)}>
                  {/* Two big stat posts */}
                  {/* <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 transition ${isFormActive? 'blur-[1.5px]' : ''}`}>
                    <div className="sm:justify-self-center max-w-[280px] w-full">
                      <StatPost icon={<VerifiedBadge className="h-6 w-6" />} value={77} unit="талент" sub="цалингаа тооцоолуулж" />
                    </div>
                    <div className="sm:justify-self-end max-w-[380px] w-full">
                      <StatPost icon={<VerifiedBadge className="h-6 w-6" />} value={211} unit="цалингийн" sub="мэдээлэл баталгаажсан байна" />
                    </div>
                  </div> */}

                  {/* Stats cards - back to original position */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Stat 1: Total Salary Data */}
                    <div className="bg-red-600 dark:bg-red-600 rounded-lg p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FaArrowUpRightDots className="text-2xl text-white" />
                        <div className="text-5xl font-bold text-white">
                          {animatedStats.totalData}+
                        </div>
                      </div>
                      <div className="text-md text-white font-medium">
                        Нийт цалингийн дата
                      </div>
                    </div>

                    {/* Stat 2: Today's Salary Data */}
                    <div className="bg-red-600 dark:bg-red-600 rounded-lg p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FaArrowTrendUp className="text-2xl text-white" />
                        <div className="text-5xl font-bold text-white">
                          {animatedStats.totalData}+
                        </div>
                      </div>
                      <div className="text-md text-white font-medium">
                      Өнөөдөр цалингийн дата
                      </div>
                    </div>

                    

                    {/* Stat 3: Today's Comparisons */}

                    <div className="bg-red-600 dark:bg-red-600 rounded-lg p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <FaLayerGroup className="text-2xl text-white" />
                        <div className="text-5xl font-bold text-white">
                          {animatedStats.todayComparisons}+
                        </div>
                      </div>
                      <div className="text-md text-white font-medium">
                      Өнөөдөр цалингийн харьцуулалт
                      </div>
                    </div>
                  </div>

                    {/* Filters: 2 rows on mobile, 1 row on desktop */}
                   <div className="mb-4 space-y-3 sm:space-y-0">
                     {/* Row 1: Verified filters - mobile: only verified/not_verified, desktop: all */}
                     <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto overflow-y-visible px-1 sm:px-0">
                       <div className="flex items-center gap-2">
                         <h1 className="text-slate-900 dark:text-white">Төрөл:</h1>
                       </div>
                       {/* Бүгд button - desktop only */}
                       <div className="relative group">
                         <button 
                           onClick={()=>handleVerifiedFilter('')}
                           className={`hidden sm:flex px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified===''? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202] hover:bg-gray-100 dark:hover:bg-gray-50'} text-xs sm:text-sm items-center gap-1 sm:gap-2 shrink-0 transition-all duration-200 hover:scale-105`}>
                           Бүгд
                         </button>
                         
                       </div>
                       <div className="relative group">
                         <button 
                           onClick={()=>handleVerifiedFilter('verified')}
                           className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified==='verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202] hover:bg-gray-100 dark:hover:bg-gray-50'} text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0 transition-all duration-200 hover:scale-105`}>
                           <VerifiedBadge className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" /> <span className="hidden sm:inline">Баталгаажсан</span>
                         </button>
                         
                       </div>
                       <div className="relative group">
                         <button 
                           onClick={()=>handleVerifiedFilter('not_verified')}
                           className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterVerified==='not_verified'? 'bg-[#020202] text-white border-[#020202]' : 'bg-white text-[#020202] border-[#020202] hover:bg-gray-100 dark:hover:bg-gray-50'} text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shrink-0 transition-all duration-200 hover:scale-105`}>
                           <UnverifiedBadge className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" /> <span className="hidden sm:inline">Баталгаажаагүй</span>
                         </button>
                         
                       </div>
                       {/* Desktop only: Эх сурвалж section */}
                       <div className="hidden sm:flex items-center gap-2">
                         <h1 className="text-slate-900 dark:text-white">Эх сурвалж:</h1>
                         {sourceDescription && (
                           <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
                             {sourceDescription}
                           </span>
                         )}
                       </div>
                       {/* Desktop only: Source filters */}
                       <div className="relative group">
                         <button 
                           onClick={()=>handleFilter('')}
                           className={`hidden sm:flex px-2 py-1.5 sm:px-4 sm:py-2 rounded-full border ${filterSource===''? 'bg-[#fbd433] text-[#020202] border-[#fbd433]' : 'bg-white dark:bg-white text-[#020202] border-[#020202] hover:bg-[#fbd433]/20'} text-xs sm:text-sm items-center gap-1 sm:gap-2 shrink-0 transition-all duration-200 hover:scale-105`}>
                           Бүгд
                         </button>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-semibold rounded-2xl shadow-2xl border-2 border-slate-300 dark:border-slate-600 whitespace-nowrap min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[99999]">
                           Бүх эх сурвалж
                           <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-8 border-transparent border-t-white dark:border-t-slate-900"></div>
                         </div>
                       </div>
                       <div className="relative group">
                         <button 
                           onClick={()=>handleFilter('user_submission')}
                           className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='user_submission'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202] hover:bg-[#fbd433]/20'} items-center shrink-0 transition-all duration-200 hover:scale-105`}>
                           <img src={asset('logo-svg/Symbol Black.svg')} alt="TSALIN.ai" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                         </button>
                       
                       </div>
                       <div className="relative group">
                         <button 
                           onClick={()=>handleFilter('cv_upload')}
                           className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='cv_upload'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202] hover:bg-[#fbd433]/20'} items-center shrink-0 transition-all duration-200 hover:scale-105`}>
                           <img src={asset('cv.png')} alt="CV_upload" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                         </button>
                         
                       </div>
                       <div className="relative group">
                         <button 
                           onClick={()=>handleFilter('lambda')}
                           className={`hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border ${filterSource==='lambda'? 'bg-[#fbd433] text-[#020202] border-[#020202]' : 'bg-white dark:bg-white text-[#020202] border-[#020202] hover:bg-[#fbd433]/20'} items-center shrink-0 transition-all duration-200 hover:scale-105`}>
                           <img src={asset('lamb-logo.png')} alt="lambda" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                         </button>
                        
                       </div>
                     </div>
                     
                     {/* Row 2: Source filters - mobile only */}
                     <div className="flex sm:hidden flex-nowrap items-center gap-1.5 overflow-x-auto px-1">
                       <div className="flex items-center gap-2">
                         <h1 className="text-slate-900 dark:text-white">Эх сурвалж:</h1>
                         {sourceDescription && (
                           <span className="text-xs text-slate-600 dark:text-slate-400 italic">
                             {sourceDescription}
                           </span>
                         )}
                       </div>
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
        <div className="flex items-center justify-between px-4 py-2 sm:py-3 md:py-4">
          <a 
            href="/terms"
            className="text-lg text-[#020202] dark:text-gray-400 hover:opacity-80 transition-opacity"
          >
            Үйлчилгээний нөхцөл
          </a>
          <a 
            href="https://lambda.global" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm sm:text-base md:text-lg text-[#020202] dark:text-gray-400 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            Powered by Lambda <img src={asset('lamb-logo.png')} alt="Lambda" className="h-4 w-4 sm:h-5 sm:w-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}


