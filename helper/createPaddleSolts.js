const createTimeSlots = (startTime, endTime, duration, numberOfSeats) => {
  const slots = [];
  const currentTime = new Date(startTime);

  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      numberOfSeats: numberOfSeats,
      availableSeats: numberOfSeats,
    });

    currentTime.setTime(currentTime.getTime() + duration * 60000);
  }

  return slots;
};

// Example usage
const startTime = new Date("2024-09-01T08:00:00Z"); // 8 AM
const endTime = new Date("2024-09-01T21:00:00Z"); // 9 PM
const duration = 60; // 60 minutes
const numberOfSeats = 5;

const slots = createTimeSlots(startTime, endTime, duration, numberOfSeats);
