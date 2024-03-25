import attributesToFilterOn from '../constants/attributesToFilterOn'
import { addFeedbackToStore } from './addFeedbackToStore.js'
import { FEEDBACK_TYPES, FEEDBACK_CODES, FEEDBACK_MESSAGES } from '../constants/feedbackMessages'

/**
 * Filters a map of objects based on if a value given exists as a substring for given attributes
 * @param {Map<number, object>} objects - The map of objects to filter
 * @param {string[]} attributes - The attributes to filter on
 * @param {string} value - The value which should exist in the attribute value
 * @returns {Map<number, object>} - A filtered map of objects
 */
function filterDataBasedOnAttributeSubstring (objects, attributes, value) {
  // Checks for each object if the value is a subtext of the attributes, ignoring case
  return new Map([...objects].filter(([_, object]) =>
    attributes.some(attribute =>
      object[attribute] &&
      object[attribute].toLowerCase().includes(value.toLowerCase())
    )
  ))
}

/**
 * Filters a map of objects based on if a value given exists as a substring for two given attributes
 * @param {Map<number, object>} objects - The map of objects to filter
 * @param {string[]} attributes - The two attributes to filter on
 * @param {string} value - The value which should exist in the combined attributes value
 * @returns {Map<number, object>} - A filtered map of objects
 */
function filterDataBasedOnAttributeCombinationSubstring (objects, attributes, value) {
  // Checks for each object if the value is a subtext of the attributes, ignoring case
  return new Map([...objects].filter(([_, object]) =>
    (object[attributes[0]].toLowerCase() + ' ' + object[attributes[1]].toLowerCase()).includes(value.toLowerCase())
  )
  )
}

/**
 * Filters a map of objects based on if a given attribute is in a list of values
 * If no value is given it returns all objects
 * @param {object[]} objects - The array of objects to filter
 * @param {string} attribute - The attribute to filter on
 * @param {string[]} values - The list of values which should be equal to the attribute value
 * @returns {object[]} - A filtered array of objects
 */
function filterDataBasedOnAttributeInList (objects, attribute, values) {
  // Return all objects if no values are given
  if (values.length === 0) return objects

  // return the objects which have an attribute that is in the values list
  return objects.filter(object => values.includes(object[attribute]))
}

/**
 * Checks if a date is between a start and end date
 * @param {string} date - The date to check
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @returns {boolean} - True if the date is between the start and end date
 */
function checkIfDateIsBetween (date, startDate, endDate) {
  const dateObj = new Date(date)

  return dateObj >= startDate && dateObj <= endDate
}

/**
 * Filters rivers based on if they are between or have overlap with the start and end date
 * @param {Map<number, object>} rivers - The map of rivers to filter
 * @param {string} startDate - The start date
 * @param {string} endDate - The end date
 * @returns {Map<number, object>} - A filtered map of rivers
 */
function filterRiversBasedOnDates (rivers, startDate, endDate) {
  // Return all rivers if no start and no end date is given
  if (!startDate && !endDate) return rivers

  // If only one date is set, set the other to the earliest or latest possible date
  if (!startDate) startDate = '1970-01-01'
  else if (!endDate) endDate = '2100-01-01'

  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  // For each river, check if its dates overlap with the start and end date
  return new Map([...rivers].filter(([_, river]) =>
    checkIfDateIsBetween(river[attributesToFilterOn.RIVER_START_DATE], startDateObj, endDateObj) ||
    checkIfDateIsBetween(river[attributesToFilterOn.RIVER_END_DATE], startDateObj, endDateObj)
  ))
}

/**
 * Filters stations based on if they are between the start and end date
 * @param {Map<number, object>} stations - The map of stations to filter
 * @param {string} startDate - The start date
 * @param {string} endDate - The end date
 * @returns {Map<number, object>} - A filtered map of stations
 */
function filterStationsBasedOnDate (stations, startDate, endDate) {
  // Return all stations if no start and no end date is given
  if (!startDate && !endDate) return stations

  // If only one date is set, set the other to the earliest or latest possible date
  if (!startDate) startDate = '1970-01-01'
  else if (!endDate) endDate = '2100-01-01'

  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)

  // For each station, check if the date is between the start and end date
  return new Map([...stations].filter(([_, station]) =>
    checkIfDateIsBetween(station[attributesToFilterOn.STATION_DATE], startDateObj, endDateObj)
  ))
}

/**
 * Returns objects which have a species that is in the speciesToFilterOn
 * @param {Map<number, object>} objects - The map of objects to filter
 * @param {string[]} speciesToFilterOn - The species to filter on
 * @returns {Map<number, object>} - A filtered map of objects
 */
function filterObjectsBasedOnSpecies (objects, speciesToFilterOn) {
  // If no species are given, don't filter on species
  if (speciesToFilterOn.length === 0) return objects

  // Use set instead of array for faster lookups
  const speciesToFilterOnSet = new Set(speciesToFilterOn)

  // Return objects which have a species that is in the speciesToFilterOn
  return new Map([...objects].filter(([_, object]) =>
    object[attributesToFilterOn.SPECIES] &&
    object[attributesToFilterOn.SPECIES].some(objectSpecies => speciesToFilterOnSet.has(objectSpecies))
  ))
}

