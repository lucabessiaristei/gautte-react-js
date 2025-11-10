export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function formatDateForGTFS(dateStr) {
  return dateStr.replace(/-/g, '');
}

export function isTripActive(service, dateStr, timeStr) {
  if (!service) return false;

  if (dateStr < service.start_date || dateStr > service.end_date) {
    return false;
  }

  const date = new Date(
    dateStr.slice(0, 4),
    parseInt(dateStr.slice(4, 6)) - 1,
    dateStr.slice(6, 8)
  );
  const dayOfWeek = date.getDay();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  if (service.days[dayNames[dayOfWeek]] !== 1) {
    return false;
  }

  const exception = service.dates?.find(ex => ex.date === dateStr);
  if (exception) {
    return exception.exception_type === 1;
  }

  return true;
}