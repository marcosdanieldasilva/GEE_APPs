// Items for the composite selection

// test V2.0
exports.compositeItems = [
  { label: "Choose by Date", value: "choose_by_date" },
  {
    label: "Create a Mosaic",
    value: {
      label: "Mosaic",
      value: function (collection) {
        return collection.mosaic();
      },
    },
  },
  { label: "Monthly Median", value: "Month" },
  { label: "Quarterly Median", value: "Quarter" },
  { label: "Semester Median", value: "Semester" },
  { label: "Yearly Median", value: "Year" },
  {
    label: "Composite Median",
    value: {
      label: "Median",
      value: function (collection) {
        return collection.median();
      },
    },
  },
  {
    label: "Composite Mean",
    value: {
      label: "Mean",
      value: function (collection) {
        return collection.mean();
      },
    },
  },
  {
    label: "Composite Min",
    value: {
      label: "Min",
      value: function (collection) {
        return collection.min();
      },
    },
  },
  {
    label: "Composite Max",
    value: {
      label: "Max",
      value: function (collection) {
        return collection.max();
      },
    },
  },
  {
    label: "Composite StdDev",
    value: {
      label: "StdDev",
      value: function (collection) {
        return collection.reduce(ee.Reducer.stdDev());
      },
    },
  },
];

// Function to validate date format 'dd/MM/YYYY'
exports.isValidDate = function (dateText) {
  var dateParts = dateText.split("/");
  var day = parseInt(dateParts[0], 10);
  var month = parseInt(dateParts[1], 10);
  var year = parseInt(dateParts[2], 10);
  var testDate = new Date(year, month - 1, day);
  return testDate.getDate() === day &&
    testDate.getMonth() === month - 1 &&
    testDate.getFullYear() === year
    ? ee.Date(testDate)
    : false;
};

// Function to evaluate and apply the date filter
exports.filterDateRange = function (collection, startDate, endDate) {
  var daysDif = startDate.difference(endDate, "days").getInfo();
  // Check if startDate is equal to endDate
  if (daysDif === 0 || daysDif > 0) {
    return collection.filterDate(startDate);
  } else {
    return collection.filterDate(startDate, endDate);
  }
};

// Function to create a list of scene select items from an image collection
exports.createSceneSelectItems = function (imageCollection) {
  return imageCollection
    .map(function (scene) {
      var dict = {
        value: scene.id(),
        label: scene.date().format("dd/MM/YYYY"),
      };
      return ee.Feature(null, dict);
    })
    .getInfo()
    .features.map(function (feature) {
      return feature.properties;
    });
};

