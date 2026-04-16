import React from 'react';

function ResultCard({ result }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 mt-6">

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        🧾 Your Trip Estimate
      </h2>

      {/* total cost - hero number */}
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-center mb-6">
        <p className="text-white text-sm font-medium mb-1 opacity-90">
          Estimated Total Fuel Cost
        </p>
        <p className="text-white text-6xl font-bold">
          ${result.total_cost}
        </p>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">🛣️</p>
          <p className="text-xs text-gray-400 mb-1">Distance</p>
          <p className="text-xl font-bold text-gray-700">
            {result.distance_miles}
            <span className="text-sm font-normal text-gray-400 ml-1">mi</span>
          </p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">⛽</p>
          <p className="text-xs text-gray-400 mb-1">Gallons Used</p>
          <p className="text-xl font-bold text-gray-700">
            {result.gallons_used}
            <span className="text-sm font-normal text-gray-400 ml-1">gal</span>
          </p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-xs text-gray-400 mb-1">Adjusted MPG</p>
          <p className="text-xl font-bold text-gray-700">
            {result.adjusted_mpg}
            <span className="text-sm font-normal text-gray-400 ml-1">mpg</span>
          </p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">🚦</p>
          <p className="text-xs text-gray-400 mb-1">Traffic</p>
          <p className="text-xl font-bold text-gray-700 capitalize">
            {result.traffic}
          </p>
        </div>
      </div>

      {/* calculate again button */}
      <button
        onClick={() => window.location.reload()}
        className="w-full mt-6 border-2 border-blue-200 text-blue-500 hover:bg-blue-50 font-semibold py-3 rounded-2xl transition"
      >
        Calculate Another Trip
      </button>

    </div>
  );
}

export default ResultCard;