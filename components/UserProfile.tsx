'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

interface UserProfileProps {
  user: any;
  onAuthSuccess: (user: any) => void;
  onLogout: () => void;
}

export default function UserProfile({ user, onAuthSuccess, onLogout }: UserProfileProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isEditing, setIsEditing] = useState(false);
  const { gender, setGender } = useUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">用户中心</h2>
          <p className="text-gray-600">登录后可使用更多功能</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 尿酸记录</h3>
            <p className="text-sm text-blue-700">
              记录和管理您的尿酸值，查看历史趋势
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📈 趋势分析</h3>
            <p className="text-sm text-green-700">
              可视化展示尿酸变化趋势，健康建议
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎯 个性化服务</h3>
            <p className="text-sm text-purple-700">
              根据您的数据提供个性化健康建议
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setAuthMode('login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            立即登录
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setAuthMode('register')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            还没有账户？点击注册
          </button>
        </div>

        {authMode && (
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">
                {authMode === 'register' ? '用户注册' : '用户登录'}
              </h3>
              <AuthForm
                mode={authMode}
                onModeChange={setAuthMode}
                onAuthSuccess={onAuthSuccess}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">用户中心</h2>
        <p className="text-gray-600">管理您的账户和设置</p>
      </div>

      {/* 用户信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white shadow">
              <span className="text-2xl font-bold">
                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.username || '用户'}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500">手机: {user.phone}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isEditing ? '取消' : '编辑'}
          </button>
        </div>

        {/* 性别设置 */}
        <div className="bg-white/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">性别</p>
              <p className="text-xs text-gray-500">用于准确的尿酸健康评估</p>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      gender === g
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-800">
                {gender === 'male' ? '👨 男性' : '👩 女性'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 功能统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">📊</div>
          <p className="text-sm text-gray-600 mt-1">尿酸记录</p>
          <p className="text-lg font-semibold">查看历史</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">📈</div>
          <p className="text-sm text-gray-600 mt-1">趋势分析</p>
          <p className="text-lg font-semibold">数据可视化</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">🎯</div>
          <p className="text-sm text-gray-600 mt-1">健康建议</p>
          <p className="text-lg font-semibold">个性化推荐</p>
        </div>
      </div>

      {/* 应用信息 */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">关于应用</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• AI 痛风饮食助手 v1.0</p>
            <p>• 智能食物识别功能</p>
            <p>• 尿酸值管理和趋势分析</p>
            <p>• 个性化健康建议</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">尿酸标准说明</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <span className="font-medium">男性正常值</span>: 210-420 μmol/L</p>
            <p>• <span className="font-medium">女性正常值</span>: 150-360 μmol/L</p>
            <p>• <span className="font-medium">偏高</span>: 超过正常值但低于900 μmol/L</p>
            <p>• <span className="font-medium">过高</span>: ≥900 μmol/L</p>
            <p className="text-xs text-blue-600 mt-2">* 请在个人资料中设置性别以获得准确评估</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">健康提醒</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• 定期检测尿酸值，保持健康生活</p>
            <p>• 避免高嘌呤食物，多喝水</p>
            <p>• 适量运动，保持良好作息</p>
            <p>• 如有不适，及时就医</p>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onLogout}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          退出登录
        </button>
        <button
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          设置
        </button>
      </div>
    </div>
  );
}

// 导入 AuthForm 组件
import AuthForm from './AuthForm';