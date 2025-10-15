import React from 'react';

export default function Step1Form({
  form,
  setForm,
  // Salary limits
  SALARY_MIN,
  SALARY_MAX,
  // Submit
  submitToBackend,
  canProceedStep1,
  posting,
  postError,
}) {
  // Local state: positions
  const [positions, setPositions] = React.useState([]);
  const [positionsLoading, setPositionsLoading] = React.useState(false);
  const [positionsError, setPositionsError] = React.useState('');

  // Local state: position combobox
  const [positionOpen, setPositionOpen] = React.useState(false);
  const [positionQuery, setPositionQuery] = React.useState('');
  const [positionActiveIndex, setPositionActiveIndex] = React.useState(0);
  const positionRef = React.useRef(null);

  // Local state: pro levels
  const [proLevels, setProLevels] = React.useState([]);
  const [proLevelsLoading, setProLevelsLoading] = React.useState(false);
  const [proLevelsError, setProLevelsError] = React.useState('');

  // Local state: pro level combobox
  const [proLevelOpen, setProLevelOpen] = React.useState(false);
  const [proLevelQuery, setProLevelQuery] = React.useState('');
  const [proLevelActiveIndex, setProLevelActiveIndex] = React.useState(0);
  const proLevelRef = React.useRef(null);

  // Local: salary range flag
  const [salaryOutOfRange, setSalaryOutOfRange] = React.useState(false);

  // Fetch positions (standalone list)
  React.useEffect(() => {
    const loadPositions = async () => {
      try {
        setPositionsLoading(true);
        setPositionsError('');
        const res = await fetch('/api/positions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setPositions(list);
      } catch (e) {
        setPositionsError('Failed to load positions');
        setPositions([]);
      } finally {
        setPositionsLoading(false);
      }
    };
    loadPositions();
  }, []);

  // Fetch pro levels
  React.useEffect(() => {
    const loadLevels = async () => {
      try {
        setProLevelsLoading(true);
        setProLevelsError('');
        const res = await fetch('/api/pro-levels');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setProLevels(list);
      } catch (e) {
        setProLevelsError('Failed to load levels');
        setProLevels([]);
      } finally {
        setProLevelsLoading(false);
      }
    };
    loadLevels();
  }, []);

  // Outside click handlers for comboboxes
  React.useEffect(() => {
    const onDoc = (e) => { if (!positionRef.current) return; if (!positionRef.current.contains(e.target)) setPositionOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  React.useEffect(() => {
    const onDoc = (e) => { if (!proLevelRef.current) return; if (!proLevelRef.current.contains(e.target)) setProLevelOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const norm = (s) => (s || '').toString().toLowerCase();
  const filteredPositions = positions.filter((p) => norm(p?.name_mn || p?.name_en || p?.name).includes(norm(positionQuery)));
  const qPro = norm(proLevelQuery);
  const filteredProLevels = proLevels.filter((p) => norm(p?.name_mn).includes(qPro) || norm(p?.name_en).includes(qPro));

  React.useEffect(() => { if (positionOpen) setPositionActiveIndex(0); }, [positionOpen, positionQuery]);
  React.useEffect(() => { if (proLevelOpen) setProLevelActiveIndex(0); }, [proLevelOpen, proLevelQuery]);

  const choosePosition = (item) => {
    const industryFromPosition = item.industry_id?._id || item.industry_id || item.industry?.id || '';
    const industryName = item.industry_id?.name_mn || item.industry?.name_mn || '';
    setForm((f)=>({
      ...f,
      position: item.name_mn || item.name_en || item.name || '',
      positionId: item._id || item.id || '',
      industryId: f.industryId || industryFromPosition,
      industry: f.industry || industryName
    }));
    setPositionOpen(false);
  };

  const handlePositionKey = (e) => {
    if (!positionOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) { setPositionOpen(true); return; }
    if (!filteredPositions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setPositionActiveIndex((i)=> Math.min(i+1, filteredPositions.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPositionActiveIndex((i)=> Math.max(i-1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); choosePosition(filteredPositions[positionActiveIndex]); }
    else if (e.key === 'Escape') { setPositionOpen(false); }
  };

  const chooseProLevel = (item) => {
    setForm((f) => ({ ...f, proLevelName: item.name_mn, proLevelId: item._id, proLevelLevel: item.level || item.order || 1 }));
    setProLevelOpen(false);
  };

  const handleProLevelKey = (e) => {
    if (!proLevelOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) { setProLevelOpen(true); return; }
    if (!filteredProLevels.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setProLevelActiveIndex((i) => Math.min(i + 1, filteredProLevels.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setProLevelActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); chooseProLevel(filteredProLevels[proLevelActiveIndex]); }
    else if (e.key === 'Escape') { setProLevelOpen(false); }
  };

  return (
    <div className="space-y-6">
      {/* Position combobox (standalone) */}
      <div ref={positionRef} className="relative">
        <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Мэргэжилээ сонгоно уу</div>
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${positionOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white`}
          onClick={() => setPositionOpen(true)}
        >
          <input
            className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
            placeholder={positionsLoading ? 'Уншиж байна...' : (form.position || 'Албан тушаал сонгоно уу')}
            value={positionOpen ? positionQuery : ''}
            onChange={(e) => { setPositionQuery(e.target.value); setPositionOpen(true); }}
            onFocus={() => { setPositionOpen(true); setPositionQuery(''); }}
            onKeyDown={handlePositionKey}
          />
          <span className="ml-2 text-slate-400">▾</span>
        </div>
        {positionOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg">
            {positionsError && (
              <div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{positionsError}</div>
            )}
            {!positionsError && (filteredPositions.length ? (
              filteredPositions.map((p, idx) => {
                const selected = form.positionId && (form.positionId === (p._id ?? p.id));
                return (
                  <button
                    key={p._id ?? p.id}
                    type="button"
                    onClick={() => choosePosition(p)}
                    className={`w-full text-left px-3 py-2 ${idx===positionActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100`}
                  >
                    {p.name_mn || p.name_en || p.name}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">Үр дүн олдсонгүй</div>
            ))}
          </div>
        )}
      </div>

      {/* Salary input */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-yellow-300 dark:text-red-600 mb-1 block">Цалин (₮)</label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-orange-400/10 to-red-500/10 group-focus-within:from-yellow-400/30 group-focus-within:to-red-500/20" />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="salary"
            value={form.salary}
            onChange={(e) => {
              const rawDigits = e.target.value.replace(/[^0-9]/g, '');
              const formatted = rawDigits ? Number(rawDigits).toLocaleString('en-US') : '';
              const n = rawDigits ? Number(rawDigits) : 0;
              setSalaryOutOfRange(Boolean(n) && (n < SALARY_MIN || n > SALARY_MAX));
              setForm((f) => ({ ...f, salary: formatted }));
            }}
            onBlur={(e) => {
              const rawDigits = e.target.value.replace(/[^0-9]/g, '');
              if (!rawDigits) { setSalaryOutOfRange(false); return; }
              let n = Number(rawDigits);
              if (n < SALARY_MIN) n = SALARY_MIN;
              if (n > SALARY_MAX) n = SALARY_MAX;
              setSalaryOutOfRange(false);
              setForm((f) => ({ ...f, salary: n.toLocaleString('en-US') }));
            }}
            className={`relative w-full rounded-2xl border-2 ${salaryOutOfRange ? 'border-red-600 focus:ring-red-600' : 'border-yellow-400 focus:ring-yellow-400'} dark:border-red-600 bg-slate-900/70 dark:bg-white text-slate-100 dark:text-slate-900 px-4 py-3 shadow-[0_0_0_3px_rgba(250,204,21,0.08)] dark:shadow-[0_0_0_3px_rgba(220,38,38,0.08)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-white`}
            placeholder="жишээ нь 2,500,000"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-yellow-300 dark:text-red-600 font-extrabold select-none">₮</div>
        </div>
        <div className={`text-xs ${salaryOutOfRange ? 'text-red-500' : 'text-slate-400 dark:text-slate-600'}`}>Хязгаар: {SALARY_MIN.toLocaleString('en-US')} — {SALARY_MAX.toLocaleString('en-US')} ₮</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300 dark:text-slate-700 mb-1 block">Туршлагын жил (1–45)</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name="years"
          value={form.years}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            let n = raw === '' ? '' : Math.max(1, Math.min(45, parseInt(raw, 10)));
            setForm((f) => ({ ...f, years: n.toString() }));
          }}
          onBlur={() => {
            setForm((f) => ({ ...f, years: (f.years === '' ? '1' : f.years) }));
          }}
          className="w-full rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white text-slate-100 dark:text-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 dark:focus:ring-offset-white"
          placeholder="1"
        />
      </div>

      {/* Professional level combobox */}
      <div ref={proLevelRef} className="relative">
        <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Ажлын түвшин сонгоно уу</div>
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${proLevelOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white`}
          onClick={() => setProLevelOpen(true)}
        >
          <input
            className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
            placeholder={proLevelsLoading ? 'Уншиж байна...' : (form.proLevelName || 'Ажлын түвшин сонгоно уу')}
            value={proLevelOpen ? proLevelQuery : ''}
            onChange={(e) => { setProLevelQuery(e.target.value); setProLevelOpen(true); }}
            onFocus={() => { setProLevelOpen(true); }}
            onKeyDown={handleProLevelKey}
          />
          <span className="ml-2 text-slate-400">▾</span>
        </div>
        {proLevelOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg">
            {proLevelsError && (<div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{proLevelsError}</div>)}
            {!proLevelsError && (filteredProLevels?.length ? (
              filteredProLevels.map((p, idx) => {
                const selected = form.proLevelId && (form.proLevelId === (p._id ?? p.id));
                return (
                  <button
                    key={p._id ?? p.id}
                    type="button"
                    onClick={() => chooseProLevel(p)}
                    className={`w-full text-left px-3 py-2 ${idx===proLevelActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100`}
                  >
                    {p.name_mn}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">Үр дүн олдсонгүй</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={submitToBackend} disabled={!canProceedStep1 || posting} className="h-12 px-6 rounded-2xl bg-[#fbd433] text-black dark:bg-[#fbd433] dark:text-black flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:pointer-events-none">{posting ? 'Илгээж байна...' : 'ЦАЛИНГАА ОРУУЛАХ'}</button>
      </div>
      {postError && <div className="text-red-500 text-sm text-right">{postError}</div>}
    </div>
  );
}


