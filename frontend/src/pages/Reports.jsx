import { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Reports = () => {
  const [downloading, setDownloading] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const performanceData = [
    { month: 'Sep', attendance: 92, grade: 4.3 },
    { month: 'Oct', attendance: 94, grade: 4.5 },
    { month: 'Nov', attendance: 91, grade: 4.4 },
    { month: 'Dec', attendance: 95, grade: 4.6 },
    { month: 'Jan', attendance: 96, grade: 4.7 },
    { month: 'Feb', attendance: 94, grade: 4.6 },
  ];

  const exportCSV = (type = 'Hisobot') => {
    setDownloading('excel');
    
    // Construct CSV content
    let csv = `UstozHub Academic Report - ${type}\nDate,Month,Attendance (%),Average Grade\n`;
    performanceData.forEach(row => {
      csv += `${new Date().toLocaleDateString()},${row.month},${row.attendance}%,${row.grade}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UstozHub_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloading(null);
    setSuccessMessage(`${type} (CSV/Excel) muvaffaqiyatli yuklab olindi!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const exportPDF = () => {
    setDownloading('pdf');
    setTimeout(() => {
      setDownloading(null);
      window.print();
    }, 500);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Tahlil va Hisobotlar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">O'quvchilar va sinflar davomat hamda baholash statistikalarini yuklab oling</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportPDF} className="btn-secondary cursor-pointer">
              <FileText size={18} className="text-red-500" /> Export PDF / Print
            </button>
            <button onClick={() => exportCSV('Umumiy_Hisobot')} className="btn-primary cursor-pointer">
              <FileSpreadsheet size={18} /> Export Excel (CSV)
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">Oylik Davomat Dinamikasi (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415120" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis domain={[80, 100]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF' }} />
                  <Area type="monotone" dataKey="attendance" stroke="#10B981" fill="#10B98120" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-4">O'rtacha Baholar Trendi</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#37415120" />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis domain={[3, 5]} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '12px', color: '#FFF' }} />
                  <Area type="monotone" dataKey="grade" stroke="#8B5CF6" fill="#8B5CF620" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 border-t-4 border-t-emerald-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">Davomat Hisoboti</h4>
            <p className="text-xs text-gray-500 mt-1">Sinflar bo'yicha kelgan, kelmagan hamda kasallar sonining batafsil jadvali.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Yangilangan: Bugun</span>
              <button onClick={() => exportCSV('Davomat_Hisoboti')} className="text-primary-600 font-semibold hover:underline cursor-pointer">Yuklab olish</button>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-purple-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">O'zlashtirish va Baholar</h4>
            <p className="text-xs text-gray-500 mt-1">Barcha nazorat ishlari va testlar bo'yicha o'quvchilar ko'rsatkichlari.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Yangilangan: Bugun</span>
              <button onClick={() => exportCSV('Baholar_Hisoboti')} className="text-primary-600 font-semibold hover:underline cursor-pointer">Yuklab olish</button>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-blue-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">Uy Vazifalari Natijalari</h4>
            <p className="text-xs text-gray-500 mt-1">Topshirilgan va o'z vaqtida bajarilgan vazifalar nisbati.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Yangilangan: Bugun</span>
              <button onClick={() => exportCSV('Vazifalar_Hisoboti')} className="text-primary-600 font-semibold hover:underline cursor-pointer">Yuklab olish</button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Reports;