exports.extractDateRange = function (image, option) {
  var date = ee.Date(image.get("system:time_start"));
  var month = date.get("month");
  var year = date.get("year");
  var start, end;

  if (option === "Month") {
    var monthYear = date.format("MMM_YYYY");
    start = ee.Date.fromYMD(year, month, 1);
    end = start.advance(1, "month").advance(-1, "day");

    return ee.Feature(null, {
      label: monthYear,
      value: {
        label: monthYear,
        value: { option: monthYear, start: start, end: end },
      },
    });
  } else if (option === "Quarter") {
    var quarterYear;

    var q1 = ee.Number(1).lte(month).and(month.lte(3));
    var q2 = ee.Number(4).lte(month).and(month.lte(6));
    var q3 = ee.Number(7).lte(month).and(month.lte(9));
    var q4 = ee.Number(10).lte(month).and(month.lte(12));

    quarterYear = ee.String("Q1_").cat(year);
    start = ee.Date.fromYMD(year, 1, 1);
    end = ee.Date.fromYMD(year, 3, 31);

    quarterYear = ee.Algorithms.If(q2, ee.String("Q2_").cat(year), quarterYear);
    start = ee.Algorithms.If(q2, ee.Date.fromYMD(year, 4, 1), start);
    end = ee.Algorithms.If(q2, ee.Date.fromYMD(year, 6, 30), end);

    quarterYear = ee.Algorithms.If(q3, ee.String("Q3_").cat(year), quarterYear);
    start = ee.Algorithms.If(q3, ee.Date.fromYMD(year, 7, 1), start);
    end = ee.Algorithms.If(q3, ee.Date.fromYMD(year, 9, 30), end);

    quarterYear = ee.Algorithms.If(q4, ee.String("Q4_").cat(year), quarterYear);
    start = ee.Algorithms.If(q4, ee.Date.fromYMD(year, 10, 1), start);
    end = ee.Algorithms.If(q4, ee.Date.fromYMD(year, 12, 31), end);

    return ee.Feature(null, {
      label: quarterYear,
      value: {
        label: quarterYear,
        value: { option: quarterYear, start: start, end: end },
      },
    });
  } else if (option === "Semester") {
    var semesterYear;

    var s1 = ee.Number(1).lte(month).and(month.lte(6));
    var s2 = ee.Number(7).lte(month).and(month.lte(12));

    semesterYear = ee.String("S1_").cat(year);
    start = ee.Date.fromYMD(year, 1, 1);
    end = ee.Date.fromYMD(year, 6, 30);

    semesterYear = ee.Algorithms.If(
      s2,
      ee.String("S2_").cat(year),
      semesterYear
    );
    start = ee.Algorithms.If(s2, ee.Date.fromYMD(year, 7, 1), start);
    end = ee.Algorithms.If(s2, ee.Date.fromYMD(year, 12, 31), end);

    return ee.Feature(null, {
      label: semesterYear,
      value: {
        label: semesterYear,
        value: { option: semesterYear, start: start, end: end },
      },
    });
  } else if (option === "Year") {
    var yearLabel = ee.String("").cat(year);
    start = ee.Date.fromYMD(year, 1, 1);
    end = ee.Date.fromYMD(year, 12, 31);

    return ee.Feature(null, {
      label: yearLabel,
      value: {
        label: yearLabel,
        value: { option: yearLabel, start: start, end: end },
      },
    });
  }
};

// Get today's date
var today = ee.Date(Date.now());
// Get the date one year ago
var oneYearAgo = today.advance(-1, "year");
// Format the dates to 'dd/MM/YYYY'
var currentDate = today.format("dd/MM/YYYY").getInfo();
var initialDate = oneYearAgo.format("dd/MM/YYYY").getInfo();

exports.createDataFilters = function () {
  // Create Labels for the dates
  var startDateLabel = ui.Label({
    value: "Start Date",
    style: {
      stretch: "horizontal",
      textAlign: "center",
      fontSize: "11px",
      margin: "10px 0px 2px 0px",
    },
  });

  var endDateLabel = ui.Label({
    value: "End Date",
    style: {
      stretch: "horizontal",
      textAlign: "center",
      fontSize: "11px",
      margin: "10px 0px 2px 0px",
    },
  });

  // Create Textboxes for the dates
  var initialDateTextbox = ui.Textbox({
    placeholder: "dd/MM/YYYY",
    value: initialDate,
    style: {
      stretch: "horizontal",
      margin: "3px 0px 0px 0px",
    },
  });

  var currentDateTextbox = ui.Textbox({
    placeholder: "dd/MM/YYYY",
    value: currentDate,
    style: {
      stretch: "horizontal",
      margin: "3px 0px 0px 0px",
    },
  });

  // Create vertical panels for each date label and textbox
  var startDatePanel = ui.Panel({
    widgets: [startDateLabel, initialDateTextbox],
    layout: ui.Panel.Layout.flow("vertical"),
    style: { stretch: "horizontal", margin: "0px 0px 0px 5px" },
  });

  var endDatePanel = ui.Panel({
    widgets: [endDateLabel, currentDateTextbox],
    layout: ui.Panel.Layout.flow("vertical"),
    style: { stretch: "horizontal", margin: "0px 0px 0px 5px" },
  });

  // Create a horizontal panel for the date filters
  return ui.Panel({
    widgets: [startDatePanel, endDatePanel],
    layout: ui.Panel.Layout.flow("horizontal"),
    style: { stretch: "horizontal", margin: "0" },
  });
};
