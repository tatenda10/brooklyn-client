import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../contexts/StudentAuthContext';
import { Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import BASE_URL from '../contexts/Api';

const Attendance = () => {
  const { student, token } = useStudentAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Fetch attendance data
  const fetchAttendance = async () => {
    if (!student?.RegNumber) {
      console.log('No student RegNumber available');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const url = `${BASE_URL}/student-attendance/history/${student.RegNumber}`;
      console.log('Fetching attendance from:', url);
      console.log('Student RegNumber:', student.RegNumber);
      console.log('Token available:', !!token);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.data || []);
      } else {
        // Check if response is HTML (error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          setError('Server error - please check if the server is running');
        } else {
          try {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to fetch attendance data');
          } catch (parseError) {
            setError('Failed to parse error response');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the server is running.');
      } else {
        setError('Failed to fetch attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Student object:', student);
    console.log('Student RegNumber:', student?.RegNumber);
    fetchAttendance();
  }, [student?.RegNumber]);

  // Get attendance for a specific date
  const getAttendanceForDate = (day) => {
    if (!day) return null;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceData.find(record => record.attendance_date === dateStr);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day) return;
    
    const attendance = getAttendanceForDate(day);
    if (attendance) {
      setSelectedDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      setSelectedAttendance(attendance);
    }
  };

  // Calculate attendance statistics
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(record => record.status === 'present').length;
  const absentDays = attendanceData.filter(record => record.status === 'absent').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Attendance</h1>
        <p className="text-gray-600">View your attendance history and track your presence</p>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Info className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Percentage</p>
              <p className="text-2xl font-bold text-purple-600">{attendancePercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {attendanceData.length === 0 && !loading && (
            <div className="text-center py-8 mb-6 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
              <p className="text-gray-600">No attendance records found for the current period.</p>
            </div>
          )}
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              const attendance = getAttendanceForDate(day);
              
              return (
                <div
                  key={index}
                  className={`p-2 h-12 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors ${
                    day
                      ? attendance
                        ? attendance.status === 'present'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'hover:bg-gray-100'
                      : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day && (
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{day}</span>
                      {attendance && (
                        <div className="w-2 h-2 rounded-full mt-1">
                          {attendance.status === 'present' ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attendance Details Modal */}
      {selectedAttendance && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attendance Details - {selectedDate}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedAttendance.status === 'present' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {selectedAttendance.status === 'present' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Status: {selectedAttendance.status.charAt(0).toUpperCase() + selectedAttendance.status.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Marked by: {selectedAttendance.marked_by_name || 'Teacher'}
                  </p>
                </div>
              </div>

              {selectedAttendance.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedAttendance.notes}
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Date: {selectedDate}</p>
                <p>Class: {selectedAttendance.class_name || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedAttendance(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
