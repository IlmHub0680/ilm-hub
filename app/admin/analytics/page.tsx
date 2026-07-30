'use client';

import { useState } from 'react';

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('monthly');

  const metrics = {
    totalRevenue: "$12,450.00",
    totalOrders: 142,
    activeSubscribers: 890,
    publishedBooks: 18,
    courseEnrollments: 320,
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\n" 
      + `Total Revenue,${metrics.totalRevenue}\n`
      + `Total Orders,${metrics.totalOrders}\n`
      + `Active Subscribers,${metrics.activeSubscribers}\n`
      + `Published Books,${metrics.publishedBooks}\n`
      + `Course Enrollments,${metrics.courseEnrollments}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & BI Dashboard</h1>
          <p className="text-gray-600">Track sales, orders, publishing activity, and subscriber growth.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalRevenue}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Newsletter Subscribers</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.activeSubscribers}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Published Books</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.publishedBooks}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Course Enrollments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.courseEnrollments}</p>
        </div>
      </div>
    </div>
  );
}
