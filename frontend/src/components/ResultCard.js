import React from 'react';

function ResultCard({ result, onReset }) {
  return (
    <div>

      {/* hero result */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-center mb-4 shadow-xl shadow-blue-200">
        <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-widest">
          Estimated Fuel Cost
        </p>
        <p className="text-white text-7xl font-extrabold tracking-tight mb-1">
          ${result.total_cost}
        </p>
        <p className="text-blue-300 text-sm">
          for your entire trip
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Distance</p>
          <p className="text-2xl font-bold text-gray-800">{result.distance_miles} <span className="text-base font-normal text-gray-400">mi</span></p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Gallons Used</p>
          <p className="text-2xl font-bold text-gray-800">{result.gallons_used} <span className="text-base font-normal text-gray-400">gal</span></p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Adjusted MPG</p>
          <p className="text-2xl font-bold text-gray-800">{result.adjusted_mpg} <span className="text-base font-normal text-gray-400">mpg</span></p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Traffic Type</p>
          <p className="text-2xl font-bold text-gray-800 capitalize">{result.traffic}</p>
        </div>
      </div>

      {/* calculate again */}
      <button
        onClick={onReset}
        className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 font-semibold py-4 rounded-2xl transition-all duration-150"
      >
        ← Calculate Another Trip
      </button>

    </div>
  );
}

export default ResultCard;