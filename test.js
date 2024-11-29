// firsts tests

var palettes = require('users/marcosdansil/open_apps:Geoespatial_Analysis_Panel/palettes.js');

var dataFunctions = require('users/marcosdansil/open_apps:Geoespatial_Analysis_Panel/data_functions.js');

var satelliteFunctions = require('users/marcosdansil/open_apps:Geoespatial_Analysis_Panel/satellite_functions.js');

var ROIPanel = require('users/marcosdansil/open_apps:Geoespatial_Analysis_Panel/roi_filter_panel.js');

function createFilterPanel(label, map) {
  var panel = ui.Panel({
    layout: ui.Panel.Layout.flow('vertical'),
    style: {stretch: 'both', padding: '8px', border: '1px solid blue'}
  });
  
  var panelName = ui.Label({
      value: label + ' Map',
      style: {
        fontWeight: 'bold',
        fontFamily: 'antonio',
        fontSize: '16px',
        margin: '0 0 3px 0px'
      }
  });
  
  panel.add(panelName);
  
  return panel;
}


// var generateButton = ui.Button({
//   label: 'Open Chart Panel >>',
//   style: {stretch: 'both', margin: '10px 10px 0px 10px'},
//   onClick: function() {
    
//     var leftPaletteGroupSelect = leftMap.widgets().get(0).widgets().get(0).widgets().get(0);
//     var leftPaletteTypeSelect = leftMap.widgets().get(0).widgets().get(0).widgets().get(1);
    
//     var rightPaletteGroupSelect = rightMap.widgets().get(0).widgets().get(0).widgets().get(0);
//     var rightPaletteTypeSelect = rightMap.widgets().get(0).widgets().get(0).widgets().get(1);

//   }
// });

// Create the main panel.
var mainPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {
    stretch: 'both',
    height: '100%',
    backgroundColor: 'white'
  }
});

var leftMap = ui.Map();

var rightMap = ui.Map();

var leftPanel = createFilterPanel('Left', leftMap);

leftPanel.widgets().get(0).setValue('');

var rightPanel = createFilterPanel('Right', rightMap);

rightPanel.style().set('shown', false);

leftPanel.add(dataFunctions.createDataFilters());

leftPanel.add(palettes.createPaletteSelectors());

rightPanel.add(dataFunctions.createDataFilters());

rightPanel.add(palettes.createPaletteSelectors());

mainPanel.add(leftPanel);

mainPanel.add(rightPanel);

var controlPanel = ui.Panel({
  style: {stretch: 'both', width: '22%', border: '1px solid blue'}
});

var linker = ui.Map.Linker([leftMap, rightMap]);

var mapsSplitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true,
  style: {width: '56%'}
});

var header = ui.Panel({
  widgets: [
    ui.Panel({
      widgets: [
        ui.Label(
          'Geospatial Analysis Panel',
          {stretch: 'both', textAlign: 'center', fontFamily: 'antonio', fontSize: '13px', fontWeight: 'bold', color: '#ef7900', 
          margin: '3px 0px 2px 25px', backgroundColor: 'black'}
        ),
        ui.Label({
          value: 'Created by: Marcos Daniel da Silva',
          style: {stretch: 'both', textAlign: 'center', fontFamily: 'antonio', fontSize: '10px', margin: '3px 0px 2px 25px', backgroundColor: 'black'},
          targetUrl: 'https://www.linkedin.com/in/marcosdanieldasilva/?locale=en_US'
        })
      ],
      style: {stretch: 'both', backgroundColor: 'black', margin: '0px 15px 0px 0px'}, 
      layout: ui.Panel.Layout.flow('vertical')
    })
  ],
  style: {stretch: 'both', backgroundColor: 'black', border: '1px solid blue'}, 
  layout: ui.Panel.Layout.flow('horizontal')
});

var toggleCheckbox = ui.Checkbox({
  label: 'Split',
  value: false,
  style: {stretch: 'both', fontSize: '10px', margin: '5px 0px 5px 8px'},
  onChange: function(checked) {
    if (checked) {
      leftPanel.widgets().get(0).setValue('Left Map');
      rightPanel.style().set('shown', true);
      controlPanel.style().set('width', '44%');
      ui.root.widgets().reset([mapsSplitPanel, controlPanel]);
      wipeCheckbox.style().set('shown', true);
      linkCheckbox.style().set('shown', true);
    } else {
      leftPanel.widgets().get(0).setValue('');
      rightPanel.style().set('shown', false);
      leftMap.style().set('width', '78%');
      controlPanel.style().set('width', '22%');
      ui.root.widgets().reset([leftMap, controlPanel]);
      wipeCheckbox.style().set('shown', false);
      linkCheckbox.style().set('shown', false);
    }
  }
});

var wipeCheckbox = ui.Checkbox({
  label: 'Wipe',
  value: true,
  style: {stretch: 'both', shown: false, fontSize: '10px', margin: '5px 0px 5px 8px'},
  onChange: function(value) {
    if (value) {
      mapsSplitPanel.setWipe(true);
    } else {
      mapsSplitPanel.setWipe(false);
    }
  }
});

var linkCheckbox = ui.Checkbox({
  label: 'Link',
  value: true,
  style: {stretch: 'both', shown: false, fontSize: '10px', margin: '5px 0px 5px 8px'},
  onChange: function(value) {
    if (value) {
      linker = ui.Map.Linker([leftMap, rightMap]);
    } else {
      linker.reset([]); // Unlink maps by passing an empty array
    }
  }
});

var controlVisibilityCheckbox = ui.Checkbox({
  label: 'Control',
  value: false,
  style: {stretch: 'both', fontSize: '10px', margin: '5px 0px 5px 8px'},
  onChange: function(value) {
    leftMap.setControlVisibility({all: value});
    leftMap.drawingTools().getShown();
    rightMap.setControlVisibility({all: value});
    rightMap.drawingTools().getShown();
  }
});

leftMap.setControlVisibility({all: false});
rightMap.setControlVisibility({all: false});

controlVisibilityCheckbox.setValue(true);

// Add the checkboxes to the control panel
var checkboxPanel = ui.Panel({
  widgets: [ui.Label(
      'Map settings', 
      {stretch: 'both', fontSize: '10px',  textAlign: 'center', fontWeight: 'bold', margin: '6px 0px 5px 0px'}
    ), toggleCheckbox, wipeCheckbox, linkCheckbox, controlVisibilityCheckbox
  ],
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {stretch: 'both', border: '1px solid blue', margin: '0'}
  }
);

controlPanel.add(header);

controlPanel.add(checkboxPanel);

controlPanel.add(ROIPanel.createROIFilterPanel(leftMap));

controlPanel.add(mainPanel);

// Set the initial state
ui.root.widgets().reset([leftMap, controlPanel]);