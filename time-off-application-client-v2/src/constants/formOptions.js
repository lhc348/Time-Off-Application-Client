const formOptions = {
  task: {
    status: {
      scheduled: "Scheduled",
      nonScheduled: "Non-Scheduled"
    },
    onsite: {
      [true]: "Yes",
      [false]: "No"
    }
  },
  timeOff: {
    session: {
      am: "AM",
      pm: "PM",
      fullDay: "Full Day"
    }
  }
};

export default formOptions;