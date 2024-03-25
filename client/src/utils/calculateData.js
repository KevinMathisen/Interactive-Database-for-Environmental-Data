/**
 * Calculates the amount of fish in all observations given
 * @param {Observation[]} observations - The observations to calculate the amount of fish in
 * @returns {number} - The amount of fish in the observations
 */
export function amountOfFishInObservations (observations) {
  return observations.reduce((amountOfFish, observation) => amountOfFish + observation.count, 0)
}

/**
 * Calculates the amount of fish observed in a station
 * @param {Station} station - The station to calculate on
 * @returns {number} - The amount of fish the station observed
 */
export function amountOfFishInStation (station) {
  return amountOfFishInObservations(station.observations)
}

/**
 * Calculates the amount of fish observed in multiple stations
 * @param {Map<number, Station>} stations - The stations to calculate on
 * @returns {number} - The amount of fish observed in all stations
 */
export function amountOfFishInStations (stations) {
  return Array.from(stations.values()).reduce((amountOfFish, station) => amountOfFish + amountOfFishInStation(station), 0)
}

/**
 * Calculates the time spent fishing in multiple stations
 * @param {Map<number, Station>} stations - The stations to calculate on
 * @returns {number} - The time spent fishing in all the stations
 */
export function secondsSpentFishingInStations (stations) {
  return Array.from(stations.values()).reduce((secSpentFishing, station) => secSpentFishing + station.secFished, 0)
}

/**
 * Calculates the minutes and seconds which together represent the time spent fishing
 * @param {Map<number, Station>} stations - The stations to calculate the time spent fishing in
 * @returns {number} - The minutes and seconds spent fishing in all the stations
 */
export function secondsAndMinutesSpentFishingInStations (stations) {
  const secSpentFishing = secondsSpentFishingInStations(stations)
  return {
    seconds: secSpentFishing % 60,
    minutes: Math.floor(secSpentFishing / 60)
  }
}

/**
 * Calculates the amount of fish observed per minute in a station
 * @param {Station} station - The station to calculate based on
 * @returns {number} - The amount of fish observed per minute
 */
export function fishPerMinuteInStation (station) {
  return (amountOfFishInStation(station) / (station.secFished / 60)).toFixed(2)
}

/**
 * Calculates the amount of fish observed per minute in multiple stations
 * @param {Map<number, Station>} stations - The stations to calculate based on
 * @returns {number} - The amount of fish observed per minute
 */
export function fishPerMinuteInStations (stations) {
  const secSpentFishing = secondsSpentFishingInStations(stations)
  return (amountOfFishInStations(stations) / (secSpentFishing / 60)).toFixed(2)
}

/**
 * Calculates the average length of the fish observed in a station
 * @param {Observation[]} observations - The observations to calculate the average length of
 * @returns {number} - The average length of the fish observed
 */
function averageLengthObservation (observations) {
  const amountOfFish = amountOfFishInObservations(observations)
  return observations.reduce((totalLength, observation) => totalLength + observation.length * observation.count, 0) / amountOfFish
}

/**
 * Calculates the median length of the fish observed in a station
 * @param {Observation[]} observations - The observations to calculate the median length of
 * @returns {number} - The median length of the fish observed
 */
function medianLengthObservation (observations) {
  // Flatten observations to account for multiple observations of the same length
  observations = observations.reduce((acc, observation) => {
    for (let i = 0; i < observation.count; i++) {
      acc.push({ length: observation.length })
    }
    return acc
  }, [])

  // Sort the observations by length
  const sortedObservations = observations.sort((a, b) => a.length - b.length)

  // Find the middle index
  const middleIndex = Math.floor(sortedObservations.length / 2)

  // Return the median length, if the amount of observations is even, return the average of the two middle lengths
  return sortedObservations.length % 2 === 0
    ? (sortedObservations[middleIndex - 1].length + sortedObservations[middleIndex].length) / 2
    : sortedObservations[middleIndex].length
}

