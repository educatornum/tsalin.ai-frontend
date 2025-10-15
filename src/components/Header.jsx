import React from 'react';
import logoBlack from '/logo-svg/Horizontal-Black.svg';
import logoWhite from '/logo-svg/Horizontal-White.svg';
export default function Header({ onPostClick, onUnlockClick, isUnlocked }) {
  // Default to light; no persistence
  const [dark, setDark] = React.useState(false);
  // On mount, force light (remove any stale class from HMR)
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }, []);
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    document.body.classList.toggle('dark', next);
    setDark(next);
  };

  // Apps menu
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-[#fbd433]-400/90 dark:bg-[#020202] backdrop-blur border-b border-black-800 dark:border-[#020202]">
      <div className="max-w-[1800px] mx-auto pl-10 pr-- flex items-center justify-between h-15 p-2">
        <div className="flex items-center gap-2 font-bold">
          <img src={dark ? logoWhite : logoBlack} alt="Logo" className="h-10 w-auto sm:h-12 object-contain" />
          <span className="text-xl lowercase text-slate-900 dark:text-slate-100">Beta</span>
        </div>

        {/* <nav className="hidden sm:flex gap-5 text-gray-600 dark:text-gray-300">
          <a className="hover:text-gray-900 dark:hover:text-white" href="#">Нүүр</a>
          <a className="hover:text-gray-900 dark:hover:text-white" href="#">Цалин тооцоолох</a>
        </nav> */}

        <div ref={menuRef} className="relative flex items-center gap-3 text-gray-600 text-base dark:text-gray-300">
         
          <button onClick={toggleTheme} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 inline-flex items-center gap-2" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? (
              // Sun icon for Light
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              
            ) : (
              // Moon icon for Dark
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
           
            {/* <span className="text-sm">{dark ? 'Light' : 'Dark'}</span> */}
          </button>

          {/* Apps menu button */}
          <button onClick={() => setMenuOpen((v)=>!v)} className="h-9 w-9 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 grid place-items-center hover:bg-white dark:hover:bg-slate-700 transition" aria-label="Apps menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-700 dark:text-slate-200" fill="currentColor" aria-hidden>
              <circle cx="7" cy="7" r="1.8"/>
              <circle cx="17" cy="7" r="1.8"/>
              <circle cx="7" cy="17" r="1.8"/>
              <circle cx="17" cy="17" r="1.8"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-72 sm:w-80 rounded-2xl bg-slate-800/95 text-white shadow-2xl border border-slate-700 p-4 space-y-3">
              <a href="https://beta.anket.ai" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-600 p-3 hover:bg-slate-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden className="h-10 w-10 p-1 rounded-md bg-white text-slate-800">
                  <path fill="currentColor" d="M14 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8l-6-6Zm0 2.5L18.5 9H14V4.5Z"/>
                </svg>
                <div>
                  <div className="font-semibold">Anket.ai</div>
                  <div className="text-xs text-slate-300">CV-гээ бүтээ</div>
                </div>
              </a>
              <a href="https://beta.zurag.ai" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-600 p-3 hover:bg-slate-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden className="h-10 w-10 p-1 rounded-md bg-white text-slate-800">
                  <path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.418 0-7.5 2.239-7.5 5v1h15v-1c0-2.761-3.082-5-7.5-5Z"/>
                </svg>
                <div>
                  <div className="font-semibold">Zurag.ai</div>
                  <div className="text-xs text-slate-300">Зураг бүтээ</div>
                </div>
              </a>
              <a href="https://lambda.global" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-600 p-3 hover:bg-slate-700 transition">
                {(() => {
                  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
                  const src = `${base}lamb-logo.png`;
                  return <img src={src} alt="Lambda" className="h-10 w-10 rounded-md bg-white object-contain p-1" />;
                })()}
                <div>
                  <div className="font-semibold">Lambda.global</div>
                  <div className="text-xs text-slate-300">Гоё ажилд орооч</div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


