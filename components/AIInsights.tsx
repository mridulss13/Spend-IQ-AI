'use client';

import { useState, useEffect } from 'react';
import { getAIInsights, InsightWithAnswer } from '@/app/actions/getAIInsights';

const AIInsights = () => {
  const [insights, setInsights] = useState<InsightWithAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const newInsights = await getAIInsights();
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ AIInsights: Failed to load AI insights:', error);
      setInsights([
        {
          id: 'fallback-1',
          type: 'info',
          title: 'AI Temporarily Unavailable',
          message:
            "We're working to restore AI insights. Please check back soon.",
          action: 'Try again later',
          confidence: 0.5,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'tip':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        );
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      case 'tip':
        return 'border-l-green-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'success':
        return 'bg-green-500/20 text-green-500';
      case 'tip':
        return 'bg-green-500/20 text-green-500';
      case 'info':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getActionTextColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-300';
      case 'success':
        return 'text-green-300';
      case 'tip':
        return 'text-green-300';
      case 'info':
        return 'text-blue-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return lastUpdated.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className='bg-gray-900 p-6 rounded-2xl border border-gray-800'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div>
              <h3 className='text-xl font-bold text-white'>AI Insights</h3>
              <p className='text-sm text-gray-400'>AI financial analysis</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='animate-pulse bg-gray-800/50 p-4 rounded-xl border-l-4 border-gray-700'
            >
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-gray-700 rounded-lg'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-700 rounded w-full'></div>
                  <div className='h-3 bg-gray-700 rounded w-2/3'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gray-900 p-6 rounded-2xl border border-gray-800'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <div>
            <h3 className='text-xl font-bold text-white'>AI Insights</h3>
            <p className='text-sm text-gray-400'>AI financial analysis</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-sm text-gray-400'>{formatLastUpdated()}</span>
          </div>
          <button
            onClick={loadInsights}
            className='w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors'
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`relative overflow-hidden rounded-xl bg-gray-800/50 p-4 border-l-4 ${getBorderColor(insight.type)}`}
          >
            {/* Icon and Title */}
            <div className='flex items-start gap-3 mb-3'>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className='flex-1'>
                <h4 className='font-bold text-white text-base mb-1'>
                  {insight.title}
                </h4>
                {insight.confidence && insight.confidence < 0.8 && (
                  <span className='inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium mb-2'>
                    Preliminary
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <p className='text-gray-300 text-sm mb-3 leading-relaxed'>
              {insight.message}
            </p>

            {/* Actionable Suggestion */}
            {insight.action && (
              <div className='mb-3'>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 ${getActionTextColor(insight.type)} text-sm`}>
                  <span>{insight.action}</span>
                  <span className='text-xs'>
                    {insight.type === 'warning' ? '↑' : insight.type === 'tip' ? '↻' : '→'}
                  </span>
                </div>
              </div>
            )}

            {/* AI Answer Section */}
            {insight.aiAnswer && (
              <div className='mt-3 p-3 bg-gray-700/30 rounded-lg border border-gray-700/50'>
                <div className='flex items-start gap-2'>
                  <div className='w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <h5 className='font-semibold text-white text-sm mb-1'>
                      AI Answer:
                    </h5>
                    <p className='text-gray-300 text-sm leading-relaxed'>
                      {insight.aiAnswer}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='pt-4 border-t border-gray-800'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
          <div className='flex items-center gap-2 text-sm text-gray-400'>
            <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className='font-medium'>Powered by AI analysis</span>
          </div>
          <button
            onClick={loadInsights}
            className='px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2'
            disabled={isLoading}
          >
            <span>Refresh Insights</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
