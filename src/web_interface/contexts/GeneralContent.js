import React, { createContext, useContext } from 'react';

// Create GeneralContext
const GeneralContext = createContext();

// Create a provider component
export const GeneralProvider = ({ children }) => {

  // Function to format nanosecond timestamp to readable date
  function formatTimestampToReadableDate(nanoseconds) {
    const nanosecondsBigInt = BigInt(nanoseconds);
    const millisecondsBigInt = nanosecondsBigInt / BigInt(1_000_000);
    const milliseconds = Number(millisecondsBigInt);
  
    // Create a Date object using the milliseconds
    const date = new Date(milliseconds);
    
    // Set the locale explicitly to Bulgarian (bg-BG)
    const userLocale = 'bg-BG'; // Bulgarian locale
  
    // Format the date based on the Bulgarian locale, without the timeZoneName
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      // timeZoneName: 'short', // This is removed to hide the timezone
    };
  
    const formattedDate = new Intl.DateTimeFormat(userLocale, options).format(date);
  
    return formattedDate;
  }

  function calculateTimeLeft(expiresAt) {
    const expiresInMs = Number(expiresAt) / 1_000_000; // Convert nanoseconds to milliseconds
    const now = new Date();
    const difference = expiresInMs - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      // const seconds = Math.floor((difference / 1000) % 60);
      return { days, hours, minutes };
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  };

  // Copy the principal to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  };

  const cutAddr = (id) => {
    if (id.length > 12) {
      return `${id.slice(0, 11)}...${id.slice(-9)}`;
    }
    return id; // If the ID is too short to format, return it as is.
  };

  const formatWithDecimals = (balance, decimals) => {
    const divisor = BigInt(10) ** BigInt(decimals);
    const integerPart = balance / divisor;
    const fractionalPart = balance % divisor;
    const integerString = integerPart.toLocaleString();

    let fractionalString = fractionalPart.toString().padStart(Number(decimals), '0');
    
    // Remove unnecessary trailing zeros from fractional part
    fractionalString = fractionalString.replace(/0+$/, '');
  
    // If the fractional part becomes empty (i.e., it's all zeros), just return the integer part
    return fractionalString ? `${integerString}.${fractionalString}` : integerString;
  };

  return (
    <GeneralContext.Provider value={{ 
      formatTimestampToReadableDate, 
      calculateTimeLeft,
      copyToClipboard,
      cutAddr,
      formatWithDecimals
    }}>
      {children}
    </GeneralContext.Provider>
  );
};

// Custom hook for easier access to the context
export const useGeneralContext = () => useContext(GeneralContext);