/**
 * Calculates the minimum length of the fish observed in a station
 * @param {Observation[]} observations - The observations to calculate the minimum length of
 * @returns {number} - The minimum length of the fish observed
 */
function minimumLengthObservation (observations) {
  return observations.reduce((min, observation) => observation.length < min ? observation.length : min, Infinity)
}

/**
 * Calculates the maximum length of the fish observed in a station
 * @param {Observation[]} observations - The observations to calculate the maximum length of
 * @returns {number} - The maximum length of the fish observed
 */
function maximumLengthObservation (observations) {
  return observations.reduce((max, observation) => observation.length > max ? observation.length : max, -Infinity)
}

/**
 * Calculates data for a species in a station
 * @param {Observation[]} observations - The observations of the species
 * @param {number} secSpentFishing - Time spent fishing in the station
 * @returns {object} data - An object containing data for the species
 */
function dataForSpeciesObservations (observations, secSpentFishing) {
  const amountOfFish = amountOfFishInObservations(observations)

  // Filter out observations without length
  const observationsWithLength = observations.filter(
    observation => observation.length && observation.length > 0)

  return {
    amount: amountOfFish,
    amountPerMinute: (amountOfFish / (secSpentFishing / 60)).toFixed(2),
    averageLength: averageLengthObservation(observationsWithLength).toFixed(2),
    medianLength: medianLengthObservation(observationsWithLength).toFixed(2),
    minimumLength: minimumLengthObservation(observationsWithLength),
    maximumLength: maximumLengthObservation(observationsWithLength)
  }
}

/**
 * Calculates data for all species in a station
 * @param {object} station - The station object
 * @returns {Array} data - An array of objects, each containing data for a species
 */
export function dataForAllSpeciesInStation (station) {
  const data = []
  const secSpentFishing = station.secFished
  const observations = station.observations

  // For each species in the station, calculate data for the species and add it to the data array
  station.species.forEach(species => {
    const speciesObservations = observations.filter(observation => observation.species.toLowerCase() === species)

    const speciesData = dataForSpeciesObservations(speciesObservations, secSpentFishing)
    data.push({ species, ...speciesData })
  })

  // If there are observations, calculate the data for the sum of all species in the station and add it to the data array
  if (observations.length > 0) {
    const sumData = dataForSpeciesObservations(observations, secSpentFishing)
    data.push({ species: 'sum', ...sumData })
  }

  return data
}

/**
 * Calculates data for each unique species in multiple stations
 * @param {Map<number, Station>} stations - The stations to calculate data for
 * @returns {Array} data - An array of objects, each containing data for an unique species
 */
export function dataForAllSpeciesInStations (stations) {
  const data = []

  // Calculate the time spent fishing in all the stations
  const secSpentFishing = secondsSpentFishingInStations(stations)

  // Get all observations from all stations
  const allObservations = []
  Array.from(stations.values()).forEach(station => allObservations.push(...station.observations))

  // Get all unique species from all stations
  const species = allUniqueSpeciesInObjects(stations)

  // For each unique species, calculate and add the data to the data array
  species.forEach(species => {
    const speciesObservations = allObservations.filter(observation => observation.species === species)
    const speciesData = dataForSpeciesObservations(speciesObservations, secSpentFishing)
    data.push({ species, ...speciesData })
  })

  // If there are observations, calculate the data for the sum of all species in the stations and add it to the data array
  if (allObservations.length > 0) {
    const sumData = dataForSpeciesObservations(allObservations, secSpentFishing)
    data.push({ species: 'sum', ...sumData })
  }

  return data
}

/**
 * Finds the unique species in an array of objects
 * @param {object[]} objects - An array of objects
 * @param {string[]} objects.species - An array of species in the object
 * @returns {string[]} - An array of unique species in the objects
 */
export function allUniqueSpeciesInObjects (objects) {
  const speciesSet = new Set()
  objects.forEach(object => {
    object.species.forEach(species => speciesSet.add(species))
  })
  return Array.from(speciesSet)
}
