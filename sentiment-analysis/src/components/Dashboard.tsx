import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageCircle, BarChart2 } from 'lucide-react';
import useSocialMediaSentiment from './SentimentAnalysis.tsx'
import { useCompany } from '../context/CompanyContext.tsx';
import { LoadingState } from './LoadingState.tsx';

export function Dashboard() {
  const { companyInfo } = useCompany();
  const { sentimentData, keywordData, loading, error } = useSocialMediaSentiment(companyInfo)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Sentiment Trends</h2>
        </div>
        <div className="h-[300px]">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className='h-full flex items-center justify-center'>
            <div className='text-red-600 text-xl'>{error} :(</div></div>
          ) : sentimentData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sentiment" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
          
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">Top Keywords</h2>
        </div>
        <div className="h-[300px]">
        {loading ? (
            <LoadingState />
          ) : error ? (
            <div className='h-full flex items-center justify-center'>
            <div className='text-red-600 text-xl'>{error} :(</div></div>
          ) : keywordData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={keywordData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="keyword" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer> 
        ) : null}
          
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">Volume Analysis</h2>
        </div>
        <div className="h-[300px]">
        {loading ? (
            <LoadingState />
          ) : error ? (
            <div className='h-full flex items-center justify-center'>
            <div className='text-red-600 text-xl'>{error} :(</div></div>
          ) : sentimentData ? ( <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#9333ea" />
            </LineChart>
          </ResponsiveContainer> 
          ) : null}
        </div>
      </div>
    </div>
  );
}