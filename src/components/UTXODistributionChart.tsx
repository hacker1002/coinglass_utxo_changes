import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UTXODistributionChart = () => {
  const [utxoData, setUtxoData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and process data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from public folder
        const response = await fetch('/utxo_data_lastweek.json');
        const data = await response.json();
        
        // Use first day as baseline
        const baselinePartitions = data[0].partitions;
        
        // Process data
        const processed = data.map((day: any, index: number) => {
          const date = new Date(day.t * 1000);
          const distributionChanges = day.partitions.map((value: number, i: number) => 
            value - baselinePartitions[i]
          );
          
          return {
            date: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('en-US'),
            timestamp: day.t,
            distributionChanges: distributionChanges,
            currentPrice: day.current_price,
            totalSupply: day.total_supply,
            prices: day.prices
          };
        });
        
        setUtxoData(processed);
        
        // Set first date as default (or second date to show actual changes)
        const defaultDate = processed.length > 1 ? processed[1].date : processed[0].date;
        setSelectedDate(defaultDate);
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
    if (selectedDate && utxoData.length > 0) {
      const selectedDay = utxoData.find(d => d.date === selectedDate);
      if (selectedDay) {
        // Create chart data with price ranges and distribution changes
        const chartData = selectedDay.distributionChanges.map((change: number, index: number) => {
          const priceRange = index < selectedDay.prices.length - 1 
            ? `${(selectedDay.prices[index]/1000).toFixed(0)}k-${(selectedDay.prices[index + 1]/1000).toFixed(0)}k`
            : `${(selectedDay.prices[index]/1000).toFixed(0)}k+`;
            
          return {
            priceRange,
            distributionChange: change,
            index: index
          };
        });
        setChartData(chartData);
      }
    }
  }, [selectedDate, utxoData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Price Range: $${label}`}</p>
          <p className="text-blue-600">
            {`Distribution Change: ${payload[0].value > 0 ? '+' : ''}${payload[0].value.toLocaleString()} BTC`}
          </p>
          <p className="text-gray-600 text-sm">{`Range Index: ${data.index + 1}/100`}</p>
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

  const selectedDayInfo = utxoData.find(d => d.date === selectedDate);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          UTXO Distribution Change Analysis
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
            {utxoData.map((day) => (
              <option key={day.date} value={day.date}>
                {day.displayDate} (${day.currentPrice.toLocaleString()})
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
                <span className="text-gray-900">{selectedDayInfo.displayDate}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">BTC Price: </span>
                <span className="text-green-600">${selectedDayInfo.currentPrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Supply: </span>
                <span className="text-blue-600">{selectedDayInfo.totalSupply.toLocaleString()} BTC</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribution Change by Price Range (vs Baseline: {utxoData[0]?.displayDate})
        </h3>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="priceRange"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={10}
              interval={4} // Show every 5th label to avoid crowding
            />
            <YAxis 
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${(value/1000).toFixed(0)}k`}
              fontSize={12}
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
          <p><span className="font-semibold">Note:</span> Distribution changes show the difference from the baseline date ({utxoData[0]?.displayDate})</p>
          <p><span className="text-green-600 font-semibold">Green bars:</span> Increased UTXO amounts | <span className="text-red-600 font-semibold">Red bars:</span> Decreased UTXO amounts</p>
          <p>X-axis shows 100 price ranges from $0 to ATH price, Y-axis shows distribution change in BTC</p>
        </div>
      </div>
    </div>
  );
};

export default UTXODistributionChart;