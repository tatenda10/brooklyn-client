import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoneyBillWave, 
  faCalendarAlt, 
  faDownload, 
  faPrint,
  faFilter,
  faArrowUp,
  faArrowDown,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import BASE_URL from '../../contexts/Api';

const CashFlow = () => {
  const { token } = useAuth();
  const [reportType, setReportType] = useState('monthly'); // monthly | custom
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      if (reportType === 'monthly') {
        const resp = await axios.get(`${BASE_URL}/accounting/cash-flow/month/${selectedMonth}/year/${selectedYear}`, {
          headers: authHeaders
        });
        setData(resp.data);
      } else if (reportType === 'custom') {
        if (!startDate || !endDate) {
          setError('Please select both start and end dates');
          setLoading(false);
          return;
        }
        const params = new URLSearchParams({ start: startDate, end: endDate }).toString();
        const resp = await axios.get(`${BASE_URL}/accounting/cash-flow/range?${params}`, {
          headers: authHeaders
        });
        setData(resp.data);
      }
    } catch (e) {
      console.error('Error loading cash flow:', e);
      setError(e.response?.data?.error || 'Failed to load cash flow statement');
    } finally {
      setLoading(false);
    }
  };

  const totals = data?.totals || { 
    net_operating_cash: 0, 
    net_investing_cash: 0, 
    net_financing_cash: 0, 
    net_cash_flow: 0,
    beginning_cash: 0,
    ending_cash: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-2 md:px-4 lg:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">Cash Flow Statement</h1>
              <p className="text-xs text-gray-600 mt-1">Cash Movement Report</p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto">
              <button className="bg-gray-600 text-white px-2 md:px-3 py-1.5 hover:bg-gray-700 flex items-center space-x-1 md:space-x-2 text-xs font-medium w-full sm:w-auto justify-center">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export</span>
              </button>
              <button className="bg-gray-600 text-white px-2 md:px-3 py-1.5 hover:bg-gray-700 flex items-center space-x-1 md:space-x-2 text-xs font-medium w-full sm:w-auto justify-center">
                <FontAwesomeIcon icon={faPrint} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-2 md:px-4 lg:px-6 py-3">
          <div className="flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 flex-1">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFilter} className="text-gray-400 text-xs" />
                <span className="text-xs font-medium text-gray-700">Report Type:</span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-gray-400 w-full sm:w-auto"
                >
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {reportType === 'monthly' && (
                <>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                    <span className="text-xs font-medium text-gray-700">Month:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-gray-400 w-full sm:w-auto"
                    >
                      <option value={1}>January</option>
                      <option value={2}>February</option>
                      <option value={3}>March</option>
                      <option value={4}>April</option>
                      <option value={5}>May</option>
                      <option value={6}>June</option>
                      <option value={7}>July</option>
                      <option value={8}>August</option>
                      <option value={9}>September</option>
                      <option value={10}>October</option>
                      <option value={11}>November</option>
                      <option value={12}>December</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                    <span className="text-xs font-medium text-gray-700">Year:</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-gray-400 w-full sm:w-auto"
                    >
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                  </div>
                </>
              )}

              {reportType === 'custom' && (
                <>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                    <span className="text-xs font-medium text-gray-700">Start Date:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-gray-400 w-full sm:w-auto"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                    <span className="text-xs font-medium text-gray-700">End Date:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-gray-400 w-full sm:w-auto"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gray-900 text-white px-3 md:px-4 py-1.5 hover:bg-gray-800 disabled:opacity-50 flex items-center space-x-2 text-xs font-medium w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span>{loading ? 'Loading...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 md:p-4 lg:p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 mb-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-6 md:py-8 text-gray-600 text-xs md:text-sm">Loading cash flow statement...</div>
        )}

        {!loading && !data && !error && (
          <div className="bg-white border border-gray-200 p-6 md:p-8 text-center">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-400 text-3xl md:text-4xl mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Cash Flow Data</h3>
            <p className="text-gray-500 text-xs md:text-sm">Choose filters and click Search.</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-white border border-gray-200 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Operating</p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totals.net_operating_cash)}</p>
                  </div>
                  <div className="bg-gray-100 p-2">
                    <FontAwesomeIcon icon={faArrowUp} className="text-gray-600 text-xs md:text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Investing</p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totals.net_investing_cash)}</p>
                  </div>
                  <div className="bg-gray-100 p-2">
                    <FontAwesomeIcon icon={faArrowDown} className="text-gray-600 text-xs md:text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Financing</p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totals.net_financing_cash)}</p>
                  </div>
                  <div className="bg-gray-100 p-2">
                    <FontAwesomeIcon icon={faArrowUp} className="text-gray-600 text-xs md:text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Net Cash Flow</p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totals.net_cash_flow)}</p>
                  </div>
                  <div className="bg-gray-100 p-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-gray-600 text-xs md:text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 md:p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Ending Cash</p>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{formatCurrency(totals.ending_cash)}</p>
                  </div>
                  <div className="bg-gray-100 p-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-gray-600 text-xs md:text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Statement Details */}
            <div className="bg-white border border-gray-200">
              <div className="px-3 md:px-6 py-3 border-b border-gray-200">
                <h2 className="text-sm md:text-base font-semibold text-gray-900">Cash Flow Statement</h2>
                <p className="text-xs text-gray-600">
                  {data.period?.period_name ? data.period.period_name : 
                   (data.start_date && data.end_date ? `${data.start_date} to ${data.end_date}` : '')}
                </p>
              </div>

              <div className="p-3 md:p-6">
                {/* Beginning Cash Balance */}
                <div className="mb-4 md:mb-6">
                  <div className="flex justify-between items-center py-2 px-2 bg-gray-100">
                    <span className="text-xs font-bold text-gray-900">Beginning Cash Balance</span>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(totals.beginning_cash)}</span>
                  </div>
                </div>

                {/* Operating Activities */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Operating Activities</h3>
                  <div className="space-y-0">
                    {(data.operating_activities || []).map((item, index) => (
                      <div key={index} className={`flex justify-between items-center py-1.5 px-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-700 truncate flex-1 min-w-0">{item.activity_name}</span>
                        <span className="text-xs font-medium text-gray-900 flex-shrink-0 ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 px-2 border-t border-gray-200 bg-gray-100">
                      <span className="text-xs font-bold text-gray-900">Net Cash from Operating Activities</span>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(totals.net_operating_cash)}</span>
                    </div>
                  </div>
                </div>

                {/* Investing Activities */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Investing Activities</h3>
                  <div className="space-y-0">
                    {(data.investing_activities || []).map((item, index) => (
                      <div key={index} className={`flex justify-between items-center py-1.5 px-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-700 truncate flex-1 min-w-0">{item.activity_name}</span>
                        <span className="text-xs font-medium text-gray-900 flex-shrink-0 ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 px-2 border-t border-gray-200 bg-gray-100">
                      <span className="text-xs font-bold text-gray-900">Net Cash from Investing Activities</span>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(totals.net_investing_cash)}</span>
                    </div>
                  </div>
                </div>

                {/* Financing Activities */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">Financing Activities</h3>
                  <div className="space-y-0">
                    {(data.financing_activities || []).map((item, index) => (
                      <div key={index} className={`flex justify-between items-center py-1.5 px-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-700 truncate flex-1 min-w-0">{item.activity_name}</span>
                        <span className="text-xs font-medium text-gray-900 flex-shrink-0 ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 px-2 border-t border-gray-200 bg-gray-100">
                      <span className="text-xs font-bold text-gray-900">Net Cash from Financing Activities</span>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(totals.net_financing_cash)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Cash Flow and Ending Balance */}
                <div className="border-t border-gray-300 pt-3 md:pt-4">
                  <div className="flex justify-between items-center py-2 md:py-3 px-2 md:px-3 bg-gray-100 border-b-2 border-gray-400">
                    <span className="text-xs font-bold text-gray-900">Net Cash Flow</span>
                    <span className="text-xs font-bold text-gray-900 border-b-2 border-gray-900">{formatCurrency(totals.net_cash_flow)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 md:py-3 px-2 md:px-3 bg-gray-100 border-b-2 border-gray-400">
                    <span className="text-xs font-bold text-gray-900">Ending Cash Balance</span>
                    <span className="text-xs font-bold text-gray-900 border-b-2 border-gray-900">{formatCurrency(totals.ending_cash)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlow;
