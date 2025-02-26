// src/components/Calendar.js - UPDATED
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Calendar.css';

const Calendar = ({ onDateSelect, onClose }) => {
  const { userData } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthData, setMonthData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Create calendar grid data
  useEffect(() => {
    generateMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, userData]);

  const generateMonthData = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Get data about which days have entries
    const daysWithData = getDaysWithEntries(month, year);
    
    let days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', disabled: true });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = formatDateString(year, month, i);
      const isToday = isSameDay(date, today);
      const isFuture = date > today;
      const hasData = daysWithData.includes(i);
      
      days.push({
        day: i,
        date: dateString,
        isToday,
        isFuture,
        disabled: isFuture,
        hasData
      });
    }
    
    setMonthData(days);
  };

  // Get days that have entries in userData.history
  const getDaysWithEntries = (month, year) => {
    if (!userData || !userData.history) return [];
    
    const daysWithData = [];
    
    for (let key in userData.history) {
      // Parse the date string directly to avoid timezone issues
      const [yearStr, monthStr, dayStr] = key.split('-');
      const entryMonth = parseInt(monthStr) - 1; // Convert to 0-indexed month
      const entryYear = parseInt(yearStr);
      const entryDay = parseInt(dayStr);
      
      if (entryMonth === month && entryYear === year) {
        daysWithData.push(entryDay);
      }
    }
    
    return daysWithData;
  };

  // Create a date string directly without Date object conversion
  const formatDateString = (year, month, day) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  // Fixed formatDate function that consistently uses UTC to avoid timezone issues
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const handleDateClick = (day) => {
    if (day.disabled) return;
    
    // Use the pre-formatted date string from the day object
    const dateString = day.date;
    
    // Update selected date for visual feedback
    const newSelectedDate = new Date(currentYear, currentMonth, day.day);
    setSelectedDate(newSelectedDate);
    
    // Pass the exact string format to parent component
    onDateSelect(dateString);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    
    // Only allow moving to next month if it's not in the future
    if (nextMonthDate <= today) {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Month at a glance</h2>
        <div className="month-navigator">
          <button onClick={handlePrevMonth} className="month-nav-button">
            &lt;
          </button>
          <span className="current-month">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={handleNextMonth} 
            className="month-nav-button"
            disabled={new Date(currentYear, currentMonth + 1, 1) > new Date()}
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Weekday headers */}
        {weekdays.map((day, index) => (
          <div key={`weekday-${index}`} className="weekday-header">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {monthData.map((day, index) => {
          // Compare with the formatted date string from the day object
          const isSelected = day.date && day.date === formatDate(selectedDate);
          
          return (
            <div 
              key={`day-${index}`} 
              className={`calendar-day ${day.isToday ? 'today' : ''} 
                        ${day.isFuture ? 'future' : ''} 
                        ${day.disabled ? 'disabled' : ''} 
                        ${day.hasData ? 'has-data' : ''}
                        ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              {day.day}
            </div>
          );
        })}
      </div>
      
      <div className="calendar-footer">
        <button onClick={onClose} className="calendar-close-button">
          <span className="chevron-down">^</span>
        </button>
      </div>
    </div>
  );
};

export default Calendar;