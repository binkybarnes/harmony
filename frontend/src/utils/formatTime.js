export function formatTime(timestamp) {
  const date = new Date(timestamp);

  // Format the date to 'MM/DD/YYYY hh:mm AM/PM'
  const formatted_date = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return formatted_date;
}
