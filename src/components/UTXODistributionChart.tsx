import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UTXODistributionChart = () => {
  const [changesData, setChangesData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pre-calculated distribution changes
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch pre-calculated changes data
        const response = await fetch('/distribution_changes.json');
        const data = await response.json();
        
        setChangesData(data);
        
        // Set last date as default
        if (data.length > 0) {
          setSelectedDate(data[data.length - 1].date);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update chart data when date changes
  useEffect(() => {
    if (selectedDate && changesData.length > 0) {
      const selectedDay = changesData.find(d => d.date === selectedDate);
      if (selectedDay) {
        // Create chart data with price ranges and distribution changes
        const chartData = selectedDay.changes.map((change: number, index: number) => {
          const price = selectedDay.prices[index];
          const nextPrice = index < selectedDay.prices.length - 1 
            ? selectedDay.prices[index + 1] 
            : price * 1.5; // Approximate next price for last bucket
          
          const priceRange = price < 1000 
            ? `$${price.toFixed(0)}-${nextPrice.toFixed(0)}`
            : `${(price/1000).toFixed(0)}k-${(nextPrice/1000).toFixed(0)}k`;
            
          return {
            priceRange,
            distributionChange: change,
            index: index,
            price: price
          };
        });
        setChartData(chartData);
      }
    }
  }, [selectedDate, changesData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Price Range: ${label}`}</p>
          <p className={value >= 0 ? "text-green-600" : "text-red-600"}>
            {`Change: ${value >= 0 ? '+' : ''}${value.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} BTC`}
          </p>
          <p className="text-gray-600 text-sm">{`Bucket: ${data.index + 1}/100`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading data...</div>
      </div>
    );
  }

  const selectedDayInfo = changesData.find(d => d.date === selectedDate);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Daily UTXO Distribution Changes
        </h2>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {changesData.map((day) => (
              <option key={day.date} value={day.date}>
                {day.date} (Total: {day.total >= 0 ? '+' : ''}{day.total.toFixed(2)} BTC)
              </option>
            ))}
          </select>
        </div>

        {/* Current Day Info */}
        {selectedDayInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Date: </span>
                <span className="text-gray-900">{selectedDayInfo.date}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Daily Change: </span>
                <span className={selectedDayInfo.total >= 0 ? "text-green-600" : "text-red-600"}>
                  {selectedDayInfo.total >= 0 ? '+' : ''}{selectedDayInfo.total.toFixed(2)} BTC
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Price Buckets: </span>
                <span className="text-blue-600">{selectedDayInfo.prices.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribution Changes by Price Range (Day-over-Day)
        </h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 80, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="priceRange"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={9}
              interval={4} // Show every 5th label to avoid crowding
            />
            <YAxis 
              tickFormatter={(value) => {
                if (Math.abs(value) < 1000) {
                  return value.toFixed(0);
                }
                return `${(value/1000).toFixed(0)}k`;
              }}
              fontSize={11}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="distributionChange" 
              name="Distribution Change"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.distributionChange >= 0 ? "#10b981" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><span className="font-semibold">Note:</span> These are day-over-day changes in UTXO distribution</p>
          <p><span className="text-green-600 font-semibold">Green bars:</span> Increased BTC in this price range | <span className="text-red-600 font-semibold">Red bars:</span> Decreased BTC in this price range</p>
          <p>The total daily change ({selectedDayInfo?.total.toFixed(2)} BTC) represents the net change across all price buckets (mostly from new mining)</p>
        </div>
      </div>
    </div>
  );
};

export default UTXODistributionChart;