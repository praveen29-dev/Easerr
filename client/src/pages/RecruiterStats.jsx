import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecruiterPerformance } from '../api/recruiterApi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const RecruiterStats = () => {
  const [timeRange, setTimeRange] = useState('6months');

  // Fetch recruiter performance data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['recruiterPerformance', timeRange],
    queryFn: () => getRecruiterPerformance(timeRange)
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
        Error: {error?.message || 'Failed to load recruiter statistics'}
      </div>
    );
  }

  // Use placeholder data until the API is implemented
  const performanceData = data || {
    jobsPosted: 12,
    applicationsReceived: 85,
    interviewsScheduled: 34,
    hiresCompleted: 8,
    responseRate: 92,
    avgTimeToHire: 18,
    totalJobViews: 1240,
    monthlyStats: [
      { month: '1/23', jobs: 2, applications: 14, hires: 1 },
      { month: '2/23', jobs: 1, applications: 8, hires: 1 },
      { month: '3/23', jobs: 3, applications: 22, hires: 2 },
      { month: '4/23', jobs: 1, applications: 10, hires: 0 },
      { month: '5/23', jobs: 2, applications: 16, hires: 2 },
      { month: '6/23', jobs: 3, applications: 15, hires: 2 }
    ],
    applicationSources: [
      { source: 'Direct', count: 38 },
      { source: 'LinkedIn', count: 24 },
      { source: 'Indeed', count: 14 },
      { source: 'Referral', count: 9 }
    ]
  };

  // Calculate efficiency metrics
  const applicationsPerJob = performanceData.jobsPosted 
    ? (performanceData.applicationsReceived / performanceData.jobsPosted).toFixed(1) 
    : 0;

  const hireRate = performanceData.applicationsReceived 
    ? ((performanceData.hiresCompleted / performanceData.applicationsReceived) * 100).toFixed(1) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Recruiter Performance Analytics</h1>
      
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
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Jobs Posted</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{performanceData.jobsPosted}</p>
          <p className="text-sm text-gray-500 mt-2">
            In the last {timeRange === '3months' ? '3' : timeRange === '6months' ? '6' : '12'} months
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Applications</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{performanceData.applicationsReceived}</p>
          <p className="text-sm text-gray-500 mt-2">
            {applicationsPerJob} per job posting
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Hire Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{hireRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {performanceData.hiresCompleted} candidates hired
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <p className="text-lg font-semibold text-gray-700">Avg. Time to Hire</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{performanceData.avgTimeToHire} days</p>
          <p className="text-sm text-gray-500 mt-2">
            From application to acceptance
          </p>
        </div>
      </div>
      
      {/* Monthly Performance Charts */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Performance Trends</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData.monthlyStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="jobs" fill="#3B82F6" name="Jobs Posted" />
              <Bar yAxisId="left" dataKey="applications" fill="#8B5CF6" name="Applications" />
              <Bar yAxisId="right" dataKey="hires" fill="#10B981" name="Hires" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Response Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Response Rate</h2>
          <div className="flex items-center mb-4">
            <div className="w-full bg-gray-200 rounded-full h-5">
              <div 
                className="bg-blue-600 h-5 rounded-full" 
                style={{ width: `${performanceData.responseRate}%` }}
              ></div>
            </div>
            <span className="ml-4 text-xl font-bold">{performanceData.responseRate}%</span>
          </div>
          <p className="text-sm text-gray-500">
            Percentage of applicants who received a response
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Job View to Application Ratio</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Job Views</span>
              <span className="text-sm text-gray-500">{performanceData.totalJobViews}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-gray-600 h-2.5 rounded-full w-full"></div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Applications</span>
              <span className="text-sm text-gray-500">{performanceData.applicationsReceived}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${(performanceData.applicationsReceived / performanceData.totalJobViews) * 100}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Conversion rate: {((performanceData.applicationsReceived / performanceData.totalJobViews) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      
      {/* Application Sources */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Sources</h2>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData.applicationSources}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#6366F1" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recruitment Funnel</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-500 mb-1">Job Postings</p>
            <p className="text-xl font-bold">{performanceData.jobsPosted}</p>
            <p className="text-sm text-gray-400">100%</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-purple-500 mb-1">Applications</p>
            <p className="text-xl font-bold">{performanceData.applicationsReceived}</p>
            <p className="text-sm text-gray-400">
              {(performanceData.applicationsReceived / performanceData.jobsPosted).toFixed(1)} per job
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg text-center">
            <p className="text-indigo-500 mb-1">Interviews</p>
            <p className="text-xl font-bold">{performanceData.interviewsScheduled}</p>
            <p className="text-sm text-gray-400">
              {((performanceData.interviewsScheduled / performanceData.applicationsReceived) * 100).toFixed(0)}% of applications
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-green-500 mb-1">Hires</p>
            <p className="text-xl font-bold">{performanceData.hiresCompleted}</p>
            <p className="text-sm text-gray-400">
              {((performanceData.hiresCompleted / performanceData.interviewsScheduled) * 100).toFixed(0)}% of interviews
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterStats; 