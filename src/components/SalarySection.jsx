import React from 'react';
import { createPortal } from 'react-dom';
import logoRed1 from '/logo-svg/Symbol-Outlined-Red.svg';
import logoWhite from '/logo-svg/Symbol-White.svg';
import logoRed from '/logo-svg/Symbol-Outlined-Red.svg';
import logoYellow from '/logo-svg/Symbol Outlined Yellow.svg';
import logoBlack from '/logo-svg/Symbol Black.svg';
import logYelloSymbol from '/logo-svg/Symbol Outlined Yellow.svg';
import MainWhite from '/logo-svg/Main-White.svg';
import SymbolYellow from '/logo-svg/Symbol-Red.svg';
import PostModalChart from './PostModalChart.jsx';
export default function SalarySection({ compact = false, isUnlocked: externalIsUnlocked, setIsUnlocked: setExternalIsUnlocked, forceStep1, setForceStep1 }) {
  const [industries, setIndustries] = React.useState([]);
  const [industriesLoading, setIndustriesLoading] = React.useState(false);
  const [industriesError, setIndustriesError] = React.useState('');
  // Separate Step 2 industries source
  const [industriesStep2, setIndustriesStep2] = React.useState([]);
  const [industriesStep2Loading, setIndustriesStep2Loading] = React.useState(false);
  const [industriesStep2Error, setIndustriesStep2Error] = React.useState('');
  const [positionsForIndustry, setPositionsForIndustry] = React.useState([]);
  const [proLevels, setProLevels] = React.useState([]);
  const [proLevelsLoading, setProLevelsLoading] = React.useState(false);
  const [proLevelsError, setProLevelsError] = React.useState('');
  const [majorOpen, setMajorOpen] = React.useState(false);
  const [majorQuery, setMajorQuery] = React.useState('');
  const [majorActiveIndex, setMajorActiveIndex] = React.useState(0);
  const majorRef = React.useRef(null);
  const positionListRef = React.useRef(null);

  const [form, setForm] = React.useState({
    role: '',
    location: [],
    industry: '',
    industryId: '',
    major: '',
    majorId: '',
    position: '',
    positionId: '',
    proLevelName: '',
    proLevelId: '',
    proLevelLevel: '',
    years: '1',
    salary: '',
    file: null
  });
  const [step, setStep] = React.useState(1);
  const [submitted, setSubmitted] = React.useState(false);
  const [congratsOpen, setCongratsOpen] = React.useState(false);
  const SALARY_MIN = 792000; // ₮
  const SALARY_MAX = 20000000; // ₮
  const [salaryOutOfRange, setSalaryOutOfRange] = React.useState(false);
  const [rangeMoved, setRangeMoved] = React.useState(false);
  const yearsOptions = React.useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);

  // Unlock state management
  const [isUnlocked, setIsUnlocked] = React.useState(false);

  // Always use salary counter for unlock logic, ignore external state for steps
  const currentIsUnlocked = isUnlocked; // Always use internal salary counter logic
  const setCurrentIsUnlocked = (value) => {
    setIsUnlocked(value);
  };

  // Check unlock status from localStorage based on salary submission counter
  React.useEffect(() => {
    const salaryCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
    const unlocked = salaryCount >= 1;
    console.log('SalarySection: salary count:', salaryCount, 'unlocked:', unlocked);
    setCurrentIsUnlocked(unlocked);
  }, []);

  // Reset rangeMoved when step changes
  React.useEffect(() => {
    setRangeMoved(false);
  }, [step]);

  // Handle forceStep1 prop
  React.useEffect(() => {
    if (forceStep1) {
      console.log('ForceStep1 triggered, setting step to 1');
      setStep(1);
      if (setForceStep1) {
        setForceStep1(false); // Reset the flag
      }
    }
  }, [forceStep1, setForceStep1]);

  // Debug unlock state changes
  React.useEffect(() => {
    console.log('currentIsUnlocked changed to:', currentIsUnlocked);
  }, [currentIsUnlocked]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [postError, setPostError] = React.useState('');
  const [aiPositions, setAiPositions] = React.useState([]);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [uploadResult, setUploadResult] = React.useState(null);
  const [postModalOpen, setPostModalOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  const fetchPositionsForIndustryLocal = React.useCallback(async (industryId) => {
    if (!industryId) { setPositionsForIndustry([]); return; }
    try {
      const res = await fetch(`https://tsalin-ai.onrender.com/api/industries/${industryId}/positions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setPositionsForIndustry(list);
    } catch (_) {
      setPositionsForIndustry([]);
    }
  }, []);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains('dark'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const getCdnBase = () => ((import.meta?.env?.VITE_CDN_BASE) || 'https://d2a545h9vqk30n.cloudfront.net').replace(/\/$/, '');

  React.useEffect(() => {
    const load = async () => {
      try {
        setIndustriesLoading(true);
        setIndustriesError('');
        // Load industries WITH majors
        const res = await fetch('https://tsalin-ai.onrender.com/api/majors');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Expected shape: { success, count, industries: [...] }
        if (Array.isArray(data?.industries)) {
          setIndustries(data.industries);
        } else if (Array.isArray(data?.data)) {
          setIndustries(data.data);
        } else if (Array.isArray(data)) {
          setIndustries(data);
        } else {
          setIndustries([]);
        }
      } catch (e) {
        setIndustriesError('Failed to load industries');
        setIndustries([]);
      } finally {
        setIndustriesLoading(false);
      }
    };
    load();
  }, []);

  // Step 2 industries/positions source
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
        // Use plural endpoint as the single source for Step 2
        const res = await fetch('https://tsalin-ai.onrender.com/api/industries/positions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setIndustriesStep2(extractList(data));
      } catch (e) {
        setIndustriesStep2Error('Failed to load industries');
        setIndustriesStep2([]);
        try { console.error('Step2 industries load failed', e); } catch {}
      } finally {
        setIndustriesStep2Loading(false);
      }
    };
    loadStep2();
  }, []);

  // Load professional levels
  React.useEffect(() => {
    const loadLevels = async () => {
      try {
        setProLevelsLoading(true);
        setProLevelsError('');
        const res = await fetch('https://tsalin-ai.onrender.com/api/pro-levels');
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

  // Load positions (standalone)
  const [positions, setPositions] = React.useState([]);
  const [positionsLoading, setPositionsLoading] = React.useState(false);
  const [positionsError, setPositionsError] = React.useState('');
  React.useEffect(() => {
    const loadPositions = async () => {
      try {
        setPositionsLoading(true);
        setPositionsError('');
        const res = await fetch('https://tsalin-ai.onrender.com/api/positions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.positions)
          ? data.positions
          : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
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

  const toggleInArray = (key, value) => {
    setForm((f) => {
      const set = new Set(f[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [key]: Array.from(set) };
    });
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = (e) => {
    e?.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    console.log('Post payload', form);
    setModalOpen(true);
  };

  const formatCurrency = (n) => {
    try {
      return typeof n === 'number' ? n.toLocaleString('mn-MN') : n;
    } catch { return n; }
  };

  const StepIndicator = () => (
    <div className="mb-6">
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );

  const handleFileSelect = (file) => {
    if (!file) return;
    setForm((f) => ({ ...f, file }));
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    handleFileSelect(file);
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  // Helper: call AI analyze endpoint with a URL
  const doAnalyzeResumeUrl = async (url) => {
    const normalizedUrl = (url || '').replace(/^https:\/\//i, 'http://');
    const aiRes = await fetch('https://tsalin-ai.onrender.com/api/ai/claude/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeUrl: normalizedUrl })
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(t || `Analyze HTTP ${aiRes.status}`);
    }
    const aiData = await aiRes.json();
    return Array.isArray(aiData?.result) ? aiData.result : (Array.isArray(aiData?.data) ? aiData.data : []);
  };

  // 1) Upload only, show upload response to user
  const uploadCv = async () => {
    if (!form.file) { setUploadError('Файл сонгоно уу'); return; }
    try {
      setUploading(true);
      setUploadError('');
      const fd = new FormData();
      fd.append('file', form.file);
      const res = await fetch('https://tsalin-ai.onrender.com/api/upload/cv', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload HTTP ${res.status}`);
      const data = await res.json();
      const base = getCdnBase();
      const key = data?.key || '';
      const safeKey = key.split('/').filter(Boolean).map(encodeURIComponent).join('/');
      const cdnUrl = key ? `${base}/${safeKey}` : (data?.url || '');
      setUploadResult({ ...data, cdnUrl });
    } catch (e) {
      setUploadError(e?.message || 'Файл илгээхэд алдаа гарлаа');
      setUploadResult(null);
    } finally {
      setUploading(false);
    }
  };

  // Upload CV then analyze
  const analyzeResume = async () => {
    if (!form.file) { setAnalyzeError('Файл сонгоно уу'); return; }
    try {
      setAnalyzing(true);
      setAnalyzeError('');
      const fd = new FormData();
      fd.append('file', form.file);
      const uploadRes = await fetch('https://tsalin-ai.onrender.com/api/upload/cv', { method: 'POST', body: fd });
      if (!uploadRes.ok) throw new Error(`Upload HTTP ${uploadRes.status}`);
      const uploadData = await uploadRes.json();
      const resumeUrlUploaded = uploadData?.url;
      const resumeKey = uploadData?.key;
      if (!resumeUrlUploaded && !resumeKey) throw new Error('Upload response missing url/key');

      let list = [];
      const cdnBase = getCdnBase();
      const candidates = [];
      const pushIf = (u) => { if (u && !candidates.includes(u)) candidates.push(u); };
      if (resumeKey) {
        const segments = resumeKey.split('/').filter(Boolean);
        const safeKey = segments.map(encodeURIComponent).join('/');
        pushIf(`${cdnBase}/${safeKey}`);
      }
      if (resumeUrlUploaded) pushIf(resumeUrlUploaded);
      if (resumeKey) {
        const base = cdnBase;
        const segments = resumeKey.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || '';
        const lastNoExt = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
        const safeKey = segments.map(encodeURIComponent).join('/');
        // Common mappings (additional)
        pushIf(`${base}/${encodeURIComponent(last)}`); // cdn + basename
        if (segments.length > 1) {
          pushIf(`${base}/${segments.slice(1).map(encodeURIComponent).join('/')}`); // drop first dir
        }
        // Sometimes without extension
        if (lastNoExt) {
          pushIf(`${base}/${encodeURIComponent(lastNoExt)}`);
          pushIf(`${base}/resumes/${encodeURIComponent(lastNoExt)}`);
        }
        // Explicit resumes prefix variants
        pushIf(`${base}/resumes/${encodeURIComponent(last)}`);
        if (segments.length > 1) {
          pushIf(`${base}/resumes/${segments.slice(1).map(encodeURIComponent).join('/')}`);
        }
      }
      try { console.debug('Analyze resume URL candidates:', candidates); } catch {}
      // Try each candidate URL until success
      for (const url of candidates) {
        try {
          const attempt = await doAnalyzeResumeUrl(url);
          if (attempt && attempt.length) { list = attempt; break; }
        } catch (_) { /* try next */ }
      }

      if (!list || !list.length) throw new Error('AI-с үр дүн ирсэнгүй');
      setAiPositions(list);
      setModalOpen(true);
    } catch (e) {
      setAnalyzeError(e?.message || 'Алдаа гарлаа');
      setAiPositions([]);
    } finally {
      setAnalyzing(false);
    }
  };

  // 2) Analyze using already uploaded result
  const analyzeFromUpload = async () => {
    if (!uploadResult?.url && !uploadResult?.key) { setAnalyzeError('Upload амжилттай юу гэдгээ шалгана уу'); return; }
    try {
      setAnalyzing(true);
      setAnalyzeError('');
      const cdnBase = getCdnBase();
      const candidates = [];
      const pushIf = (u) => { if (u && !candidates.includes(u)) candidates.push(u); };
      const resumeUrlUploaded = uploadResult?.url;
      const resumeKey = uploadResult?.key;
      if (uploadResult?.cdnUrl) pushIf(uploadResult.cdnUrl);
      if (resumeUrlUploaded) pushIf(resumeUrlUploaded);
      if (resumeKey) {
        const base = cdnBase;
        const segments = resumeKey.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || '';
        const lastNoExt = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
        const safeKey = segments.map(encodeURIComponent).join('/');
        pushIf(`${base}/${safeKey}`);
        pushIf(`${base}/${encodeURIComponent(last)}`);
        if (segments.length > 1) pushIf(`${base}/${segments.slice(1).map(encodeURIComponent).join('/')}`);
        if (lastNoExt) {
          pushIf(`${base}/${encodeURIComponent(lastNoExt)}`);
          pushIf(`${base}/resumes/${encodeURIComponent(lastNoExt)}`);
        }
        pushIf(`${base}/resumes/${encodeURIComponent(last)}`);
        if (segments.length > 1) pushIf(`${base}/resumes/${segments.slice(1).map(encodeURIComponent).join('/')}`);
      }
      try { console.debug('Analyze (from upload) URL candidates:', candidates); } catch {}
      let list = [];
      for (const url of candidates) {
        try {
          const attempt = await doAnalyzeResumeUrl(url);
          if (attempt && attempt.length) { list = attempt; break; }
        } catch (_) { /* try next */ }
      }
      if (!list || !list.length) throw new Error('AI-с үр дүн ирсэнгүй');
      setAiPositions(list);
      setModalOpen(true);
    } catch (e) {
      setAnalyzeError(e?.message || 'Алдаа гарлаа');
      setAiPositions([]);
    } finally {
      setAnalyzing(false);
    }
  };

  // Single action: upload then analyze, then open modal
  const uploadAndAnalyze = async () => {
    if (!form.file) { setUploadError('Файл сонгоно уу'); return; }
    try {
      setUploadError('');
      setAnalyzeError('');
      setUploading(true);
      // Upload
      const fd = new FormData();
      fd.append('file', form.file);
      const res = await fetch('https://tsalin-ai.onrender.com/api/upload/cv', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload HTTP ${res.status}`);
      const data = await res.json();
      const base = getCdnBase();
      const key = data?.key || '';
      const safeKey = key.split('/').filter(Boolean).map(encodeURIComponent).join('/');
      const cdnUrl = key ? `${base}/${safeKey}` : (data?.url || '');
      const uploadData = { ...data, cdnUrl };
      setUploadResult(uploadData);

      // Analyze
      setAnalyzing(true);
      const candidates = [];
      const pushIf = (u) => { if (u && !candidates.includes(u)) candidates.push(u); };
      if (uploadData.cdnUrl) pushIf(uploadData.cdnUrl);
      if (uploadData.url) pushIf(uploadData.url);
      if (key) {
        const segments = key.split('/').filter(Boolean);
        const last = segments[segments.length - 1] || '';
        const lastNoExt = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
        const safe = segments.map(encodeURIComponent).join('/');
        pushIf(`${base}/${safe}`);
        pushIf(`${base}/${encodeURIComponent(last)}`);
        if (segments.length > 1) pushIf(`${base}/${segments.slice(1).map(encodeURIComponent).join('/')}`);
        if (lastNoExt) {
          pushIf(`${base}/${encodeURIComponent(lastNoExt)}`);
          pushIf(`${base}/resumes/${encodeURIComponent(lastNoExt)}`);
        }
        pushIf(`${base}/resumes/${encodeURIComponent(last)}`);
        if (segments.length > 1) pushIf(`${base}/resumes/${segments.slice(1).map(encodeURIComponent).join('/')}`);
      }
      let list = [];
      for (const url of candidates) {
        try {
          const attempt = await doAnalyzeResumeUrl(url);
          if (attempt && attempt.length) { list = attempt; break; }
        } catch (_) { /* try next */ }
      }
      if (!list || !list.length) throw new Error('AI-с үр дүн ирсэнгүй');
      setAiPositions(list);
      setModalOpen(true);
    } catch (e) {
      // Prefer analyze error text for user
      setAnalyzeError(e?.message || 'Алдаа гарлаа');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Custom Industry Combobox (no external deps)
  const [industryOpen, setIndustryOpen] = React.useState(false);
  const [industryQuery, setIndustryQuery] = React.useState('');
  const [industryActiveIndex, setIndustryActiveIndex] = React.useState(0);
  const industryRef = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!industryRef.current) return;
      if (!industryRef.current.contains(e.target)) {
        setIndustryOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const norm = (s) => (s || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  const qIndustry = norm(industryQuery);
  const filteredIndustries = industries.filter((it) =>
    norm(it?.name_mn).includes(qIndustry) || norm(it?.name_en).includes(qIndustry)
  );
  const filteredIndustriesStep2 = industriesStep2.filter((it) =>
    norm(it?.name_mn).includes(qIndustry) || norm(it?.name_en).includes(qIndustry)
  );

  React.useEffect(() => {
    if (industryOpen) setIndustryActiveIndex(0);
  }, [industryQuery, industryOpen]);

  const chooseIndustry = (item) => {
    setForm((f) => ({ ...f, industry: item.name_mn, industryId: item._id, major: '', majorId: '', position: '', positionId: '' }));
    setIndustryOpen(false);
    if (Array.isArray(item?.positions) && item.positions.length) {
      setPositionsForIndustry(item.positions);
    } else if (item?._id) {
      fetchPositionsForIndustryLocal(item._id);
    } else {
      setPositionsForIndustry([]);
    }
  };

  const handleIndustryKey = (e) => {
    if (!industryOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIndustryOpen(true);
      return;
    }
    if (!filteredIndustries.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndustryActiveIndex((i) => Math.min(i + 1, filteredIndustries.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndustryActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      chooseIndustry(filteredIndustries[industryActiveIndex]);
    } else if (e.key === 'Escape') {
      setIndustryOpen(false);
    }
  };

  // Position combobox
  const [positionOpen, setPositionOpen] = React.useState(false);
  const [positionQuery, setPositionQuery] = React.useState('');
  const [positionActiveIndex, setPositionActiveIndex] = React.useState(0);
  const positionRef = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (!positionRef.current) return; if (!positionRef.current.contains(e.target)) setPositionOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const qPos = norm(positionQuery);
  const filteredPositions = positions.filter((p) => {
    const a = norm(p?.name_mn);
    const b = norm(p?.name_en);
    const c = norm(p?.name);
    return (a && a.includes(qPos)) || (b && b.includes(qPos)) || (c && c.includes(qPos));
  });
  React.useEffect(() => { if (positionOpen) setPositionActiveIndex(0); }, [positionOpen, positionQuery]);
  const choosePosition = (item) => {
    const industryFromPosition = item.industry_id?._id || item.industry_id || item.industry?.id || '';
    const industryName = item.industry_id?.name_mn || item.industry?.name_mn || '';
    setForm((f)=>({
      ...f,
      position: item.name_mn || item.name_en || item.name || '',
      positionId: item._id || item.id || '',
      industryId: industryFromPosition,
      industry: industryName
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

  // Sync majors when industry preselected
  React.useEffect(() => {
    if (!form.industryId) { setPositionsForIndustry([]); return; }
    const it = industriesStep2.find((x) => String(x?._id || x?.id) === String(form.industryId));
    if (it && Array.isArray(it.positions) && it.positions.length) { setPositionsForIndustry(it.positions); return; }
    fetchPositionsForIndustryLocal(form.industryId);
  }, [industriesStep2, form.industryId, fetchPositionsForIndustryLocal]);


  React.useEffect(() => {
    const onDoc = (e) => {
      if (!majorRef.current) return;
      if (!majorRef.current.contains(e.target)) {
        setMajorOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const qMajor = norm(majorQuery);
  const filteredMajors = positionsForIndustry.filter((m) =>
    norm(m?.name_mn).includes(qMajor) || norm(m?.name_en).includes(qMajor) || norm(m?.name).includes(qMajor)
  );

  React.useEffect(() => {
    if (majorOpen) setMajorActiveIndex(0);
  }, [majorQuery, majorOpen, positionsForIndustry]);

  const choosePositionFromIndustry = (item) => {
    setForm((f) => ({
      ...f,
      position: item.name_mn || item.name_en || item.name || '',
      positionId: item._id || item.id || ''
    }));
    setMajorOpen(false);
  };

  const handleMajorKey = (e) => {
    if (!majorOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setMajorOpen(true);
      return;
    }
    if (!filteredMajors.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMajorActiveIndex((i) => Math.min(i + 1, filteredMajors.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMajorActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choosePositionFromIndustry(filteredMajors[majorActiveIndex]);
    } else if (e.key === 'Escape') {
      setMajorOpen(false);
    }
  };

  // Professional level combobox
  const [proLevelOpen, setProLevelOpen] = React.useState(false);
  const [proLevelQuery, setProLevelQuery] = React.useState('');
  const [proLevelActiveIndex, setProLevelActiveIndex] = React.useState(0);
  const proLevelRef = React.useRef(null);
  const proLevelListRef = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!proLevelRef.current) return;
      if (!proLevelRef.current.contains(e.target)) {
        setProLevelOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

//   const norm = (s) => (s || '').toString().toLowerCase();
  const qPro = norm(proLevelQuery);
  const filteredProLevels = proLevels.filter((p) => norm(p?.name_mn).includes(qPro) || norm(p?.name_en).includes(qPro));

  React.useEffect(() => { if (proLevelOpen) setProLevelActiveIndex(0); }, [proLevelOpen, proLevelQuery]);

  const chooseProLevel = (item) => {
    setForm((f) => ({ ...f, proLevelName: item.name_mn, proLevelId: item._id, proLevelLevel: item.level || item.order || 1 }));
    setProLevelOpen(false);
  };

  const handleProLevelKey = (e) => {
    if (!proLevelOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) { setProLevelOpen(true); return; }
    if (!filteredProLevels.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); const next = Math.min(proLevelActiveIndex + 1, filteredProLevels.length - 1); setProLevelActiveIndex(next); requestAnimationFrame(()=>{
      const c = proLevelListRef.current; if (!c) return; const items = c.querySelectorAll('[data-pro-level-item="1"]'); const el = items[next]; if (el) el.scrollIntoView({ block: 'nearest' });
    }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const prev = Math.max(proLevelActiveIndex - 1, 0); setProLevelActiveIndex(prev); requestAnimationFrame(()=>{
      const c = proLevelListRef.current; if (!c) return; const items = c.querySelectorAll('[data-pro-level-item="1"]'); const el = items[prev]; if (el) el.scrollIntoView({ block: 'nearest' });
    }); }
    else if (e.key === 'Enter') { e.preventDefault(); chooseProLevel(filteredProLevels[proLevelActiveIndex]); }
    else if (e.key === 'Escape') { setProLevelOpen(false); }
  };
+  React.useEffect(() => { if (proLevelOpen) { const c = proLevelListRef.current; if (!c) return; const items = c.querySelectorAll('[data-pro-level-item="1"]'); const el = items[proLevelActiveIndex]; if (el) el.scrollIntoView({ block: 'nearest' }); } }, [proLevelOpen, proLevelActiveIndex]);

  const UploadStep = () => (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={onDrop}
      className="space-y-4"
    >
      <div className="text-sm text-slate-300 dark:text-slate-700">Та cv гээ оруулсанаар бид таныг ямар салбарт ямар албан тушаалуудад хэдэн төгрөгний цалинтай ажиллах боломжтойг тооцоолж өгнө </div>
      <label className="block">
        <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={onPick} className="hidden" />
        <div className="rounded-2xl border-2 border-dashed border-slate-700 dark:border-gray-300 bg-slate-800/40 dark:bg-white/60 px-6 py-10 text-center cursor-pointer hover:bg-slate-800/60 dark:hover:bg-white/80 transition">
          <div className="text-slate-100 dark:text-slate-900 font-medium">Дарах юмуу чирч оруулж болно</div>
          <div className="text-xs mt-1 text-slate-400 dark:text-slate-600">PDF, DOCX (хамгийн ихдээ ~10MB)</div>
        </div>
      </label>

      {form.file && (
        <div className="flex items-center justify-between rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800/60 dark:bg-white/70 px-4 py-3">
          <div className="text-slate-100 dark:text-slate-900 text-sm">
            <span className="font-medium">{form.file.name}</span>
            <span className="ml-2 text-slate-400 dark:text-slate-600">{(form.file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button type="button" onClick={() => setForm((f) => ({ ...f, file: null }))} className="px-3 py-1.5 rounded-md border border-slate-700 dark:border-gray-300 text-slate-100 dark:text-slate-900">Remove</button>
        </div>
      )}

      {/* Upload & analyze controls */}
      <div className="space-y-2 pt-2">
        <div className="md:col-span-2 flex justify-between">
          {/* <button onClick={back} className="px-4 py-2 rounded-xl border border-slate-700 dark:border-gray-300 text-slate-100 dark:text-slate-900">Back</button> */}
          <button onClick={uploadAndAnalyze} disabled={!form.file || uploading || analyzing} className="h-12 px-6 rounded-2xl bg-[#fbd433] text-black dark:bg-[#fbd433] dark:text-black flex items-center justify-center text-base font-semibold disabled:opacity-50">{uploading ? 'Илгээж байна.' : analyzing ? 'Таньд тохирох ажлын саналыг боловсруулж байна.' : 'Файл илгээх'}</button>
        </div>
        {/* <div className="text-xs text-slate-400 dark:text-slate-600 space-y-1">
          <div className={`${(!uploading && !analyzing) ? 'text-slate-200 dark:text-slate-800 font-medium' : ''}`}>1. Файл илгээх.</div>
          <div className={`${uploading ? 'text-slate-200 dark:text-slate-800 font-medium' : ''}`}>2. Илгээж байна.</div>
          <div className={`${analyzing ? 'text-slate-200 dark:text-slate-800 font-medium' : ''}`}>3. Таньд тохирох ажлын саналыг боловсруулж байна.</div>
        </div>
        {uploadResult && (
          <div className="rounded-2xl border border-slate-700 dark:border-gray-300 bg-slate-800/40 dark:bg-white/60 px-4 py-3 text-xs text-slate-300 dark:text-slate-700 space-y-1">
            <div><span className="opacity-70">success:</span> <span>{String(uploadResult.success ?? true)}</span></div>
            <div><span className="opacity-70">bucket:</span> <span>{uploadResult.bucket || '—'}</span></div>
            <div><span className="opacity-70">key:</span> <span className="break-all">{uploadResult.key || '—'}</span></div>
            <div><span className="opacity-70">url:</span> <span className="break-all">{uploadResult.url || '—'}</span></div>
            <div><span className="opacity-70">cdnUrl:</span> <span className="break-all">{uploadResult.cdnUrl || '—'}</span></div>
            <div className="flex gap-4 flex-wrap">
              <span className="opacity-70">size:</span>
              <span>{uploadResult.size ? `${(uploadResult.size/1024/1024).toFixed(2)} MB (${uploadResult.size} bytes)` : '—'}</span>
              <span className="opacity-70">contentType:</span>
              <span>{uploadResult.contentType || '—'}</span>
            </div>
          </div>
        )} */}
        {(uploadError || analyzeError) && (<div className="text-red-500 text-sm">{uploadError || analyzeError}</div>)}
      </div>
    </div>
  );

  // Step 1 validation: require (industry+major OR position), plus pro level and years
  const hasIndustryMajor = Boolean(form.industryId && form.majorId);
  const hasPositionOnly = Boolean(form.positionId);
  const canProceedStep1 = Boolean((hasIndustryMajor || hasPositionOnly) && form.proLevelId && form.years !== '' && rangeMoved);
  // Step 2 validation: require industry, major, years, pro level
  const canProceedStep2 = Boolean(form.positionId && form.salary);

  // Submit to backend
  const submitToBackend = async () => {
    try {
      setPosting(true);
      setPostError('');
      // Parse salary digits if present (may be formatted with commas)
      const salaryDigits = (form.salary || '').toString().replace(/[^0-9]/g, '');
      const salaryNum = salaryDigits ? Number(salaryDigits) : 0;

      // Ensure industry_id is present: prefer explicit industry, else infer from selected position
      let industryIdFinal = form.industryId;
      if (!industryIdFinal && form.positionId) {
        const p = positions.find((x) => (x._id || x.id) === form.positionId);
        industryIdFinal = p?.industry_id?._id || p?.industry_id || p?.industry?.id || '';
      }
      if (!industryIdFinal) {
        throw new Error('Салбар (industry) дутуу байна. Та мэргэжил сонгох үед салбар автоматаар бөглөгдөнө — эсвэл салбараа гараар сонгоно уу.');
      }

      const payload = {
        industry_id: industryIdFinal,
        position_id: form.positionId,
        source: 'user_submission',
        salary: salaryNum,
        level: Number(form.proLevelLevel || 1),
        experience_years: Number((form.years || '0').replace(/[^0-9]/g, '')),
        is_verified: false
      };
      const res = await fetch('https://tsalin-ai.onrender.com/api/salary-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setCongratsOpen(true);
      
      // Increment salary submission counter
      const currentCount = parseInt(localStorage.getItem('salarySubmissionCount') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('salarySubmissionCount', newCount.toString());
      
      console.log('Salary submitted successfully, count:', newCount);
      
      // Unlock the application after successful submission (if count >= 1)
      const unlocked = newCount >= 1;
      setCurrentIsUnlocked(unlocked);
      
      // Dispatch custom event to notify App component
      window.dispatchEvent(new CustomEvent('salarySubmitted', { 
        detail: { count: newCount, unlocked: unlocked } 
      }));
    } catch (e) {
      setPostError(e?.message || 'Failed to submit');
    } finally {
      setPosting(false);
    }
  };
  // Step 2: open summary modal with basic validation (no backend call)
  const submitToBackend2 = () => {
    setPostError('');
    const missing = [];
    if (!form.positionId) missing.push('Албан тушаал');
    if (!form.salary || form.salary === '') missing.push('Авч буй цалин');
    if (missing.length) {
      setPostError(`Дутуу: ${missing.join(', ')} оруулна уу` );
      return;
    }
    setPostModalOpen(true);
  };

  const cardInner = (
    <div className="bg-[#020202] text-white dark:bg-white dark:text-slate-900 backdrop-blur-xl border border-slate-800/70 dark:border-gray-200/70 rounded-3xl px-5 py-6 sm:px-8 md:px-12 shadow-xl transition duration-300 ease-out hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:-translate-y-0.5">
      <StepIndicator />
      <h2 className="font-firs text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight font-extrabold mb-3 text-slate-100 dark:text-slate-900">{step===1?'ТА ХЭДЭН ТӨГРӨГНИЙ ЦАЛИН АВДАГ ВЭ?':step===2?'ТА ХЭР ШУДАРГА ЦАЛИН АВЧ БАЙГАА ВЭ':'RESUME ОРУУЛААД БОЛОМЖИТ ЦАЛИНГАА БОДУУЛААРАЙ'}</h2>
      {/* <p className="text-slate-300 dark:text-slate-600 mb-6">Бид таны боломжит цалинг тооцолж өгөх боломжтой.</p> */}

      {step === 1 && (
        <div className="space-y-6">
          {/* Position combobox (standalone) */}
          <div ref={positionRef} className="relative">
            <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Албан тушаалаа оруулна уу</div>
            
            <div
              className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${positionOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white`}
              onClick={() => setPositionOpen(true)}
            >
              <input
                className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
                placeholder={positionsLoading ? 'Уншиж байна...' : (form.position || 'Сонгох юмуу бичнэ үү')}
                value={positionOpen ? positionQuery : ''}
                onChange={(e) => { setPositionQuery(e.target.value); setPositionOpen(true); }}
                onFocus={() => { setPositionOpen(true); setPositionQuery(''); }}
                onKeyDown={handlePositionKey}
              />
              {Boolean(form.position || positionQuery) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForm((f)=>({ ...f, position:'', positionId:'' })); setPositionQuery(''); }}
                  className="ml-2 rounded-md px-2 py-1 text-xs bg-slate-700 text-slate-100 dark:bg-gray-200 dark:text-slate-800 hover:opacity-80"
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
              <span className="ml-2 text-slate-400">▾</span>
              
            </div>
            
            {positionOpen && (
              <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg" onMouseLeave={()=> setPositionOpen(false)}>
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
          <div className={`text-xs ${salaryOutOfRange ? 'text-red-500' : 'text-slate-400 dark:text-slate-600'}`}>Жишээ нь: Програм хангамжийн инженер / Software Engineer</div>
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
              {Boolean(form.proLevelName || proLevelQuery) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForm((f)=>({ ...f, proLevelName:'', proLevelId:'', proLevelLevel: undefined })); setProLevelQuery(''); }}
                  className="ml-2 rounded-md px-2 py-1 text-xs bg-slate-700 text-slate-100 dark:bg-gray-200 dark:text-slate-800 hover:opacity-80"
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
              <span className="ml-2 text-slate-400">▾</span>
            </div>
            {proLevelOpen && (
              <div ref={proLevelListRef} className="absolute z-20 mt-1 w-full max-h-96 overflow-y-auto overscroll-contain rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg scroll-smooth" onMouseLeave={()=> setProLevelOpen(false)}>
                {proLevelsError && (<div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{proLevelsError}</div>)}
                {!proLevelsError && (filteredProLevels.length ? (
                  filteredProLevels.map((p, idx) => {
                    const selected = form.proLevelId && (form.proLevelId === (p._id ?? p.id));
                    return (
                      <button
                        key={p._id ?? p.id}
                        type="button"
                        onClick={() => chooseProLevel(p)}
                        data-pro-level-item="1"
                        className={`w-full text-left px-3 py-2 ${idx===proLevelActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100 focus:outline-none`}
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
          {/* Salary input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-yellow-300 dark:text-red-600 mb-1 block">Авч буй цалин (₮)</label>
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
            <label className="text-sm text-slate-300 dark:text-slate-700 mb-1 block">Ажилласан жил: <span className="ml-1 font-semibold text-slate-100 dark:text-slate-900">{form.years || '1'}</span></label>
            <div className="relative mb-6">
              <label htmlFor="years-range-step2" className="sr-only">Years range</label>
              <input
                id="years-range-step2"
                type="range"
                min="1"
                max="30"
                step="1"
                value={form.years === '' ? 1 : Number(form.years)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, years: String(e.target.value) }));
                  setRangeMoved(true);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-0 -bottom-6">1</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">10</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-2/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">20</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute end-0 -bottom-6">30</span>
            </div>
            {!rangeMoved && (
              <div className="text-xs text-amber-500 dark:text-amber-400 mt-2 pt-4">
                ⚠️ Ажилласан жилээ сонгохын тулд slider-ийг хөдөлгөнө үү
              </div>
            )}
          </div>

        

          <div className="flex justify-end">
            <button onClick={submitToBackend} disabled={!canProceedStep1 || posting} className="h-12 px-6 rounded-2xl bg-[#fbd433] text-black dark:bg-[#fbd433] dark:text-black flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:pointer-events-none">{posting ? 'Илгээж байна...' : 'ЦАЛИНГАА ОРУУЛАХ'}</button>
          </div>
          {postError && <div className="text-red-500 text-sm text-right">{postError}</div>}
        </div>
      )}
      {step === 2 && (
       <div className="space-y-6">
       {/* Position combobox with autocomplete (like Step 1) */}
       <div ref={positionRef} className="relative">
         <div className="mb-2 text-sm text-slate-300 dark:text-slate-700">Албан тушаалаа оруулна уу</div>
         <div
           className={`flex items-center justify-between rounded-xl border px-3 py-2 cursor-text ${positionOpen? 'ring-2 ring-blue-500' : ''} border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white`}
           onClick={() => setPositionOpen(true)}
         >
           <input
             className="w-full bg-transparent outline-none text-slate-100 dark:text-slate-900 placeholder-slate-400"
             placeholder={positionsLoading ? 'Уншиж байна...' : (form.position || 'Албан тушаал оруулна уу')}
             value={positionOpen ? positionQuery : ''}
             onChange={(e) => { setPositionQuery(e.target.value); setPositionOpen(true); }}
             onFocus={() => { setPositionOpen(true); setPositionQuery(''); }}
             onKeyDown={handlePositionKey}
           />
           {Boolean(form.position || positionQuery) && (
             <button
               type="button"
               onClick={(e) => { e.stopPropagation(); setForm((f)=>({ ...f, position:'', positionId:'' })); setPositionQuery(''); }}
               className="ml-2 rounded-md px-2 py-1 text-xs bg-slate-700 text-slate-100 dark:bg-gray-200 dark:text-slate-800 hover:opacity-80"
               aria-label="Clear"
             >
               ✕
             </button>
           )}
           <span className="ml-2 text-slate-400">▾</span>
         </div>
         {positionOpen && (
           <div ref={positionListRef} className="absolute z-20 mt-1 w-full max-h-96 overflow-y-auto overscroll-contain rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg scroll-smooth" onMouseLeave={()=> setPositionOpen(false)}>
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
                     data-position-item="1"
                     className={`w-full text-left px-3 py-2 ${idx===positionActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100 focus:outline-none`}
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
       <div className={`text-xs ${salaryOutOfRange ? 'text-red-500' : 'text-slate-400 dark:text-slate-600'}`}>Жишээ нь: Програм хангамжийн инженер / Software Engineer</div>


         {/* Salary input */}
         <div className="space-y-2">
            <label className="text-sm font-bold text-yellow-300 dark:text-red-600 mb-1 block">Авч буй цалин (₮)</label>
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
      {/* Professional level combobox */}
      {/* <div ref={proLevelRef} className="relative">
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
              {Boolean(form.proLevelName || proLevelQuery) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForm((f)=>({ ...f, proLevelName:'', proLevelId:'', proLevelLevel: undefined })); setProLevelQuery(''); }}
                  className="ml-2 rounded-md px-2 py-1 text-xs bg-slate-700 text-slate-100 dark:bg-gray-200 dark:text-slate-800 hover:opacity-80"
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
              <span className="ml-2 text-slate-400">▾</span>
            </div>
            {proLevelOpen && (
              <div ref={proLevelListRef} className="absolute z-20 mt-1 w-full max-h-96 overflow-y-auto overscroll-contain rounded-xl border border-slate-700 dark:border-gray-300 bg-slate-800 dark:bg-white shadow-lg scroll-smooth" onMouseLeave={()=> setProLevelOpen(false)}>
                {proLevelsError && (<div className="px-3 py-2 text-sm text-red-400 dark:text-red-600">{proLevelsError}</div>)}
                {!proLevelsError && (filteredProLevels.length ? (
                  filteredProLevels.map((p, idx) => {
                    const selected = form.proLevelId && (form.proLevelId === (p._id ?? p.id));
                    return (
                      <button
                        key={p._id ?? p.id}
                        type="button"
                        onClick={() => chooseProLevel(p)}
                        data-pro-level-item="1"
                        className={`w-full text-left px-3 py-2 ${idx===proLevelActiveIndex? 'bg-slate-700/50 dark:bg-gray-100' : ''} ${selected? 'font-bold' : ''} text-slate-100 dark:text-slate-900 hover:bg-slate-700/50 dark:hover:bg-gray-100 focus:outline-none`}
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
       <div className="space-y-2">
         <label className="text-sm text-slate-300 dark:text-slate-700 mb-1 block">Ажилласан жил: <span className="ml-1 font-semibold text-slate-100 dark:text-slate-900">{form.years || '1'}</span></label>
         <div className="relative mb-6">
           <label htmlFor="years-range-step2" className="sr-only">Years range</label>
           <input
             id="years-range-step2"
             type="range"
             min="1"
             max="30"
             step="1"
             value={form.years === '' ? 1 : Number(form.years)}
             onChange={(e) => {
               setForm((f) => ({ ...f, years: String(e.target.value) }));
               setRangeMoved(true);
             }}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
           />
           <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-0 -bottom-6">1</span>
           <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">10</span>
           <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute start-2/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-6">20</span>
           <span className="text-[10px] text-slate-400 dark:text-slate-600 absolute end-0 -bottom-6">30</span>
         </div>
         {!rangeMoved && (
           <div className="text-xs text-amber-500 dark:text-amber-400 mt-2 pt-4">
             ⚠️ Ажилласан жилээ сонгохын тулд slider-ийг хөдөлгөнө үү
           </div>
         )}
       </div> */}

      <div className="flex justify-end">
        <button onClick={submitToBackend2} disabled={!canProceedStep2 || posting} className="h-12 px-6 rounded-2xl bg-[#fbd433] text-black dark:bg-[#fbd433] dark:text-black flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:pointer-events-none">{posting ? 'Илгээж байна...' : 'ЦАЛИНГАА ХАРЬЦУУЛАХ'}</button>
      </div>
       {postError && <div className="text-red-500 text-sm text-right">{postError}</div>}
     </div>
      )}

      {step === 3 && (
         <UploadStep />  
      )}
    </div>
  );

  const card = (
    <div className="relative rounded-[28px] p-[1.5px] bg-[conic-gradient(from_180deg_at_50%_50%,#60a5fa33,#a78bfa33,#60a5fa33)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.18)_0%,rgba(59,130,246,0)_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22)_0%,rgba(59,130,246,0)_60%)] rounded-[28px]" />
      {cardInner}
    </div>
  );

  const modal = (
    modalOpen ? createPortal(
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div className="w-[min(92vw,960px)] max-h-[86vh] overflow-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <img src={step===2 ? MainWhite : logoBlack} alt="Logo" className="h-10 w-10" />
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Боломжит ажлын байр болон боломжит цалин</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" aria-label="Close">✕</button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
              {/* <div><div className="text-xs uppercase opacity-60">Салбар</div><div className="text-base font-semibold">{form.industry || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Мэргэжил</div><div className="text-base font-semibold">{form.major || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Ажлын байр</div><div className="text-base font-semibold">{form.position || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Түвшин</div><div className="text-base font-semibold">{form.proLevelName || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Туршлага</div><div className="text-base font-semibold">{form.years || '—'} жил</div></div> */}
              {form.file && (
                <div className="md:col-span-2">
                  <div className="text-xs uppercase opacity-60">Файл</div>
                  <div className="text-base font-semibold break-all">{form.file.name}</div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">AI санал болгож буй ажлын байр</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(aiPositions.length ? aiPositions : [
                  { _id: 'fallback-1', position_name_mn: 'Санал болгох ажлын байр', salary: 0 },
                ]).map((p) => (
                  <div key={p._id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition p-5">
                    <div className="text-slate-900 dark:text-slate-100 font-semibold">
                      {p.position_name_mn || p.position_id?.name_mn || p.position_name_en}
                    </div>
                    <div className="mt-6 text-xs uppercase text-slate-500 dark:text-slate-400">Боломжит цалин</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.salary)} MNT
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Хаах</button>
              <button onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">ОК</button>
            </div>
          </div>
        </div>
      </div>, document.body
    ) : null
  );

  const postModal = (
    postModalOpen ? createPortal(
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/60" onClick={() => setPostModalOpen(false)} />
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div className="w-[min(96vw,1200px)] max-h-[92vh] overflow-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <img src={logoBlack} alt="Logo" className="h-10 w-10" />
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">Таны оруулсан мэдээлэл</h3>
              </div>
              <button onClick={() => setPostModalOpen(false)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" aria-label="Close">✕</button>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700 dark:text-slate-300">
              <div><div className="text-xs uppercase opacity-60">Салбар</div><div className="text-base font-semibold">{form.industry || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Албан тушаал</div><div className="text-base font-semibold">{form.position || '—'}</div></div>
              <div><div className="text-xs uppercase opacity-60">Авч буй цалин</div><div className="text-base font-semibold">{form.salary || '—'} ₮</div></div>
            </div>
            <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-700">
              <PostModalChart form={form} />
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setPostModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Хаах</button>
              <button onClick={() => setPostModalOpen(false)} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">ОК</button>
            </div>
          </div>
        </div>
      </div>, document.body
    ) : null
  );


  const congratsModal = (
    congratsOpen ? createPortal(
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/70 to-orange-200/70 dark:from-slate-900/80 dark:to-slate-900/80" onClick={() => setCongratsOpen(false)} />
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div className="w-[min(92vw,560px)] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 h-28 w-28 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-xl flex items-center justify-center animate-[pop_500ms_ease-out_forwards]">
                <div className="h-16 w-16 rounded-full bg-yellow-200" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Баярлалаа!</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Таны цалингийн мэдээлэл амжилттай бүртгэгдлээ. Таны оруулсан мэдээлэл олон мянган монгол залуучуудад өөрийгөө бодитоор үнэлүүлэлхэд тус нэмэр болно.</p>
              <button onClick={() => setCongratsOpen(false)} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#6941C6] hover:bg-[#5b37b5] text-white px-6 py-3 font-semibold">Үргэлжлүүлэх</button>
            </div>
          </div>
          {/* Simple confetti sprinklers */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 1736 }).map((_, i) => (
              <span key={i} className="absolute block rounded-sm"
                style={{
                  left: `${Math.random()*100}%`,
                  top: `-${10+Math.random()*40}px`,
                  width: `${6+Math.random()*6}px`,
                  height: `${4+Math.random()*4}px`,
                  backgroundColor: ['#fbd433','#da2c16','#6941C6','#22c55e','#3b82f6'][i%5],
                  animation: `fall ${1.8+Math.random()*1.2}s linear ${Math.random()*0.8}s forwards, spin ${1.8+Math.random()*1.2}s linear ${Math.random()*0.8}s forwards`
                }}
              />
            ))}
          </div>
        </div>
        <style>{`@keyframes fall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(110vh) rotate(360deg);opacity:.95}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(720deg)}}@keyframes pop{0%{transform:scale(.85);filter:blur(4px);opacity:0}100%{transform:scale(1);filter:blur(0);opacity:1}}`}</style>
      </div>, document.body
    ) : null
  );

  if (compact) {
    return (
      <div id="salary-section" className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6">
        <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-3 text-sm font-medium text-gray-400 dark:text-gray-400 overflow-x-auto md:overflow-visible" role="tablist" aria-orientation="vertical">
          <li className="flex-shrink-0">
          <button
              type="button"
              onClick={() => setStep(1)}
              aria-selected={step===1}
              className={`${step===1 ? 'text-white bg-red-600 dark:bg-red-600' : 'text-gray-500 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex flex-col md:flex-row items-center px-4 md:px-3 py-3 md:py-2 rounded-lg min-w-[100px] md:w-full transition-colors`}
            >
              <img src={isDark ? MainWhite : (step==1 ? MainWhite : logoBlack)} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 mb-1 md:mb-0 md:mr-4" />
              {/* <svg className={`${step===2 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/></svg> */}
              <span className="text-xs md:text-sm text-center md:text-left whitespace-nowrap md:whitespace-pre-line leading-tight px-1">{`ЦАЛИНГАА\nОРУУЛ`}</span>
            </button>
          </li>
            <li className="flex-shrink-0 relative group">
            <button
              type="button"
              onClick={() => currentIsUnlocked ? setStep(2) : setStep(1)}
              aria-selected={step===2}
              disabled={!currentIsUnlocked}
              className={`${step===2 ? 'text-white bg-red-600 dark:bg-red-600' : !currentIsUnlocked ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex flex-col md:flex-row items-center px-4 md:px-3 py-3 md:py-2 rounded-lg min-w-[100px] md:w-full transition-colors`}
            >
              <img src={isDark ? MainWhite : (step===2 ? MainWhite : logoBlack)} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 mb-1 md:mb-0 md:mr-4" />
              {/* <svg className={`${step===2 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/></svg> */}
              {/* <span className="text-xs md:text-sm text-center md:text-left whitespace-nowrap leading-tight px-1">{`ЦАЛИНГАА\`} </span> */}
              <span className="text-xs md:text-sm text-center md:text-left whitespace-nowrap md:whitespace-pre-line leading-tight px-1">{`ЦАЛИНГАА\nХАРЬЦУУЛ`}</span>
            </button>
            {/* Tooltip for disabled state */}
            {!currentIsUnlocked && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Эхлээд цалингаа оруулна уу
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </li>
          <li className="flex-shrink-0 relative group">
            <button
              type="button"
              onClick={() => currentIsUnlocked ? setStep(3) : setStep(1)}
              aria-selected={step===3}
              disabled={!currentIsUnlocked}
              className={`${step===3 ? 'text-white bg-red-600 dark:bg-red-600' : !currentIsUnlocked ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex flex-col md:flex-row items-center px-4 md:px-3 py-3 md:py-2 rounded-lg min-w-[100px] md:w-full transition-colors`}
            >
               <img src={isDark ? MainWhite : (step===3 ? MainWhite : logoRed1)} alt="Logo" className="h-8 w-8 md:h-10 md:w-10 mb-1 md:mb-0 md:mr-4" />
              {/* <svg className={`${step===3 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M18 7.5h-.423l-.452-1.09.3-.3a1.5 1.5 0 0 0 0-2.121L16.01 2.575a1.5 1.5 0 0 0-2.121 0l-.3.3-1.089-.452V2A1.5 1.5 0 0 0 11 .5H9A1.5 1.5 0 0 0 7.5 2v.423l-1.09.452-.3-.3a1.5 1.5 0 0 0-2.121 0L2.576 3.99a1.5 1.5 0 0 0 0 2.121l.3.3L2.423 7.5H2A1.5 1.5 0 0 0 .5 9v2A1.5 1.5 0 0 0 2 12.5h.423l.452 1.09-.3.3a1.5 1.5 0 0 0 0 2.121l1.415 1.413a1.5 1.5 0 0 0 2.121 0l.3-.3 1.09.452V18A1.5 1.5 0 0 0 9 19.5h2a1.5 1.5 0 0 0 1.5-1.5v-.423l1.09-.452.3.3a1.5 1.5 0 0 0 2.121 0l1.415-1.414a1.5 1.5 0 0 0 0-2.121l-.3-.3.452-1.09H18a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 18 7.5Zm-8 6a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg> */}
              {/* <span className="text-xs md:text-sm text-center md:text-left whitespace-nowrap leading-tight px-1">ЦАЛИНГАА </span> */}
              <span className="text-xs md:text-sm text-center md:text-left whitespace-nowrap md:whitespace-pre-line leading-tight px-1">{`ЦАЛИНГАА\nНЭМҮҮЛ`}</span>
            
            </button>
            {/* Tooltip for disabled state */}
            {!currentIsUnlocked && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Эхлээд цалингаа оруулна уу
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </li>
        </ul>
        <div className="flex-1 min-w-0">
          {card}
        </div>
        {modal}
      {postModal}
        {congratsModal}
      </div>
    );
  }

  return (
    <section id="salary-section" className="max-w-[980px] mx-auto px-5 py-10">
      <div className="md:flex">
        <ul className="flex flex-col space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:mr-6 mb-6 md:mb-0 w-full md:w-64" role="tablist" aria-orientation="vertical">
          <li>
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-selected={step===1}
              className={`${step===1 ? 'text-white bg-red-600 dark:bg-red-600' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex items-center px-4 py-3 rounded-lg w-full transition-colors`}
            >
              <img src={logoBlack} alt="Logo" className="h-4 w-4 mr-2" />
              {/* <svg className={`${step===1 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/></svg> */}
              {/* ЦАЛИНГАА ОРУУЛ */}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => currentIsUnlocked ? setStep(2) : setStep(1)}
              aria-selected={step===2}
              disabled={!currentIsUnlocked}
              className={`${step===2 ? 'text-white bg-red-600 dark:bg-red-600' : !currentIsUnlocked ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex items-center px-4 py-3 rounded-lg w-full transition-colors`}
            >
              <svg className={`${step===2 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18"><path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/></svg>
              ЦАЛИНГАА ХАРЬЦУУЛ
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => currentIsUnlocked ? setStep(3) : setStep(1)}
              aria-selected={step===3}
              disabled={!currentIsUnlocked}
              className={`${step===3 ? 'text-white bg-red-600 dark:bg-red-600' : !currentIsUnlocked ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white'} inline-flex items-center px-4 py-3 rounded-lg w-full transition-colors`}
            >
              <svg className={`${step===3 ? 'text-white' : 'text-gray-500 dark:text-gray-400'} w-4 h-4 mr-2`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M18 7.5h-.423l-.452-1.09.3-.3a1.5 1.5 0 0 0 0-2.121L16.01 2.575a1.5 1.5 0 0 0-2.121 0l-.3.3-1.089-.452V2A1.5 1.5 0 0 0 11 .5H9A1.5 1.5 0 0 0 7.5 2v.423l-1.09.452-.3-.3a1.5 1.5 0 0 0-2.121 0L2.576 3.99a1.5 1.5 0 0 0 0 2.121l.3.3L2.423 7.5H2A1.5 1.5 0 0 0 .5 9v2A1.5 1.5 0 0 0 2 12.5h.423l.452 1.09-.3.3a1.5 1.5 0 0 0 0 2.121l1.415 1.413a1.5 1.5 0 0 0 2.121 0l.3-.3 1.09.452V18A1.5 1.5 0 0 0 9 19.5h2a1.5 1.5 0 0 0 1.5-1.5v-.423l1.09-.452.3.3a1.5 1.5 0 0 0 2.121 0l1.415-1.414a1.5 1.5 0 0 0 0-2.121l-.3-.3.452-1.09H18a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 18 7.5Zm-8 6a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"/></svg>
              ЦАЛИНГАА НЭМ
            </button>
          </li>
        </ul>
        <div className="flex-1 min-w-0">
          {card}
        </div>
      </div>
      {modal}
      {postModal}
      {congratsModal}
    </section>
  );
}


