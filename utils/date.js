export function getLocalDateKey(date = new Date()) {
  return date.toLocaleDateString("en-CA");
}

export function formatDateForDisplay(dateString) {
  // Handle date strings like "2025-07-31" without timezone issues
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${month}/${day}`;
  }
  
  // Handle simplified date strings like "7/31" (already in correct format)
  if (typeof dateString === 'string' && dateString.includes('/')) {
    return dateString; // Already in the format we want
  }
  
  // Handle Date objects as before
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
