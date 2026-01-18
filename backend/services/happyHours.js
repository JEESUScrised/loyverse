function isHappyHour(venue) {
  if (!venue.happyHoursSchedule) {
    return false
  }

  try {
    const now = new Date()
    // Convert JavaScript day (0 = Sunday, 1 = Monday) to our format (1 = Monday, 7 = Sunday)
    const jsDay = now.getDay()
    const currentDay = jsDay === 0 ? 7 : jsDay
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const schedule = typeof venue.happyHoursSchedule === 'string'
      ? JSON.parse(venue.happyHoursSchedule)
      : venue.happyHoursSchedule

    if (!schedule || typeof schedule !== 'object') {
      return false
    }

    const daySchedule = schedule[currentDay]
    if (!daySchedule || !daySchedule.enabled || !daySchedule.start || !daySchedule.end) {
      return false
    }

    const [startHour, startMin] = daySchedule.start.split(':').map(Number)
    const [endHour, endMin] = daySchedule.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    return currentTime >= startTime && currentTime <= endTime
  } catch (error) {
    console.error('Error checking happy hours:', error)
    return false
  }
}

export { isHappyHour }