/**
 * Filters rivers based on a searchQuery
 * @param {Map<number, object>} rivers - The map of rivers to filter, keyed by a unique identifier
 * @param {string} searchQuery - The search query
 * @returns {Map<number, object>} - A filtered map of rivers
 */
export function filterRiversBySearch (rivers, searchQuery) {
  try {
    // Filters rivers based on if the searchQuery is a substring of their name or projectId
    return filterDataBasedOnAttributeSubstring(rivers, attributesToFilterOn.RIVER_SEARCH, searchQuery)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Filters stations based on a searchQuery
 * @param {Map<number, object>} stations - The map of stations to filter, keyed by a unique identifier
 * @param {string} searchQuery - The search query
 * @returns {Map<number, object>} - A filtered map of stations
 */
export function filterStationsBySearch (stations, searchQuery) {
  try {
    // Filters stations based on if the searchQuery is a substring of their name or projectId
    return filterDataBasedOnAttributeSubstring(stations, attributesToFilterOn.STATION_SEARCH, searchQuery)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Filters rivers based on their species and date
 * @param {Map<number, object>} rivers - The map of rivers to filter, keyed by a unique identifier
 * @param {string[]} species - The species to filter on
 * @param {string} startDate - The start of the date interval to filter on
 * @param {string} endDate - The end of the date interval to filter on
 * @returns {Map<number, object>} - A filtered map of rivers
 */
export function filterRiversByDateAndSpecies (rivers, species, startDate, endDate) {
  try {
    // Filter rivers based on if they are between or have overlap with the start and end date
    const filteredDateRivers = filterRiversBasedOnDates(rivers, startDate, endDate)

    // Filter rivers based on if they have a species that is in the species list
    const filteredSpeciesAndDateRivers = filterObjectsBasedOnSpecies(filteredDateRivers, species)

    return filteredSpeciesAndDateRivers
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Filters stations based on their species and date
 * @param {Map<number, object>} stations - The map of stations to filter, keyed by a unique identifier
 * @param {string[]} species - The species to filter on
 * @param {string} startDate - The start of the date interval to filter on
 * @param {string} endDate - The end of the date interval to filter on
 * @returns {Map<number, object>} - A filtered map of stations
 */
export function filterStationsByDateAndSpecies (stations, species, startDate, endDate) {
  try {
    // Filter stations based on if they are between the start and end date
    const filteredDateStations = filterStationsBasedOnDate(stations, startDate, endDate)

    // Filter stations based on if they have a species that is in the species list
    const filteredSpeciesAndDateStations = filterObjectsBasedOnSpecies(filteredDateStations, species)

    return filteredSpeciesAndDateStations
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Filters observations based on their species
 * @param {Array<object>} observations - The list of observations to filter
 * @param {Array<string>} species - The species to filter on
 * @returns {Array<object>} - A filtered list of observations
 */
export function filterObservationsBySpecies (observations, species) {
  try {
    // Filter observations based on if they have a species that is in the species list
    return filterDataBasedOnAttributeInList(observations, attributesToFilterOn.SPECIES, species)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return []
  }
}

/**
 * Finds all unqiue species from a list of rivers or stations
 * @param {Map<number, ObservationPoint>} observationPoints - The list of rivers or stations to find species from
 * @returns {string[]} - A list of unique species
 */
export function getSelectableSpecies (observationPoints) {
  try {
    // Use set instead of array for faster lookups
    const speciesSet = new Set()

    observationPoints.forEach(observationPoint => {
      observationPoint[attributesToFilterOn.SPECIES].forEach(species => speciesSet.add(species))
    })

    return Array.from(speciesSet)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return []
  }
}

/**
 * Filters rivers based on if the searchQuery is a substring of their name and date combined
 * @param {Map<number, object>} rivers - The map of rivers to filter
 * @param {string} searchQuery - The search query
 * @returns {Map<number, object>} - A filtered map of rivers
 */
export function filterRiversByNameAndDateCombined (rivers, searchQuery) {
  try {
    // Filters rivers based on if the searchQuery is a substring of their name and date combined
    return filterDataBasedOnAttributeCombinationSubstring(rivers, [attributesToFilterOn.RIVER_NAME, attributesToFilterOn.RIVER_START_DATE], searchQuery)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Filters stations based on if the searchQuery is a substring of their name and date combined
 * @param {Map<number, object>} stations - The map of stations to filter
 * @param {string} searchQuery - The search query
 * @returns {Map<number, object>} - A filtered map of stations
 */
export function filterStationsByNameAndDateCombined (stations, searchQuery) {
  try {
    // Filters stations based on if the searchQuery is a substring of their name and date combined
    return filterDataBasedOnAttributeCombinationSubstring(stations, [attributesToFilterOn.STATION_NAME, attributesToFilterOn.STATION_DATE], searchQuery)
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}

/**
 * Creates a map with all the stations under a river
 * @param {object} river - The river object, which has the ID of the stations
 * @param {Map} stations - The Map of all stations, where the key is the station ID and the value is the station object
 * @returns {Map<number, Station>} - A Map of stations under the river river.
 * If an error occurs, adds a generic error message and returns an empty map
 * @throws Display generic error to user if an error occurs
 */
export function filtersStationsByRiver (river, stations) {
  try {
    // For each stationId in the river, get the station from the station store and add it to the map to return
    return new Map(river.stations.map(stationId => [stationId, stations.get(stationId)]))
  } catch (error) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
    return new Map()
  }
}
