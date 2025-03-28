import proj4 from "proj4";

export const utmToLatLng = (easting, northing) => {
  const UTM_ZONE = 23; 
  const proj_utm = `+proj=utm +zone=${UTM_ZONE} +south +datum=WGS84 +units=m +no_defs`;
  const proj_wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

  return proj4(proj_utm, proj_wgs84, [easting, northing]).reverse();
};
