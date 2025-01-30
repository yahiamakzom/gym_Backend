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


