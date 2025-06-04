'use client';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-red-500">TEST PAGE</h1>
      <p className="mt-4 text-lg">This is a test page to verify the app is working.</p>
      <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded">
        <p>If you can see this styled content, the app is working correctly.</p>
      </div>
    </div>
  );
}
