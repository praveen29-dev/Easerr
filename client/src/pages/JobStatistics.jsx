import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobStats } from '../api/jobApi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const JobStatistics = () => {
  const [timeRange, setTimeRange] = useState('6months');

  // Fetch job statistics
  const { data: statsData, isLoading, isError, error } = useQuery({
    queryKey: ['jobStats', timeRange],
    queryFn: () => getJobStats(timeRange)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error: {error?.message || 'Failed to load job statistics'}
      </div>
    );
  }

  const { jobStats, applicationStats, monthlyJobStats = [] } = statsData?.data || {
    jobStats: { total: 0, active: 0, closed: 0, draft: 0 },
    applicationStats: { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 },
    monthlyJobStats: []
  };

  // Format data for the pie chart
  const jobStatusData = [
    { name: 'Active', value: jobStats.active },
    { name: 'Closed', value: jobStats.closed },
    { name: 'Draft', value: jobStats.draft },
  ].filter(item => item.value > 0);

  // Format data for the pie chart
  const applicationStatusData = [
    { name: 'Pending', value: applicationStats.pending },
    { name: 'Reviewed', value: applicationStats.reviewed },
    { name: 'Shortlisted', value: applicationStats.shortlisted },
    { name: 'Rejected', value: applicationStats.rejected },
    { name: 'Hired', value: applicationStats.hired },
  ].filter(item => item.value > 0);

  // Format data for the monthly bar chart
  const formattedMonthlyData = monthlyJobStats.map(item => ({
    month: `${item._id.month}/${item._id.year.toString().substr(2)}`,
    jobs: item.count
  }));

  // Find the month with the most jobs
  const maxJobsMonth = formattedMonthlyData.reduce((max, item) => 
    item.jobs > max.jobs ? item : max, 
    { month: '', jobs: 0 }
  );

  // Calculate efficiency (hired vs total applications)
  const hireRate = applicationStats.total > 0 
    ? ((applicationStats.hired / applicationStats.total) * 100).toFixed(1) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Job Statistics Dashboard</h1>
      
      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('3months')}
            className={`px-4 py-2 rounded-md ${timeRange === '3months' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setTimeRange('6months')}
            className={`px-4 py-2 rounded-md ${timeRange === '6months' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange('12months')}
            className={`px-4 py-2 rounded-md ${timeRange === '12months' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Last 12 Months
          </button>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Total Jobs</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{jobStats.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            {jobStats.active} active, {jobStats.closed} closed, {jobStats.draft} drafts
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Total Applications</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{applicationStats.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            {applicationStats.pending} pending, {applicationStats.shortlisted} shortlisted
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Hire Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{hireRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {applicationStats.hired} hired out of {applicationStats.total} applications
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Best Performing Month</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {maxJobsMonth.month || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {maxJobsMonth.jobs} jobs posted
          </p>
        </div>
      </div>
      
      {/* Monthly Jobs Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Job Posting Trends</h2>
        
        {formattedMonthlyData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedMonthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobs" fill="#3B82F6" name="Jobs Posted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No monthly data available
          </div>
        )}
      </div>
      
      {/* Pie Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Job Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Status Distribution</h2>
          
          {jobStatusData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No job status data available
            </div>
          )}
        </div>
        
        {/* Application Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Status Distribution</h2>
          
          {applicationStatusData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No application status data available
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recruitment Funnel</h2>
        
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 mb-1">Applications</p>
            <p className="text-xl font-bold">{applicationStats.total}</p>
            <p className="text-sm text-gray-400">100%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-500 mb-1">Reviewed</p>
            <p className="text-xl font-bold">{applicationStats.reviewed}</p>
            <p className="text-sm text-gray-400">
              {applicationStats.total > 0 
                ? ((applicationStats.reviewed / applicationStats.total) * 100).toFixed(0) 
                : 0}%
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-green-500 mb-1">Shortlisted</p>
            <p className="text-xl font-bold">{applicationStats.shortlisted}</p>
            <p className="text-sm text-gray-400">
              {applicationStats.total > 0 
                ? ((applicationStats.shortlisted / applicationStats.total) * 100).toFixed(0) 
                : 0}%
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-red-500 mb-1">Rejected</p>
            <p className="text-xl font-bold">{applicationStats.rejected}</p>
            <p className="text-sm text-gray-400">
              {applicationStats.total > 0 
                ? ((applicationStats.rejected / applicationStats.total) * 100).toFixed(0) 
                : 0}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-purple-500 mb-1">Hired</p>
            <p className="text-xl font-bold">{applicationStats.hired}</p>
            <p className="text-sm text-gray-400">
              {applicationStats.total > 0 
                ? ((applicationStats.hired / applicationStats.total) * 100).toFixed(0) 
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStatistics; 