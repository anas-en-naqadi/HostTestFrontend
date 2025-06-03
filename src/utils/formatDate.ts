


export function formatDate(input: Date | string | number): string {
  const date = new Date(input);
  // Optionally, you could guard against invalid dates:
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date passed to formatDate(): ${input}`);
  }

  // toLocaleDateString doesn't include a comma by default in en-GB, so we insert one
  // between the date and the time.
  const [dayMonthYear, time] = date
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false, // remove if you prefer 12h format with AM/PM
    })
    .split(", ");
  
  return `${dayMonthYear}, ${time}`;
}
