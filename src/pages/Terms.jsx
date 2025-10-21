import React from 'react';
import Header from '../components/Header.jsx';

const asset = (p) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '/');
  const path = String(p || '').replace(/^\/+/, '');
  return `${base}${path}`;
};

export default function Terms() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          {/* Back Button */}
          <button 
            onClick={goBack}
            className="mb-6 flex items-center gap-2 text-black dark:text-white font-bold hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Үйлчилгээний Нөхцөл ба Нууцлалын Бодлого
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              1. Үйлчилгээний зорилго
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Tsalin.ai үйлчилгээ нь Монголын талент зах зээлийн цалин, нөхөн олговорын чиг хандлагыг ойлгох, харьцуулах, ирээдүйн орлогын төлөвлөлтийг тооцох зорилготой.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Манай дүн шинжилгээ нь:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-6 space-y-2 ml-4">
              <li>Tsalin.ai хэрэглэгчдийн өөрсдийн зөвшөөрлөөр оруулсан цалин, ажил мэргэжлийн мэдээлэл,</li>
              <li>CV/Resume-ийн өгөгдөл (ур чадвар, туршлага, ажлын түүх),</li>
              <li>Lambda.Global платформын бодит ажлын саналын өгөгдөл (offer-level data),</li>
              <li>Нийтийн болон олон улсын статистик эх сурвалж,</li>
              <li>Гуравдагч талын судалгаа,</li>
              <li>AI болон дата алгоритмаар боловсруулсан синтетик өгөгдөл</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              эдгээрийг нэгтгэн боловсруулж, хэрэглэгчдэд үнэлгээ, харьцуулалт, урьдчилсан таамаглалыг үзүүлнэ.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              2. Хэрэглэгчийн оруулсан мэдээлэл
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Хэрэглэгч цалин болон бусад мэдээллээ өөрийн сайн дурын үндсэн дээр оруулна.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Хэрэглэгч CV/Resume-ээ байршуулснаар Tsalin.ai нь тухайн мэдээллийг:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mb-4 space-y-2 ml-4">
              <li>цалин болон карьерийн таамаглал гаргахад,</li>
              <li>хэрэглэгчийн ур чадвар, туршлагад тохирсон ажлын боломжийг санал болгоход ашиглахыг зөвшөөрч байна.</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Resume-ээ байршуулснаар хэрэглэгч нь Lambda.Global платформд автоматаар бүртгэгдэж, талент байдлаар профайл үүсгэхийг зөвшөөрсөнд тооцно.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
              Хэрэглэгч хүссэн үедээ Lambda.Global платформ дахь өөрийн профайл болон мэдээллээ удирдах, устгах боломжтой.
            </p>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              3. Ашиглалтын нөхцөл
            </h2>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Tsalin.ai-ийн статистик болон таамаглал нь лавлагааны зориулалттай бөгөөд "байгаагаар нь" (as-is) хэлбэрээр олгогдоно.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Хэрэглэгч уг мэдээллийг ашиглахдаа өөрийн эрсдэлээр ашиглаж, түүн дээр үндэслэн гаргасан шийдвэрийн үр дагаврыг өөрөө хариуцна.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-6">
              Tsalin.ai болон Lambda.Global-ийн өгөгдлийг хуулбарлах, дахин түгээх, худалдах, автоматаар олборлох, эсвэл ижил үйлчилгээ хөгжүүлэх зорилгоор ашиглахыг хатуу хориглоно.
            </li>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              4. Нууцлал ба өгөгдөл хамгаалалт
            </h2>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Цалин болон resume мэдээллийг аноним хэлбэрээр нэгтгэн статистик, дүн шинжилгээнд ашиглана.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Хувийн мэдээлэл зөвхөн хэрэглэгчийн зөвшөөрлөөр хадгалагдаж, Tsalin.ai болон Lambda.Global-ийн системд аюулгүй байдлын стандартын дагуу шифрлэгдсэн хэлбэрээр хамгаалагдана.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Хэрэглэгч хүссэн үедээ өөрийн мэдээллийг устгуулах эрхтэй.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-6">
              Бид таны мэдээллийг зөвшөөрөлгүйгээр гуравдагч этгээдэд худалдахгүй, дамжуулахгүй.
            </li>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              5. Хариуцлагаас татгалзах
            </h2>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Хэрэглэгч мэдээллийг өөрийн эрсдэлээр ашиглана.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-4">
              Tsalin.ai болон Lambda.Global нь өгөгдлийн үнэн зөв, бүрэн бүтэн байдлыг хангахад чармайлт гаргах боловч 100% нарийвчлал батлахгүй.
            </li>
            <li className="text-slate-700 dark:text-slate-300 mb-6">
              Бид таны мэдээллийг ашиглан гаргасан аливаа шийдвэрийн эдийн засгийн үр дагаврыг хариуцахгүй.
            </li>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Сүүлд шинэчилсэн: {new Date().toLocaleDateString('mn-MN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
