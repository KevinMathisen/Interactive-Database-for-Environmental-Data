import { amountOfFishInObservations, secondsSpentFishingInStations } from './calculateData.js'
import { getObservationsForRiver, getStationsForRiver } from './dataManager.js'
import { addFeedbackToStore } from './addFeedbackToStore.js'
import { FEEDBACK_TYPES, FEEDBACK_CODES, FEEDBACK_MESSAGES } from '../constants/feedbackMessages.js'

/**
 * Creates data which can be used in a plotly bar or pie chart
 * Takes in either a map of rivers or stations to calculate the data for
 * @param {Map<number, object>} observationPoints - Map of either river or station objects
 * @param {string} dataType - Either 'river' or 'station'
 * @param {string[]} species - An array of species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} absoluteValues - Whether to display the data as absolute values or in relation to time spent fishing
 * @returns {Map<string, Map<string, number>>} - Map of rivers or stations with count of each species
 */
export function dataForBarAndPieChart (observationPoints, dataType, species, includeOthers, absoluteValues = true) {
  try {
    // Return the species count for rivers or stations based on datatType
    if (dataType === 'river') {
      return createDataForBarAndPieChart(
        observationPoints,
        species,
        includeOthers,
        absoluteValues,
        river => getObservationsForRiver(river), // Use imported function to get observations from rivers
        river => `${river.name} ${river.startDate}`,
        river => secondsSpentFishingInStations(getStationsForRiver(river)) // Use imported function to get time spent fishing from stations
      )
    } else {
      return createDataForBarAndPieChart(
        observationPoints,
        species,
        includeOthers,
        absoluteValues,
        station => station.observations, // Simply get observations directly from stations
        station => `${station.name} ${station.date}`,
        station => station.secFished // Simply get time spent fishing directly from stations
      )
    }
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.ERROR_PLOTTING_DATA)
    return new Map()
  }
}

/**
 * Counts amount of each species under each observation point (river or station)
 * Optionally the count can be relative to time spent fishing
 * @param {Map<number, ObservationPoint>} observationPoints - Map of observationPoints (rivers or stations)
 * @param {string[]} allSpecies - An array of species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} absoluteValues - Whether to display the data as absolute values or in relation to time spent fishing
 * @param {Function} getObservations - Function to get observations from an observationPoint
 * @param {Function} getDisplayName - Function to get display name from an observationPoint
 * @param {Function} getTimespentFishing - Function to get time spent fishing from an observationPoint
 * @returns {Map<string, Map<string, number>>} - Map of observationPoints with count of each species
 */
function createDataForBarAndPieChart (observationPoints, allSpecies, includeOthers, absoluteValues, getObservations, getDisplayName, getTimespentFishing) {
  const speciesCountForPoints = new Map()

  // For each observationPoint, get the data for it and save it
  Array.from(observationPoints.values()).forEach(observationPoint => {
    // Get the observations from the observationPoint
    const observations = getObservations(observationPoint)

    // Filter out observations which have no length
    const observationsWithLength = observations.filter(
      observation => observation.length && observation.length > 0)

    // Get the species count for the observations
    const speciesCount = getObservationSpeciesCount(observationsWithLength, allSpecies, includeOthers)

    // If the data should be relative to time spent fishing, divide the count by the time spent fishing
    if (!absoluteValues) {
      // Get the time spent fishing for the observationPoint
      const secSpentFishing = getTimespentFishing(observationPoint)

      // Calculate the count of each species per minute and update the species count
      speciesCount.forEach((count, species) => {
        speciesCount.set(species, Number((count / secSpentFishing * 60).toFixed(2)))
      })
    }

    // Save the species count for the observationPoint
    speciesCountForPoints.set(getDisplayName(observationPoint), speciesCount)
  })

  return speciesCountForPoints
}

