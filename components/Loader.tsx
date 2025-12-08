
import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
  return (
    <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-purple-400" style={{ animationDelay: '0.4s' }}></div>
        <span className="text-lg font-semibold ml-2">{text}</span>
      </div>
    </div>
  );
};

export default Loader;