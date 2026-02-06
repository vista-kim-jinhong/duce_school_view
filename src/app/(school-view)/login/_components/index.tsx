"use client";

import {
  UserIcon,
  LockClosedIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

/**
 * Login Box Component
 */
export default function LoginBox() {
  return (
    <div className="w-full max-w-sm rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          DUCE School View
        </h1>
        <p className="mt-1 text-sm text-gray-500">ログイン</p>
      </div>

      {/* Form */}
      <div className="px-6 pb-6 space-y-4">
        {/* User ID */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Login ID
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ユーザーID"
              className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm
                         focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Password
          </label>
          <div className="relative">
            <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="パスワード"
              className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm
                         focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          type="button"
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-md
                     bg-red-700 text-white py-2 text-sm font-medium
                     hover:bg-red-800 transition"
          onClick={() => {
            // TODO: ログイン処理
            location.href = "/main";
          }}
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          Login
        </button>
      </div>
    </div>
  );
}