/**
 * Get the count of each species in the observations
 * @param {object[]} observations - An array of observations
 * @param {string[]} allSpecies - An array of all species to include in the data
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @returns {Map<string, number>} - Map of each species with their count
 */
function getObservationSpeciesCount (observations, allSpecies, includeOthers) {
  const speciesCount = new Map()

  // Find and save the amount of fish for each species
  allSpecies.forEach(species => {
    const speciesObservations = observations.filter(observation => observation.species === species)
    const count = amountOfFishInObservations(speciesObservations)

    speciesCount.set(species, count)
  })

  // If 'others' should be included, find and save the amount of fish for all other species
  if (includeOthers) {
    const otherSpecies = observations.filter(observation => !allSpecies.includes(observation.species))
    const count = amountOfFishInObservations(otherSpecies)

    speciesCount.set('others', count)
  }

  // Return the map with the species and their count
  return speciesCount
}

/**
 * Creates data which can be used in a plotly histogram or box plot
 * Takes in either a map of rivers or stations to calculate the data for
 * @param {string} plotType - Either 'histogram' or 'boxplot'
 * @param {Map<number, ObservationPoint>} observationPoints - Map of either river or station objects
 * @param {string} dataType - Either 'river' or 'station'
 * @param {string[]} species - An array of species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in a river or station
 * @returns {Map<string, Map<string, number>>} - Map of rivers or stations with count of each species
 */
export function dataForHistogramAndBoxplot (plotType, observationPoints, dataType, species, interval = 1, includeOthers = false, combineSpecies = false) {
  try {
    if (dataType === 'river') {
      return createDataForHistogramAndBoxplot(
        plotType,
        observationPoints,
        species,
        interval,
        includeOthers,
        combineSpecies,
        river => getObservationsForRiver(river), // Use imported function to get observations from rivers
        river => `${river.name} ${river.startDate}`
      )
    } else {
      return createDataForHistogramAndBoxplot(
        plotType,
        observationPoints,
        species,
        interval,
        includeOthers,
        combineSpecies,
        station => station.observations, // Simply get observations directly from stations
        station => `${station.name} ${station.date}`
      )
    }
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.ERROR_PLOTTING_DATA)
    return new Map()
  }
}

/**
 * Creates data for either boxplot or histogram for each observationPoint given (river or station)
 * @param {string} plotType - Either 'histogram' or 'boxplot'
 * @param {Map<number, ObservationPoint>} observationPoints - Map of observationPoints (river or station)
 * @param {string[]} allSpecies - An array of species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in an observationPoint
 * @param {Function} getObservations - Function to get observations from an observationPoint
 * @param {Function} getDisplayName - Function to get display name from an observationPoint
 * @returns {
 * Map<string, { count: number[], intervals: number[], interval: number }>
 * } - Map of observationPoints with count of each species in intervals
 */
function createDataForHistogramAndBoxplot (plotType, observationPoints, allSpecies, interval, includeOthers, combineSpecies, getObservations, getDisplayName) {
  const allSpeciesIntervals = new Map()

  // For each observationPoint, create and save data for that point to plot
  Array.from(observationPoints.values()).forEach(observationPoint => {
    // Get the observations from the observationPoint
    const observations = getObservations(observationPoint)

    // Filter out observations which have no length
    const observationsWithLength = observations.filter(
      observation => observation.length && observation.length > 0)

    // Get the data to plot for an observationPoint grouped by species
    const speciesIntervals = createSpeciesDataForHistogramAndBoxplot(plotType, observationsWithLength, allSpecies, interval, includeOthers, combineSpecies)

    // Add the observationPoint data to the total
    speciesIntervals.forEach((value, key) => {
      allSpeciesIntervals.set(`${getDisplayName(observationPoint)} - ${key}`, value)
    })
  })

  return allSpeciesIntervals
}

