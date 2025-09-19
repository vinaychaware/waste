import React from 'react';
import { Heart } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Heart className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to React
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Your application is now running successfully! This is a beautiful, 
          production-ready React app built with Vite, TypeScript, and Tailwind CSS.
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Ready to build</h3>
            <p className="text-sm text-gray-600">
              Start editing <code className="bg-gray-200 px-2 py-1 rounded text-xs">src/App.tsx</code> to customize your app
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              React 18
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              TypeScript
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              Tailwind CSS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;