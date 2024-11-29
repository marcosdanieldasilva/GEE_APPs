exports.createROIFilterPanel = function(map) {
  // Initialize variables
  var panel = ui.Panel({
    layout: ui.Panel.Layout.flow('vertical'),
    style: {stretch: 'both', padding: '8px', border: '1px solid blue'}
  });
  
  var filteredROI;
  var appliedFilters = [];
  var excludedColumns = [];
  var filtersText;
  
  // Function to get the columns of a FeatureCollection
  var getColumns = function(fc, excludedColumns) {
    var firstFeature = ee.Feature(fc.first());
    var columns = firstFeature.propertyNames().getInfo();
    return columns.filter(function(name) {
      return excludedColumns.indexOf(name) === -1;
    }).sort();
  };

  // Function to get a sample value from a column and determine its type
  var getSampleType = function(fc, column) {
    var sampleValue = fc.limit(1).first().get(column);
    return sampleValue.getInfo();
  };

  function updateFiltersLabel() {
    filtersText = appliedFilters.length > 0 ? appliedFilters.map(function(filter) {
      return filter.column + '=' + filter.value;
    }).join(', ') : 'None';
    filtersLabel.setValue('Applied filters: ' + filtersText);
  }

  var columnSelect = ui.Select({
    placeholder: 'Select a column',
    disabled: true,
    style: {stretch: 'both', margin: '8px 0 0 5px'},
    onChange: function(column) {
      var items = filteredROI.aggregate_array(column).distinct().sort().map(function (number) {return ee.String(number)}).getInfo();
      valueSelect.setDisabled(false);
      valueSelect.items().reset(items);
    }
  });

  var valueSelect = ui.Select({
    placeholder: 'Select a value',
    disabled: true,
    style: {stretch: 'both', margin: '8px 0 0 5px'},
    onChange: function(value) {
      var selectedColumn = columnSelect.getValue();
      var sampleType = typeof getSampleType(filteredROI, selectedColumn);

      if (sampleType === 'number') {
        filteredROI = filteredROI.filter(ee.Filter.eq(selectedColumn, parseFloat(value)));
      } else {
        filteredROI = filteredROI.filter(ee.Filter.eq(selectedColumn, value));
      }

      appliedFilters.push({column: selectedColumn, value: value});
      updateFiltersLabel();
      map.centerObject(filteredROI);

      excludedColumns.push(selectedColumn);
      var updatedColumns = getColumns(filteredROI, excludedColumns);
      columnSelect.items().reset(updatedColumns);
      columnSelect.setPlaceholder('Another column');
      valueSelect.items().reset([]);
      valueSelect.setValue(null, false);
    }
  });

  var defilterButton = ui.Button({
    label: 'Defilter ROI',
    style: {stretch: 'both', color: 'red', margin: '8px 0 0 5px'},
    onClick: function() {
      var path = pathTextbox.getValue();
      filteredROI = ee.FeatureCollection(path);
      appliedFilters = [];
      excludedColumns = [];
      updateFiltersLabel();
      columnSelect.items().reset(getColumns(filteredROI, excludedColumns));
      columnSelect.setValue(null, false);
      columnSelect.setPlaceholder('Select a column');
    }
  });

  var roiButton = ui.Button({
    label: 'Load ROI',
    style: {stretch: 'both', margin: '8px 0 0 5px'},
    onClick: function() {
      var path = pathTextbox.getValue();
      filteredROI = ee.FeatureCollection(path);
      var columns = getColumns(filteredROI, excludedColumns);
      columnSelect.setDisabled(false);
      columnSelect.items().reset(columns);
      map.centerObject(filteredROI);
    }
  });

  // Add widgets to the main panel
  panel.add(ui.Label({value: 'Table ID Path:', style: {fontSize: '12px', margin: '0'}}));
  
  var pathTextbox = ui.Textbox({
    placeholder: 'Enter Table ID path',  
    value: 'projects/users/marcosdansil/BR_Municipios_2022',
    style: {stretch: 'both', margin: '5px 0 0 5px'}
  });
  
  panel.add(pathTextbox);
  
  var roiPanel = ui.Panel({
    widgets: [roiButton, defilterButton],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'both', margin: '0'}
  });
  
  panel.add(roiPanel);
  
  var filtersLabel = ui.Label({value: 'Applied filters: None', style: {fontSize: '12px', margin: '8px 0 0 0'}});

  panel.add(filtersLabel);
  
  var filterPanel = ui.Panel({
    widgets: [columnSelect, valueSelect],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {stretch: 'both', margin: '0'}
  });
  
  panel.add(filterPanel);

  return panel;
};

Map.add(exports.createROIFilterPanel());
