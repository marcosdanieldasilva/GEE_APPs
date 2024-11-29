
exports.modis = modis;
// Merging Landsat ETM+ collections and renaming bands
exports.landsatETM = landsat4
  .merge(landsat5)
  .merge(landsat7)
  .map(function(image) {
    return image
      .select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7', 'QA_PIXEL', 'QA_RADSAT', 'ST_B6'], 
              ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'QA_PIXEL', 'QA_RADSAT', 'ST_B10'])
      .copyProperties(image, ['system:time_start', 'CLOUD_COVER']);
  });
  
exports.landsatOLI = landsat8.merge(landsat9);

exports.landsatCollection = exports.landsatETM.merge(exports.landsatOLI.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7', 'QA_PIXEL', 'QA_RADSAT', 'ST_B10']));

// Function to apply scaling factors to Landsat
exports.landsatScaling = function (image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0).subtract(273.15); // To Celsius
  return image
    .addBands(opticalBands, null, true)
    .addBands(thermalBands, null, true)
    .copyProperties(image, ['system:time_start', 'CLOUD_COVER']);
};

// Function to mask Landsat images
exports.maskLandsat = function (image) {
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);
  return image
    .updateMask(qaMask)
    .updateMask(saturationMask)
    .copyProperties(image, ['system:time_start', 'CLOUD_COVER']);
};

// S2: Harmonized Sentinel-2 Level 2A Collection
var QA_BAND = 'cs_cdf';
var CLEAR_THRESHOLD = 0.60;
exports.s2Collection = s2
  .linkCollection(csPlus, [QA_BAND])
  .select(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12', 'cs_cdf']);

exports.Sentinel2Scaling = function(image) {
  return image
    .multiply(0.0001)
    .copyProperties(image, ['system:time_start', 'CLOUDY_PIXEL_PERCENTAGE']);
};

// Function to mask Sentinel-2 images
exports.maskSentinel2 = function (image) {
  var mask = image.select(QA_BAND).gte(CLEAR_THRESHOLD);
  return image
    .updateMask(mask)
    .copyProperties(image, ['system:time_start', 'CLOUDY_PIXEL_PERCENTAGE']);
};

// Function to apply cloud mask for MODIS
exports.maskModis = function(image) {
  var qa = image.select('state_1km');
  var cloudMask = qa.bitwiseAnd(1 << 10).eq(0); // Masking clouds
  return image.updateMask(cloudMask).copyProperties(image, ['system:time_start']);
};

// Function to apply scaling factors to MODIS
exports.modisScaling = function(image) {
  var bands = image.select(['sur_refl_b01', 'sur_refl_b02', 'sur_refl_b03', 'sur_refl_b04', 'sur_refl_b05', 'sur_refl_b06', 'sur_refl_b07'])
                  .multiply(0.0001);
  return image.addBands(bands, null, true).copyProperties(image, ['system:time_start']);
};

exports.collections = {
  'Landsat-OLI': {collection: exports.landsatOLI, cloudTerm: 'CLOUD_COVER', scalingFunction: exports.landsatScaling, maskFunction: exports.maskLandsat},
  'Landsat-ETM+': {collection: exports.landsatETM, cloudTerm: 'CLOUD_COVER', scalingFunction: exports.landsatScaling, maskFunction: exports.maskLandsat},
  'Landsat-Collection': {collection: exports.landsatCollection, cloudTerm: 'CLOUD_COVER', scalingFunction: exports.landsatScaling, maskFunction: exports.maskLandsat},
  'Sentinel-2': {collection: exports.s2Collection, cloudTerm: 'CLOUDY_PIXEL_PERCENTAGE', scalingFunction: exports.Sentinel2Scaling, maskFunction: exports.maskSentinel2},
  'MODIS': {collection: exports.modis, scalingFunction: exports.modisScaling, maskFunction: exports.maskModis}
};