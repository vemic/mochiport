export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS テスト
        </h1>
        <p className="text-gray-600 mb-6">
          このページでTailwind CSSが正しく動作しているか確認できます。
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            プライマリボタン
          </button>
          <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
            セカンダリボタン
          </button>
        </div>
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">
            この緑色のボックスが表示されていれば、Tailwind CSSは正常に動作しています。
          </p>
        </div>
      </div>
    </div>
  );
}