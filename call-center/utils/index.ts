export * from './audioDeviceHelpers';

/**
 * Formats a phone number for display
 * @param phoneNumber The raw phone number
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different phone number formats based on length
  if (cleaned.length === 10) {
    // Format as (XXX) XXX-XXXX for US numbers
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Format as +1 (XXX) XXX-XXXX for US numbers with country code
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else {
    // For international numbers, use a simple format
    if (cleaned.length > 10) {
      return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
    }
    
    // If it's a short number, return as is with spaces every 3 digits
    return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
};

/**
 * Formats call duration in seconds to a readable format
 * @param seconds The duration in seconds
 * @returns Formatted duration string
 */
export const formatCallDuration = (seconds: number): string => {
  if (!seconds) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats a date to a readable string
 * @param timestamp The timestamp to format
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Sanitizes a phone number for API calls
 * @param phoneNumber The input phone number
 * @returns Sanitized phone number (digits only with leading +)
 */
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except leading +
  let sanitized = phoneNumber.trim();
  if (sanitized.startsWith('+')) {
    sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
  } else {
    sanitized = sanitized.replace(/\D/g, '');
  }
  
  return sanitized;
};

/**
 * Check if the device is in landscape orientation
 * @param width The screen width
 * @param height The screen height
 * @returns True if the device is in landscape orientation
 */
export const isLandscape = (width: number, height: number): boolean => {
  return width > height;
};