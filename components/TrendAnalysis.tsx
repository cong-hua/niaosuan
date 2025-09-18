'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ComponentType } from 'react';
import { useUser } from '@/contexts/UserContext';

interface UricAcidRecord {
  id: string;
  user_id: string;
  value: number;
  measurement_date: string;
  notes?: string;
  created_at: string;
}

interface TrendAnalysisProps {
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

export default function TrendAnalysis({ user }: TrendAnalysisProps) {
  const [records, setRecords] = useState<UricAcidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  // 固定使用μmol/L单位
  const UNIT = 'μmol/L';
  const { gender } = useUser();

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:13000/api/uric-acid/records?user_id=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取记录失败');
      }

      let filteredRecords = data.records;

      // 根据时间范围过滤数据
      if (timeRange !== 'all') {
        const days = parseInt(timeRange.replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filteredRecords = data.records.filter((record: UricAcidRecord) =>
          new Date(record.measurement_date) >= cutoffDate
        );
      }

      // 按测量日期排序
      filteredRecords.sort((a: UricAcidRecord, b: UricAcidRecord) =>
        new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
      );

      setRecords(filteredRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user.id, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const getChartData = () => {
    return records.map(record => ({
      date: new Date(record.measurement_date).toLocaleDateString('zh-CN'),
      value: record.value,
      fullDate: record.measurement_date
    }));
  };

  const getStatistics = () => {
    if (records.length === 0) return null;

    const values = records.map(r => r.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    const latest = records[records.length - 1];
    const previous = records[records.length - 2];
    const latestValue = latest.value;
    const previousValue = previous ? previous.value : null;
    const trend = previousValue ? latestValue - previousValue : 0;

    return { max, min, avg, trend, latest, latestValue };
  };

  const getUricAcidLevel = (value: number): { level: string; color: string } => {
    // 直接使用μmol/L进行等级判断
    const threshold = gender === 'female' ? 360 : 420; // μmol/L阈值

    if (value < threshold) return { level: '正常', color: 'text-green-600' };
    if (value < 900) return { level: '偏高', color: 'text-yellow-600' }; // 9.0 mmol/L = 900 μmol/L
    return { level: '过高', color: 'text-red-600' };
  };

  const getGenderSpecificThreshold = () => {
    return gender === 'female' ? 360 : 420; // μmol/L阈值
  };

  const getGenderSpecificInfo = () => {
    if (gender === 'female') {
      return {
        normalRange: '150-360 μmol/L',
        recommendation: '女性尿酸正常值较低，请特别注意饮食控制'
      };
    } else if (gender === 'male') {
      return {
        normalRange: '210-420 μmol/L',
        recommendation: '男性尿酸正常值相对较高，但仍需注意控制'
      };
    }
    return {
      normalRange: '210-420 μmol/L',
      recommendation: '请设置性别信息以获取更准确的建议'
    };
  };

  const stats = getStatistics();
  const chartData = getChartData();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">尿酸趋势分析</h2>
          <div className="text-sm text-gray-600 mt-1">
            {getGenderSpecificInfo().normalRange}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            单位: <span className="font-medium text-gray-800">μmol/L</span>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range === '7d' ? '7天' : range === '30d' ? '30天' : range === '90d' ? '90天' : '全部'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无尿酸记录数据
        </div>
      ) : (
        <>
          {/* 统计信息 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">当前值</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.latestValue.toFixed(1)}
                </p>
                <p className={`text-xs ${getUricAcidLevel(stats.latestValue).color}`}>
                  {getUricAcidLevel(stats.latestValue).level}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">平均值</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avg.toFixed(1)}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">最高值</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.max.toFixed(1)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">最低值</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.min.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* 趋势图表 */}
          <div className="h-80 mb-6">
            <div className="w-full h-full">
              <LineChart data={chartData} className="w-full h-full">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} ${UNIT}`, '尿酸值']}
                  labelFormatter={(label) => `测量日期: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="尿酸值"
                />
              </LineChart>
            </div>
          </div>

          {/* 健康建议 */}
          {stats && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">健康建议</h3>
              <div className="text-sm text-gray-700 space-y-1">
                {stats.latestValue >= 900 && (
                  <p>• 您的尿酸值过高，建议尽快就医，严格控制饮食，避免高嘌呤食物</p>
                )}
                {stats.latestValue >= getGenderSpecificThreshold() && stats.latestValue < 900 && (
                  <p>• 您的尿酸值偏高，{getGenderSpecificInfo().recommendation}</p>
                )}
                {stats.latestValue < getGenderSpecificThreshold() && (
                  <p>• 您的尿酸值正常，请继续保持健康的生活方式</p>
                )}
                {stats.trend > 0 && (
                  <p>• 您的尿酸值呈上升趋势，需要引起重视</p>
                )}
                {stats.trend < 0 && (
                  <p>• 您的尿酸值呈下降趋势，继续保持</p>
                )}
                              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}