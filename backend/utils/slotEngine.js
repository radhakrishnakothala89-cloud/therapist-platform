// Converts "HH:MM" string to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Converts minutes from midnight back to "HH:MM"
const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const calculateAvailableSlots = ({ availability, dateStr, duration, bookedSessions }) => {
  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[targetDate.getUTCDay()];

  let workingSlots = [];

  // 1. Check one-time date overrides first
  const override = availability.overrides?.find((o) => o.date === dateStr);
  if (override) {
    if (override.isBlocked) {
      return []; // Day is blocked off
    }
    workingSlots = override.slots || [];
  } else {
    // 2. Fall back to recurring weekly schedule
    const daySchedule = availability.weekly?.find((w) => w.day === dayName);
    if (!daySchedule || !daySchedule.isActive) {
      return []; // Day not active
    }
    workingSlots = daySchedule.slots || [];
  }

  // 3. Convert booked sessions into minute ranges
  const bookedRanges = bookedSessions
    .filter((s) => s.status === "confirmed")
    .map((s) => ({
      start: timeToMinutes(s.startTime),
      end: timeToMinutes(s.endTime),
    }));

  const availableSlots = [];
  const stepInterval = 30; // 30-minute interval grid

  // 4. Generate candidate slots inside each working window
  for (const window of workingSlots) {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);

    for (let current = windowStart; current + duration <= windowEnd; current += stepInterval) {
      const slotStart = current;
      const slotEnd = current + duration;

      // Check collision: [slotStart, slotEnd) overlaps if slotStart < booked.end && slotEnd > booked.start
      const hasConflict = bookedRanges.some(
        (booked) => slotStart < booked.end && slotEnd > booked.start
      );

      if (!hasConflict) {
        availableSlots.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
          duration,
        });
      }
    }
  }

  return availableSlots;
};

module.exports = { calculateAvailableSlots, timeToMinutes, minutesToTime };
