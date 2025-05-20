import { PickupRequest, DisposalSite, WasteType } from '../types';

/**
 * Calculates the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * Estimates the driving time between two points based on distance
 * @param distanceKm Distance in kilometers
 * @param averageSpeedKmh Average speed in km/h
 * @returns Estimated driving time in minutes
 */
export function estimateDrivingTime(
  distanceKm: number,
  averageSpeedKmh: number = 30
): number {
  return (distanceKm / averageSpeedKmh) * 60;
}

/**
 * Finds the most suitable disposal site based on waste types and location
 * @param wasteTypes List of waste types to dispose
 * @param disposalSites Available disposal sites
 * @param currentLocation Current location (last pickup point)
 * @returns Most suitable disposal site
 */
export function findBestDisposalSite(
  wasteTypes: WasteType[],
  disposalSites: DisposalSite[],
  currentLocation: { lat: number; lng: number }
): DisposalSite | null {
  // Filter sites that accept all waste types
  const compatibleSites = disposalSites.filter((site) =>
    wasteTypes.every((type) => site.acceptedWasteTypes.includes(type))
  );

  if (compatibleSites.length === 0) {
    return null;
  }

  // Find the closest compatible site
  let closestSite = compatibleSites[0];
  let minDistance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    closestSite.location.lat,
    closestSite.location.lng
  );

  for (let i = 1; i < compatibleSites.length; i++) {
    const site = compatibleSites[i];
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      site.location.lat,
      site.location.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestSite = site;
    }
  }

  return closestSite;
}

/**
 * Checks if a disposal site is open at a specific time
 * @param site Disposal site to check
 * @param date Date and time to check
 * @returns Whether the site is open at the specified time
 */
export function isDisposalSiteOpen(site: DisposalSite, date: Date): boolean {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

  const dayHours = site.openingHours.find((day) => day.day === dayOfWeek);
  if (!dayHours || dayHours.hours.length === 0) {
    return false;
  }

  const currentHour = date.getHours();
  const currentMinutes = date.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinutes;

  // Check if the current time falls within any of the opening hours for the day
  return dayHours.hours.some((period) => {
    const [openHour, openMinute] = period.open.split(':').map(Number);
    const [closeHour, closeMinute] = period.close.split(':').map(Number);

    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes <= closeTimeMinutes;
  });
}

interface OptimizationResult {
  optimizedRoute: PickupRequest[];
  totalDistance: number;
  totalDuration: number;
  bestDisposalSite: DisposalSite | null;
}

/**
 * Optimizes a collection route for multiple pickup requests
 * @param requests List of pickup requests to optimize
 * @param startLocation Starting location (collector's location)
 * @param disposalSites Available disposal sites
 * @returns Optimized route information
 */
export function optimizeRoute(
  requests: PickupRequest[],
  startLocation: { lat: number; lng: number },
  disposalSites: DisposalSite[]
): OptimizationResult {
  if (requests.length === 0) {
    return {
      optimizedRoute: [],
      totalDistance: 0,
      totalDuration: 0,
      bestDisposalSite: null
    };
  }

  // This is a simplified nearest neighbor algorithm
  // For a real implementation, you would use a more sophisticated algorithm
  // or integrate with a routing API like Google Maps Directions API

  const unvisited = [...requests];
  const optimizedRoute: PickupRequest[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;
  let totalDuration = 0;

  // While there are unvisited locations
  while (unvisited.length > 0) {
    // Find the nearest unvisited location
    let nearestIndex = 0;
    let minDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      unvisited[0].location.lat,
      unvisited[0].location.lng
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        unvisited[i].location.lat,
        unvisited[i].location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Add the nearest location to the route
    const nextStop = unvisited[nearestIndex];
    optimizedRoute.push(nextStop);
    unvisited.splice(nearestIndex, 1);

    // Update the current location and add distance/duration
    totalDistance += minDistance;
    totalDuration += estimateDrivingTime(minDistance);
    currentLocation = nextStop.location;
  }

  // Calculate all waste types to be disposed
  const allWasteTypes = optimizedRoute.flatMap((request) => request.wasteType);
  const uniqueWasteTypes = [...new Set(allWasteTypes)] as WasteType[];

  // Find the best disposal site
  const lastLocation = optimizedRoute[optimizedRoute.length - 1].location;
  const bestDisposalSite = findBestDisposalSite(uniqueWasteTypes, disposalSites, lastLocation);

  // Add distance and duration to the disposal site
  if (bestDisposalSite) {
    const distanceToSite = calculateDistance(
      lastLocation.lat,
      lastLocation.lng,
      bestDisposalSite.location.lat,
      bestDisposalSite.location.lng
    );
    totalDistance += distanceToSite;
    totalDuration += estimateDrivingTime(distanceToSite);
  }

  return {
    optimizedRoute,
    totalDistance,
    totalDuration,
    bestDisposalSite
  };
}