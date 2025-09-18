'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import ImageUploadButton from '@/components/ImageUploadButton';

interface UricAcidRecord {
  id: string;
  user_id: string;
  value: number;
  measurement_date: string;
  notes?: string;
  created_at: string;
}

interface UricAcidManagerProps {
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

export default function UricAcidManager({ user }: UricAcidManagerProps) {
  const [records, setRecords] = useState<UricAcidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UricAcidRecord | null>(null);
  // 固定使用μmol/L单位
const UNIT = 'μmol/L';
  const { gender } = useUser();
  const [newRecord, setNewRecord] = useState({
    value: '',
    measurement_date: '',
    notes: ''
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{ value: number; date: string; unit?: 'mmol/L' | 'mg/dL' | 'μmol/L'; confidence?: number } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:13000/api/uric-acid/records?user_id=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取记录失败');
      }

      setRecords(data.records);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchRecords();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageSelected = (file: File) => {
    setUploadedImage(file);
  };

  const handleImageExtracted = (data: { value: number; date: string; unit?: 'mmol/L' | 'mg/dL' | 'μmol/L'; confidence?: number }) => {
    setExtractedData(data);

    // Convert all units to μmol/L for consistency
    let displayValue = data.value;
    if (data.unit === 'mmol/L') {
      displayValue = data.value * 1000; // Convert mmol/L to μmol/L
    } else if (data.unit === 'mg/dL') {
      displayValue = data.value * 59.48; // Convert mg/dL to μmol/L
    }
    // If already μmol/L, no conversion needed

    // Pre-fill the form with extracted data
    setNewRecord({
      value: Math.round(displayValue).toString(), // Round to whole number
      measurement_date: new Date(data.date).toISOString().slice(0, 16),
      notes: newRecord.notes
    });
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    // If we have extracted data but haven't confirmed, show confirmation dialog
    if (extractedData && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isEditing = editingRecord !== null;
      const url = isEditing
        ? `http://localhost:13000/api/uric-acid/records/${editingRecord.id}`
        : 'http://localhost:13000/api/uric-acid/records';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          value: parseFloat(newRecord.value), // Always in μmol/L
          measurement_date: newRecord.measurement_date || new Date().toISOString(),
          notes: newRecord.notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isEditing ? '更新记录失败' : '添加记录失败'));
      }

      // Reset form state
      setNewRecord({ value: '', measurement_date: '', notes: '' });
      setUploadedImage(null);
      setExtractedData(null);
      setShowConfirmation(false);
      setShowAddForm(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : (editingRecord ? '更新记录失败' : '添加记录失败'));
    } finally {
      setLoading(false);
    }
  };

  const cancelAddRecord = () => {
    setNewRecord({ value: '', measurement_date: '', notes: '' });
    setUploadedImage(null);
    setExtractedData(null);
    setShowConfirmation(false);
    setShowAddForm(false);
    setEditingRecord(null);
  };

  const handleEditRecord = (record: UricAcidRecord) => {
    setEditingRecord(record);
    setNewRecord({
      value: record.value.toString(),
      measurement_date: new Date(record.measurement_date).toISOString().slice(0, 16),
      notes: record.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:13000/api/uric-acid/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '删除记录失败');
      }

      fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除记录失败');
    } finally {
      setLoading(false);
    }
  };

  // No longer needed since we use only μmol/L

  const getUricAcidLevel = (value: number): { level: string; color: string } => {
    // Convert μmol/L to mmol/L for level determination
    const mmolValue = value / 1000; // Convert μmol/L to mmol/L
    const threshold = gender === 'female' ? 360 : 420; // Thresholds in μmol/L (6.0 and 7.0 mmol/L)

    if (value < threshold) return { level: '正常', color: 'text-green-600' };
    if (value < 900) return { level: '偏高', color: 'text-yellow-600' }; // 9.0 mmol/L = 900 μmol/L
    return { level: '过高', color: 'text-red-600' };
  };

  const getThresholds = () => {
    const normal = gender === 'female' ? 360 : 420; // μmol/L
    const high = 900; // μmol/L (9.0 mmol/L)
    return { normal, high };
  };

  const getGenderSpecificInfo = () => {
    if (gender === 'female') {
      return {
        normalRange: '150-360 μmol/L (正常范围)',
        recommendation: '女性尿酸正常值较低，请注意控制饮食'
      };
    } else if (gender === 'male') {
      return {
        normalRange: '210-420 μmol/L (正常范围)',
        recommendation: '男性尿酸正常值相对较高，但仍需注意控制'
      };
    }
    return {
      normalRange: '210-420 μmol/L (正常范围)',
      recommendation: '请设置性别信息以获取更准确的建议'
    };
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">尿酸记录管理</h2>
          <div className="text-sm text-gray-600 mt-1">
            {getGenderSpecificInfo().normalRange}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            单位: <span className="font-medium text-gray-800">μmol/L</span>
            <span className="text-xs text-gray-500 ml-2">
              (正常范围: {gender === 'female' ? '150-360' : gender === 'male' ? '210-420' : '150-420'})
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            添加记录
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingRecord ? '编辑尿酸记录' : '添加尿酸记录'}
          </h3>

          {/* Confirmation Dialog */}
          {showConfirmation && extractedData && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">请确认识别结果</span>
              </div>
              <div className="text-sm text-blue-700 mb-3">
                <p>系统已从医疗报告中识别出以下信息：</p>
                <div className="mt-2 space-y-1">
                  <p>• 尿酸值: <span className="font-medium">{extractedData.value} {extractedData.unit || 'mmol/L'}</span></p>
                  <p>• 检测日期: <span className="font-medium">{new Date(extractedData.date).toLocaleDateString('zh-CN')}</span></p>
                  {extractedData.unit && (
                    <p>• 检测单位: <span className="font-medium">{extractedData.unit}</span></p>
                  )}
                  {extractedData.confidence && (
                    <p>• 识别置信度: <span className="font-medium">{Math.round(extractedData.confidence * 100)}%</span></p>
                  )}
                </div>
                {extractedData.confidence && extractedData.confidence < 0.8 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ 识别置信度较低，建议仔细核对数据准确性
                  </div>
                )}
                <p className="mt-2 text-blue-600">请检查下方表单中的数据，系统已根据识别结果自动设置了单位。如需修改请调整后点击&ldquo;确认保存&rdquo;。</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  返回修改
                </button>
              </div>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传检验报告 (可选)
            </label>
            <ImageUploadButton
              onImageSelected={handleImageSelected}
              onImageExtracted={handleImageExtracted}
              uploadType="medical"
            />
          </div>

          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  尿酸值 (μmol/L) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1200"
                  value={newRecord.value}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, value: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入尿酸值 (μmol/L)"
                />
                <div className="text-xs text-gray-500 mt-1">
                  健康范围: {gender === 'female' ? '150-360 μmol/L' : gender === 'male' ? '210-420 μmol/L' : '150-420 μmol/L'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  测量时间
                </label>
                <input
                  type="datetime-local"
                  value={newRecord.measurement_date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, measurement_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入备注（可选）"
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (editingRecord ? '更新中...' : '添加中...') : (showConfirmation ? '确认保存' : (editingRecord ? '更新' : '保存'))}
              </button>
              <button
                type="button"
                onClick={cancelAddRecord}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading && records.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无尿酸记录，点击&ldquo;添加记录&rdquo;开始记录您的尿酸值
            </div>
          ) : (
            records.map((record) => {
              const { level, color } = getUricAcidLevel(record.value);
              return (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {Math.round(record.value)} μmol/L
                        </span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${color} bg-gray-50`}>
                          {level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        测量时间: {new Date(record.measurement_date).toLocaleString('zh-CN')}
                      </div>
                      {record.notes && (
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          备注: {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-xs text-gray-400">
                        {new Date(record.created_at).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="编辑"
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                          title="删除"
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}