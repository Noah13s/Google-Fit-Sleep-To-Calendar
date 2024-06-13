const CalendarName = 'Google Fit Data';

var CurrentDate = new Date().toISOString().split('T')[0];

var request = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${CurrentDate}T00:00:00.00Z&endTime=${CurrentDate}T23:59:59.99Z&activityType=72`;

function sleepToCalendar() {
  parseResponse(fetch());
}

function fetch() {
  var response = UrlFetchApp.fetch(request, {
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });
  return response
}

function parseResponse(response) {
  if (JSON.parse(response.getContentText()).session.length === 0) {
    console.log("No data to update");
    return;
  }
  var data = JSON.parse(response.getContentText());
  var session = data.session[0];
  var sleepStart = (parseInt(session['startTimeMillis']));
  var sleepEnd = (parseInt(session['endTimeMillis']));

  createSleepEvent(sleepStart, sleepEnd);
}

function createSleepEvent(start, end) {
  // Gets all calendars of certain name
  const calenderExists = CalendarApp.getCalendarsByName(CalendarName);
  // Checks if the calender already exists before creating it
  if (calenderExists.length === 0){
    // Creates a new calendar named "Travel Plans" with a summary and color.
    CalendarApp.createCalendar(CalendarName, {
      summary: 'A calendar to plan my travel schedule.',
      color: CalendarApp.Color.BLUE
    });
  } else {
    console.log("Calendar already exists");
  }
  if (!checkSleepEvent()) {
    var timeZone = CalendarApp.getCalendarsByName("Event")[0].getTimeZone();
    // Convert start and end dates to long format timezone strings
    var startLongFormat = new Date(start).toLocaleString('en-US', { timeZone: timeZone });
    var endLongFormat = new Date(end).toLocaleString('en-US', { timeZone: timeZone });
    
    // Creates an event for sleep and logs the ID.
    var event = CalendarApp.getCalendarsByName(CalendarName)[0].createEvent('Sleep',
      new Date(startLongFormat),
      new Date(endLongFormat),
      {
        description: String(getTimeDifference(startLongFormat, endLongFormat))
      }
    );
    
    Logger.log('Event ID Created: ' + event.getId());
  } else {
    console.log("Event already exists");
  }
}

function checkSleepEvent() {
    // Get today's date
    var today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for start of the day

    // Get tomorrow's date
    var tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get events for today
    var calendarName = "YourCalendarName"; // Replace 'YourCalendarName' with the actual name of your calendar
    var events = CalendarApp.getCalendarsByName(CalendarName)[0].getEvents(today, tomorrow);

    // Check if any event has the title 'Sleep'
    for (var i = 0; i < events.length; i++) {
        if (events[i].getTitle() === 'Sleep') {
            return true; // 'Sleep' event found
        }
    }

    return false; // 'Sleep' event not found
}

function test() {
    console.log(CalendarApp.getCalendarsByName("Event")[0].getTimeZone());
}

function millisecondsToTime(milliseconds) {
    // Create a new Date object from milliseconds
    var date = new Date(milliseconds);

    // Extract hours and minutes
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // Format hours and minutes to have leading zeros if needed
    var formattedHours = hours < 10 ? '0' + hours : hours;
    var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Return the time in HH:MM format
    return formattedHours + ':' + formattedMinutes;
}

function getTimeDifference(startLongFormat, endLongFormat) {
  // Parse the date strings into Date objects
  const startDate = new Date(startLongFormat);
  const endDate = new Date(endLongFormat);

  // Calculate the difference in milliseconds
  const diffInMs = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to hours and minutes
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  // Format the output string with leading zeros for hours and minutes
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}h${formattedMinutes}`;
}

function DateToMilis(dateString) {//"DD/MM/YYYY" argument
  dateArgs = String(dateString).match(/\d{2,4}/g),
  year = dateArgs[2],
  month = parseInt(dateArgs[1]) - 1,
  day = dateArgs[0],
  hour = 23,
  minutes = 59;

  const miliseconds = new Date(year, month, day, hour, minutes).getTime();

  return miliseconds;
}
