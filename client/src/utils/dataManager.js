import { get } from 'svelte/store'
import {
  fetchRivers,
  fetchStations,
  fetchRiverSummary,
  fetchStationSummary,
  fetchStationDownload
} from '../api/postgrest.js'
import {
  doesAllRiversExistInStore,
  doesAllStationsExistInStore,
  checkIfRiverSummaryExists,
  checkIfStationSummaryExists,
  checkIfStationDownloadExists
} from './checkIfDataExists.js'
import { riverStore } from '../stores/riverStore.js'
import { stationStore } from '../stores/stationStore.js'
import { River } from '../models/River.js'
import { Station } from '../models/Station.js'
import { addFeedbackToStore } from './addFeedbackToStore.js'
import { FEEDBACK_TYPES, FEEDBACK_CODES, FEEDBACK_MESSAGES } from '../constants/feedbackMessages'
import { filtersStationsByRiver } from './filterData.js'

/**
 * Updates a store with given objects converted to a given class
 * Ensures that if there is any overlap between new and existing objects,
 * that the properties of the new object overwrite the old one, while the
 * old properties are kept
 * @param {import('svelte/store').Writable} store - The store to update
 * @param {Array<object>} objects - The objects to update the store with
 * @param {Function} Class - The class to convert the objects to
 * @returns {void}
 */
function updateStoreWithObjects (store, objects, Class) {
  // If the store is empty, simply set the store with the objects converted to the class
  if (get(store).size === 0) {
    const objectMap = new Map(objects.map(object => [object.id, Class.fromJson(object)]))
    store.set(objectMap)
    return
  }

  // If the store is not empty, update the store with the objects
  store.update(currentMap => {
    objects.forEach(newObject => {
      // If the object does not exist in the store, add it
      if (!currentMap.has(newObject.id)) {
        currentMap.set(newObject.id, Class.fromJson(newObject))
        return
      }

      // Get the existing object from the store
      const existingObject = currentMap.get(newObject.id)
      // Convert the new object from json to the class
      const newClassObject = Class.fromJson(newObject)
      // Remove any null values from the new object
      const newObjectFiltered = Object.fromEntries(Object.entries(newClassObject).filter(([_, value]) => value !== null))

      // Merge the new object with the existing object
      const updatedObject = new Class({
        ...existingObject,
        ...newObjectFiltered
      })

      // Update the map with the updated object
      currentMap.set(newObject.id, updatedObject)
    })

    return currentMap
  })
}

/**
 * Updates a store with a given object converted to a given class
 * Ensures that if there is any overlap between a new and existing object,
 * that the properties of the new object overwrite the old one, while the
 * old properties are kept
 * @param {import('svelte/store').Writable} store - The store to update
 * @param {object} object - The object to update the store with
 * @param {Function} Class - The class to convert the object to
 * @returns {void}
 */
function updateStoreWithObject (store, object, Class) {
  store.update(currentMap => {
    // If the object does not exist in the store, add it
    if (!currentMap.has(object.id)) {
      currentMap.set(object.id, Class.fromJson(object))
      return currentMap
    }

    // Get the existing object from the store
    const existingObject = currentMap.get(object.id)
    // Convert the new object from json to the class
    const newObject = Class.fromJson(object)
    // Remove any null values from the new object
    const newObjectFiltered = Object.fromEntries(Object.entries(newObject).filter(([_, value]) => value !== null))

    // Merge the new object with the existing object
    const updatedObject = new Class({
      ...existingObject,
      ...newObjectFiltered
    })

    // Update the map with the updated object
    currentMap.set(object.id, updatedObject)

    return currentMap
  })
}

/**
 * Ensures that all rivers are stored in the river store such that the
 * map and list page can display them
 * @returns {void}
 */
