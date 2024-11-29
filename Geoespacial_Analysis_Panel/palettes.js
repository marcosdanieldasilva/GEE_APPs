var palettes = require('users/gena/packages:palettes');

// Define the palette structure
exports.myPalette = {
  default: {
    Vegetation: {
      7: ['#FFFFFF', '#CE7E45', '#DF923D', '#F1B555', '#FCD163', '#99B718', '#74A901', '#66A000', '#529400', '#3E8601', '#207401', '#056201', '#004C00', '#023B01', '#012E01', '#011D01', '#011301']
    },
    Deforestation: {
      7: ['#d73027', '#fc8d59', '#fee08b', '#ffffbf', '#d9ef8b', '#91cf60', '#1a9850']
    },
    Water: {
      7: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']
    },
    Burn: {
      7: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850', '#006837']
    },
    Soil: {
      7: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30']
    },
    Urban: {
      7: ['#f7f7f7', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525']
    },
    Snow: {
      7: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']
    },
    Kernel: {
      7: ['#fee5d9', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d']
    },
    'False Color': {
      7: ['00A600','63C600','E6E600','E9BD3A','ECB176','EFC2B3','F2F2F2']
    }
  },
  cmocean: palettes.cmocean,
  kovesi: palettes.kovesi,
  matplotlib: palettes.matplotlib,
  niccoli: palettes.niccoli
};

// Convert the palette structure to an array format suitable for ui.Select
exports.paletteGroups = Object.keys(exports.myPalette);

exports.createPaletteSelectors = function() {
  
  // Define a static gradient image
  var gradient = ee.Image.pixelLonLat().select('longitude').multiply(0.01); // Simplified gradient from 0 to 1

  var legendImage = ui.Thumbnail({
    image: null, 
    params: {bbox: '0, 0, 100, 100'},
    style: {stretch: 'horizontal', position: 'bottom-center', height: '16px', padding: '0', margin: '8px 40px 0 40px'}
  });
    
  var paletteTypeSelect = ui.Select({
    placeholder: 'Palette Type',
    items: null,
    disabled: true,
    style: {stretch: 'both', margin: '10px 0 0 5px'},
    onChange: function(type) {
      var selectedGroup = paletteGroupSelect.getValue();
      var myPalette = exports.myPalette[selectedGroup][type][7];
      legendImage.setImage(gradient.visualize({palette: myPalette}));
    }
  });
  
  var paletteGroupSelect = ui.Select({
    items: exports.paletteGroups,
    placeholder: 'Palette Group',
    style: {stretch: 'both', margin: '10px 0 0 5px'},
    onChange: function(group) {
      paletteTypeSelect.setValue(null, false);
      // Update the paletteTypes based on the selected group
      var paletteTypes = Object.keys(exports.myPalette[group]);
      paletteTypeSelect.setDisabled(false);
      paletteTypeSelect.items().reset(paletteTypes);
    }
  });
  
  var palettePanel = ui.Panel({
    widgets: [paletteGroupSelect, paletteTypeSelect],
    layout: ui.Panel.Layout.flow('horizontal')
  });
  
  return ui.Panel([palettePanel, legendImage], ui.Panel.Layout.flow('vertical'), {stretch: 'both'});
};
