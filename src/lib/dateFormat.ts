export const formatDatePL = (dateStr: string | Date | null | undefined, includeTime = false): string => {
  if (!dateStr) return '';
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    if (isNaN(date.getTime())) return String(dateStr);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    
    return `${day}.${month}.${year}`;
  } catch (e) {
    return String(dateStr);
  }
};

export const formatTimePL = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  
  if (timeStr.includes('T')) {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return timeStr.substring(0, 5);
};

export const getCurrentDatePL = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
};

export const getCurrentTimePL = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getCurrentDateTimePL = (): string => {
  return `${getCurrentDatePL()} ${getCurrentTimePL()}`;
};

export const toISODateString = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