export async function getRivers () {
  // Check if rivers exists, if they do, return
  if (doesAllRiversExistInStore()) {
    return
  }

  try {
    // Get rivers
    const fetchedRivers = await fetchRivers()

    // Update store
    updateStoreWithObjects(riverStore, fetchedRivers, River)
  } catch (error) {
    console.log('Error fetching rivers:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Ensures that all stations are stored in the station store such that the
 * map and list page can display them
 * @returns {void}
 */
export async function getStations () {
  // Check if stations exists, if they do, return
  if (doesAllStationsExistInStore()) {
    return
  }

  try {
    // Get stations
    const fetchedStations = await fetchStations()

    // Update store
    updateStoreWithObjects(stationStore, fetchedStations, Station)
  } catch (error) {
    console.log('Error fetching stations:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Ensures that a river summary and its underlying stations are stored
 * in the river store such that the river summary page can display them
 * @param {number} id - The id of the river to get the summary for
 * @returns {void}
 */
export async function getRiverSummary (id) {
  // Check if river summary exists, if it does, return
  if (checkIfRiverSummaryExists(id)) {
    return
  }

  try {
    // Get river summary data
    const fetchedRiversSummary = await fetchRiverSummary(id)

    // Update store with river
    updateStoreWithObject(riverStore, fetchedRiversSummary[0], River)

    // Get data for stations under river
    const fetchedStations = await fetchStationSummary(fetchedRiversSummary[0].stations)

    // Update store with the stations
    updateStoreWithObjects(stationStore, fetchedStations, Station)
  } catch (error) {
    console.log('Error fetching river summary:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Ensures that a station summary is stored in the station store such that
 * the station summary page can display it
 * @param {number} id - The id of the station to get the summary for
 */
export async function getStationSummary (id) {
  // Check if station summary exists, if it does, return
  if (checkIfStationSummaryExists(id)) {
    return
  }

  try {
    // Get station summary
    const fetchedStationsSummary = await fetchStationSummary([id])

    // Update store
    updateStoreWithObject(stationStore, fetchedStationsSummary[0], Station)
  } catch (error) {
    console.log('Error fetching station summary:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Ensures that all stations under a river has their data stored in the store
 * for the river to be downloaded
 * @param {number} id - The id of the river to get the data for
 * @returns {void}
 */
export async function getRiverForDownload (id) {
  // Ensure that river summary is stored
  await getRiverSummary(id)

  const river = get(riverStore).get(id)

  // Get which stations does not have all of their data ready for download
  const stationsNotFetchedForDownload = river.stations.filter(stationId => !checkIfStationDownloadExists(stationId))

  // Exit the function of all stations are ready for download
  if (stationsNotFetchedForDownload.length === 0) {
    return
  }

  try {
    // Get all download data for all stations under river
    const fetchedStations = await fetchStationDownload(stationsNotFetchedForDownload)

    console.log(fetchedStations)

    // Update store with the new station data
    updateStoreWithObjects(stationStore, fetchedStations, Station)
  } catch (error) {
    console.log('Error fetching river for download:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Ensures that a station is stored in the station store such that
 * the station can be downloaded
 * @param {number} id - The id of the station to get the data for
 * @returns {void}
 */
export async function getStationForDownload (id) {
  // Ensure that station summary is stored
  await getStationSummary(id)

  const station = get(stationStore).get(id)

  // Ensure that river summary for station is stored
  await getRiverSummary(station.riverId)

  // Check if station download exists, if it does, return
  if (checkIfStationDownloadExists(id)) {
    return
  }

  try {
    // Get station
    const fetchedStations = await fetchStationDownload([id])

    // Update store
    updateStoreWithObject(stationStore, fetchedStations[0], Station)
  } catch (error) {
    console.log('Error fetching station for download:', error)
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.GENERIC, FEEDBACK_MESSAGES.GENERIC)
  }
}

/**
 * Retrieves all the stations for a given river
 * @param {object} river - The river object, which has the ID of the stations
 * @returns {Map<number, Station>} - A Map of stations under the given river
 */
export function getStationsForRiver (river) {
  return filtersStationsByRiver(river, get(stationStore))
}

/**
 * Retrieves all observations under a given river
 * @param {object} river - The river object, which has the ID of the stations
 * @returns {Observation[]} - An array of observations under the given river
 */
export function getObservationsForRiver (river) {
  const stations = getStationsForRiver(river)
  let observations = []
  stations.forEach(station => {
    observations = [...observations, ...station.observations]
  })

  console.log('observations for river: ', observations)
  return observations
}
