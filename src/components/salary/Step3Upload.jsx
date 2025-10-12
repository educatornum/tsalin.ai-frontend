import React from 'react';

export default function Step3Upload({
  form,
  setForm,
  onDrop,
  onPick,
  uploadAndAnalyze,
  uploading,
  analyzing,
  uploadResult,
  uploadError,
  analyzeError,
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={onDrop}
      className="space-y-4"
    >
      <div className="text-sm text-slate-300 dark:text-slate-700">Та CV-гээ оруулсанаар бид таныг ямар салбарт, ямар албан тушаалуудад хэдий хэмжээний цалинтай ажиллах боломжтойг тооцоолж өгнө.</div>
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
        <div className="md:col-span-2 flex justify-end">
          <button onClick={uploadAndAnalyze} disabled={!form.file || uploading || analyzing} className="h-12 px-6 rounded-2xl bg-[#fbd433] text-black dark:bg-[#fbd433] dark:text-black flex items-center justify-center text-base font-semibold disabled:opacity-50">{uploading ? 'Илгээж байна.' : analyzing ? 'Таньд тохирох ажлын саналыг боловсруулж байна.' : 'Файл илгээх'}</button>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-600 space-y-1">
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
        )}
        {(uploadError || analyzeError) && (<div className="text-red-500 text-sm">{uploadError || analyzeError}</div>)}
      </div>
    </div>
  );
}


