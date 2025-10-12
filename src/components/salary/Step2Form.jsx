import React from 'react';

export default function Step2Form({
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
  // Industries (Step 2 source)
  const [industriesStep2, setIndustriesStep2] = React.useState([]);
  const [industriesStep2Loading, setIndustriesStep2Loading] = React.useState(false);
  const [industriesStep2Error, setIndustriesStep2Error] = React.useState('');

  // Industry combobox state
  const [industryOpen, setIndustryOpen] = React.useState(false);
  const [industryQuery, setIndustryQuery] = React.useState('');
  const [industryActiveIndex, setIndustryActiveIndex] = React.useState(0);
  const industryRef = React.useRef(null);

  // Majors for the selected industry
  const [majorsOptions, setMajorsOptions] = React.useState([]);
  const [majorOpen, setMajorOpen] = React.useState(false);
  const [majorQuery, setMajorQuery] = React.useState('');
  const [majorActiveIndex, setMajorActiveIndex] = React.useState(0);
  const majorRef = React.useRef(null);

  // Pro levels
  const [proLevels, setProLevels] = React.useState([]);
  const [proLevelsLoading, setProLevelsLoading] = React.useState(false);
  const [proLevelsError, setProLevelsError] = React.useState('');
  const [proLevelOpen, setProLevelOpen] = React.useState(false);
  const [proLevelQuery, setProLevelQuery] = React.useState('');
  const [proLevelActiveIndex, setProLevelActiveIndex] = React.useState(0);
  const proLevelRef = React.useRef(null);

  const [salaryOutOfRange, setSalaryOutOfRange] = React.useState(false);

  // Load industries (step2 endpoints)
  React.useEffect(() => {
    const extractList = (data) => {
      if (Array.isArray(data?.industries)) return data.industries;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    };
    const loadStep2 = async () => {
      setIndustriesStep2Loading(true);
      setIndustriesStep2Error('');
      try {
        let res = await fetch('http://localhost:3000/api/industries/position');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        let list = extractList(data);
        if (!list.length) throw new Error('Empty list');
        setIndustriesStep2(list);
      } catch (e1) {
        try {
          let res2 = await fetch('http://localhost:3000/api/industries/positions');
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          let data2 = await res2.json();
          setIndustriesStep2(extractList(data2));
        } catch (e2) {
          setIndustriesStep2Error('Failed to load industries');
          setIndustriesStep2([]);
          try { console.error('Step2 industries load failed', e1, e2); } catch {}
        }
      } finally {
        setIndustriesStep2Loading(false);
      }
    };
    loadStep2();
  }, []);

  // Load majors for an industry (prefer API)
  const fetchMajorsForIndustry = React.useCallback(async (industryId) => {
    if (!industryId) { setMajorsOptions([]); return; }
    try {
      const res = await fetch(`http://localhost:3000/api/industries/${industryId}/positions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setMajorsOptions(list);
    } catch (e) {
      setMajorsOptions([]);
    }
  }, []);

  // Load pro-levels
  React.useEffect(() => {
    const loadLevels = async () => {
      try {
        setProLevelsLoading(true);
        setProLevelsError('');
        const res = await fetch('http://localhost:3000/api/pro-levels');
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

  // Outside click handlers
  React.useEffect(() => {
    const onDoc = (e) => { if (!industryRef.current) return; if (!industryRef.current.contains(e.target)) setIndustryOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  React.useEffect(() => {
    const onDoc = (e) => { if (!majorRef.current) return; if (!majorRef.current.contains(e.target)) setMajorOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  React.useEffect(() => {
    const onDoc = (e) => { if (!proLevelRef.current) return; if (!proLevelRef.current.contains(e.target)) setProLevelOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const norm = (s) => (s || '').toString().toLowerCase();
  const qIndustry = norm(industryQuery);
  const filteredIndustriesStep2 = industriesStep2.filter((it) =>
    norm(it?.name_mn).includes(qIndustry) || norm(it?.name_en).includes(qIndustry)
  );
  const qMajor = norm(majorQuery);
  const filteredMajors = majorsOptions.filter((m) =>
    norm(m?.name_mn).includes(qMajor) || norm(m?.name_en).includes(qMajor)
  );
  const qPro = norm(proLevelQuery);
  const filteredProLevels = proLevels.filter((p) => norm(p?.name_mn).includes(qPro) || norm(p?.name_en).includes(qPro));

  React.useEffect(() => { if (industryOpen) setIndustryActiveIndex(0); }, [industryOpen, industryQuery]);
  React.useEffect(() => { if (majorOpen) setMajorActiveIndex(0); }, [majorOpen, majorQuery]);
  React.useEffect(() => { if (proLevelOpen) setProLevelActiveIndex(0); }, [proLevelOpen, proLevelQuery]);

  const chooseIndustry = (item) => {
    setForm((f) => ({ ...f, industry: item.name_mn, industryId: item._id, major: '', majorId: '', position: '', positionId: '' }));
    setIndustryOpen(false);
    if (item?._id) fetchMajorsForIndustry(item._id); else setMajorsOptions([]);
  };

  const handleIndustryKey = (e) => {
    if (!industryOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) { setIndustryOpen(true); return; }
    if (!filteredIndustriesStep2.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndustryActiveIndex((i) => Math.min(i + 1, filteredIndustriesStep2.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndustryActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); chooseIndustry(filteredIndustriesStep2[industryActiveIndex]); }
    else if (e.key === 'Escape') { setIndustryOpen(false); }
  };

  const chooseMajor = (item) => {
    setForm((f) => ({ ...f, major: item.name_mn, majorId: item._id }));
    setMajorOpen(false);
  };

  const handleMajorKey = (e) => {
    if (!majorOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) { setMajorOpen(true); return; }
    if (!filteredMajors.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setMajorActiveIndex((i) => Math.min(i + 1, filteredMajors.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setMajorActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); chooseMajor(filteredMajors[majorActiveIndex]); }
    else if (e.key === 'Escape') { setMajorOpen(false); }
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
      {/* Industry combobox with autocomplete */}
      <div ref={industryRef} className="relative">
        <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Салбараа сонгоно уу</div>
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${industryOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white`}
          onClick={() => setIndustryOpen(true)}
        >
          <input
            className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
            placeholder={industriesStep2Loading ? 'Уншиж байна...' : (form.industry || 'Салбар сонгоно уу')}
            value={industryOpen ? industryQuery : ''}
            onChange={(e) => { setIndustryQuery(e.target.value); setIndustryOpen(true); }}
            onFocus={() => { setIndustryOpen(true); setIndustryQuery(''); }}
            onKeyDown={handleIndustryKey}
          />
          <span className="ml-2 text-slate-400">▾</span>
        </div>
        {industryOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg">
            {industriesStep2Error && (
              <div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{industriesStep2Error}</div>
            )}
            {!industriesStep2Error && (filteredIndustriesStep2.length ? (
              filteredIndustriesStep2.map((it, idx) => {
                const selected = form.industryId && (form.industryId === (it._id ?? it.id));
                return (
                  <button
                    key={it._id ?? it.id}
                    type="button"
                    onClick={() => chooseIndustry(it)}
                    className={`w-full text-left px-3 py-2 ${idx===industryActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100`}
                  >
                    {it.name_mn}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">Үр дүн олдсонгүй</div>
            ))}
          </div>
        )}
      </div>

      {/* Major combobox with autocomplete */}
      <div ref={majorRef} className="relative">
        <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Мэргэжлийн төрөлөө сонгоно уу</div>
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${majorOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white ${!majorsOptions.length ? 'opacity-60 pointer-events-none' : ''}`}
          onClick={() => majorsOptions.length && setMajorOpen(true)}
        >
          <input
            className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
            placeholder={majorsOptions.length ? (form.major || 'Мэргэжил сонгоно уу') : 'Эхлээд салбар сонгоно уу'}
            value={majorOpen ? majorQuery : ''}
            onChange={(e) => { setMajorQuery(e.target.value); majorsOptions.length && setMajorOpen(true); }}
            onFocus={() => { majorsOptions.length && (setMajorOpen(true), setMajorQuery('')); }}
            onKeyDown={handleMajorKey}
            disabled={!majorsOptions.length}
          />
          <span className="ml-2 text-slate-400">▾</span>
        </div>
        {majorOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg">
            {filteredMajors.length ? (
              filteredMajors.map((m, idx) => {
                const selected = form.majorId && (form.majorId === (m._id ?? m.id));
                return (
                  <button
                    key={m._id ?? m.name_mn}
                    type="button"
                    onClick={() => chooseMajor(m)}
                    className={`w-full text-left px-3 py-2 ${idx===majorActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100`}
                  >
                    {m.name_mn}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">Үр дүн олдсонгүй</div>
            )}
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
            onFocus={() => { setProLevelOpen(true); setProLevelQuery(''); }}
            onKeyDown={handleProLevelKey}
          />
          <span className="ml-2 text-slate-400">▾</span>
        </div>
        {proLevelOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg">
            {proLevelsError && (<div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{proLevelsError}</div>)}
            {!proLevelsError && (filteredProLevels.length ? (
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


