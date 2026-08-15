import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Download, FileSpreadsheet, FileText, BarChart2, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Reports = () => {
  const [downloading, setDownloading] = useState(null);

  const performanceData = [
    { month: 'Sep', attendance: 92, grade: 4.3 },
    { month: 'Oct', attendance: 94, grade: 4.5 },
    { month: 'Nov', attendance: 91, grade: 4.4 },
    { month: 'Dec', attendance: 95, grade: 4.6 },
    { month: 'Jan', attendance: 96, grade: 4.7 },
    { month: 'Feb', attendance: 94, grade: 4.6 },
  ];

  const triggerExport = (format) => {
    setDownloading(format);
    setTimeout(() => {
      alert(`Exporting ${format.toUpperCase()} report... (Prepared for production backend implementation)`);
      setDownloading(null);
    }, 1000);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Analytics & Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Export student performance and class attendance statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => triggerExport('pdf')} className="btn-secondary">
              <FileText size={18} className="text-red-500" /> Export PDF
            </button>
            <button onClick={() => triggerExport('excel')} className="btn-primary">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="section-title mb-4">Monthly Attendance Trend (%)</h3>
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
            <h3 className="section-title mb-4">Average Grade Trend</h3>
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

        {/* Report Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6 border-t-4 border-t-emerald-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">Attendance Report</h4>
            <p className="text-xs text-gray-500 mt-1">Detailed summary of absences, tardiness, and presence per class.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Last updated: Today</span>
              <button onClick={() => triggerExport('pdf')} className="text-primary-600 font-semibold hover:underline">Download</button>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-purple-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">Academic Performance</h4>
            <p className="text-xs text-gray-500 mt-1">Comprehensive breakdown of student scores across all assessments.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Last updated: Today</span>
              <button onClick={() => triggerExport('excel')} className="text-primary-600 font-semibold hover:underline">Download</button>
            </div>
          </div>

          <div className="card p-6 border-t-4 border-t-blue-500">
            <h4 className="font-bold text-base text-gray-900 dark:text-white">Homework Completion</h4>
            <p className="text-xs text-gray-500 mt-1">Completion ratios and submission speed reports by subject.</p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Last updated: Today</span>
              <button onClick={() => triggerExport('excel')} className="text-primary-600 font-semibold hover:underline">Download</button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Reports;