/**
 * Get the data needed for histogram or boxplot for each species in the observations
 * @param {string} plotType - Either 'histogram' or 'boxplot'
 * @param {object[]} observations - An array of observations
 * @param {string[]} allSpecies - An array of all species to include in the data
 * @param {number} interval - The interval in cm to group the data by
 * @param {boolean} includeOthers - Whether to include the 'others' category in the data
 * @param {boolean} combineSpecies - Whether to combine the data for all species in a river or station
 * @returns {
 * Map<string, { count: number[], intervals: number[], interval: number }>
 * } - Map of each species with their count in intervals
 */
function createSpeciesDataForHistogramAndBoxplot (plotType, observations, allSpecies, interval, includeOthers, combineSpecies) {
  const speciesIntervals = new Map()

  // If species should be combined, find the data for all selected species and return this
  if (combineSpecies) {
    // Get the observations for all species selected
    const combinedObservations = observations.filter(observation => allSpecies.includes(observation.species))

    // Get the data for the combined species based on the plot type
    const plotData = plotType === 'histogram'
      ? getIntervalsForObservations(combinedObservations, interval)
      : getLengthsForObservations(combinedObservations)

    speciesIntervals.set('sum', plotData)
    return speciesIntervals
  }

  // Find the data for each species
  allSpecies.forEach(species => {
    // Get the observations for each species
    const speciesObservations = observations.filter(observation => observation.species === species)

    // Get the data for the species based on the plot type
    const plotData = plotType === 'histogram'
      ? getIntervalsForObservations(speciesObservations, interval)
      : getLengthsForObservations(speciesObservations)

    speciesIntervals.set(species, plotData)
  })

  // If 'others' should be included, find the data for all other species
  if (includeOthers) {
    // Get the observations for all species not selected
    const otherSpecies = observations.filter(observation => !allSpecies.includes(observation.species))

    // Get the data for the other species based on the plot type
    const plotData = plotType === 'histogram'
      ? getIntervalsForObservations(otherSpecies, interval)
      : getLengthsForObservations(otherSpecies)

    speciesIntervals.set('others', plotData)
  }

  return speciesIntervals
}

/**
 * Counts the observations in intervals, and returns the count with the intervals
 * @param {Observation[]} observations - The observations to group by interval
 * @param {number} intervalSize - The interval in cm to group the data by
 * @returns {{
 * count: number[], intervals: number[], interval: number
 * }} - The count of observations in each interval
 */
function getIntervalsForObservations (observations, intervalSize) {
  // If there are no observations, return empty data
  if (observations.length === 0) {
    return { count: [], intervals: [], interval: intervalSize }
  }

  // Find the minimum and maximum length of the observations, rounded down to the nearest interval
  const lengths = observations.map(observation => observation.length)
  const min = Math.floor(Math.min(...lengths) / intervalSize) * intervalSize
  const max = Math.floor(Math.max(...lengths) / intervalSize) * intervalSize

  // Create the intervals
  const intervals = []
  for (let i = min; i <= max; i += intervalSize) {
    intervals.push(i)
  }

  // Count the observations in each interval
  const count = intervals.map(interval => {
    const intervalObservations = observations.filter(observation => observation.length >= interval && observation.length < interval + intervalSize)
    return amountOfFishInObservations(intervalObservations)
  })

  // Shift each interval to the middle of the interval for placing the bars in a histogram
  intervals.forEach((_, index) => {
    intervals[index] = intervals[index] + intervalSize / 2
  })

  return { count, intervals, interval: intervalSize }
}

/**
 * Creates an array with the length of each observation times its count
 * @param {Observation[]} observations - The observations to get lengths from
 * @returns {number[]} - The lengths of the observations
 */
function getLengthsForObservations (observations) {
  // Add each observation length to array the amount of times the observation was observed/counted
  const lengths = observations.reduce((acc, observation) => {
    for (let i = 0; i < observation.count; i++) {
      acc.push(observation.length)
    }
    return acc
  }, [])

  return { lengths }
}
