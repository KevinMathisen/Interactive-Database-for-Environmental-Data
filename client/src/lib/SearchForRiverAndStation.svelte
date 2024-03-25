<script>
  import {
    filterRiversByDateAndSpecies,
    filterRiversByNameAndDateCombined,
    filterStationsByDateAndSpecies,
    filterStationsByNameAndDateCombined
  }
    from '../utils/filterData'

  export let rivers
  export let stations
  export let dataType

  export let selectedRivers
  export let selectedStations
  export let selectedStartDate
  export let selectedEndDate

  let selectableRivers = new Map()
  let selectableStations = new Map()

  let input = ''
  let dataTypeText
  let showError = ''
  $: dataTypeText = dataType === 'river' ? 'Elv' : 'Stasjon'

  /**
   * Adds the river/station the user has written in the input field
   */
   function addInput () {
     const lowercaseInput = input.toLowerCase()

     // If the input is empty, do nothing
     if (lowercaseInput.trim().length === 0) {
       return
     }

     const selectedData = dataType === 'river'
       ? filterRiversByNameAndDateCombined(rivers, lowercaseInput)
       : filterStationsByNameAndDateCombined(stations, lowercaseInput)

     // If the input is not a selectable data point, display an error
     if (selectedData.size !== 1) {
       displayError(dataTypeText + ' finnes ikke')
       return
     }

     const overlapWithChoosen = dataType === 'river'
       ? filterRiversByNameAndDateCombined(selectedRivers, lowercaseInput)
       : filterStationsByNameAndDateCombined(selectedStations, lowercaseInput)

     // If the input is already chosen, display an error
     if (overlapWithChoosen.size !== 0) {
       displayError(dataTypeText + ' allerede valgt')
       return
     }

     // Remove error message and clear input
     displayError('')
     input = ''

     // Add the selected river/station to the selected rivers/stations
     if (dataType === 'river') {
       selectedRivers = new Map([...selectedRivers, ...selectedData])
     } else {
       selectedStations = new Map([...selectedStations, ...selectedData])
     }
   }

  /**
   * Displays an error message to the user
   * @param {string} message - The message to display
   */
   function displayError (message) {
     showError = message
   }

  /**
   * Removes a river/station from the selected rivers/stations
   * @param {string} riverStationToRemove - The key of the river/station to remove
   */
   function removeRiverStation (riverStationToRemove) {
     if (dataType === 'river') {
       selectedRivers = new Map([...selectedRivers].filter(([key, _]) => key !== riverStationToRemove))
     } else {
       selectedStations = new Map([...selectedStations].filter(([key, _]) => key !== riverStationToRemove))
     }
   }

  /**
   * Handles the keydown event on the input field,
   * adds a species if the user presses enter
   * @param {KeyboardEvent} event - The keydown event
   */
   function handleKeydown (event) {
     if (event.key === 'Enter') {
       addInput()
     }
   }

  /**
   * Capitalizes the first letter of a string
   * @param {string} string - The string to capitalize
   * @returns {string} - The string with the first letter capitalized
   */
   function capitalizeFirstLetter (string) {
     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
   }

  /**
   * Filters rivers based on the input and the selected date
   * @param {Array} rivers - The array of rivers to filter
   * @param {string} input - The user input matching the river name
   * @param {Date} startDate - The start date of the river
   * @param {Date} endDate - The end date of the river
   * @returns {Array} - The filtered array of stations
   */
  function filterRiverSuggestions (rivers, input, startDate, endDate) {
    // Filter rivers based on the selected date and species
    const filteredByDateAndSpeciesRivers = filterRiversByDateAndSpecies(rivers, [], startDate, endDate)

    // Filter rivers based on the input
    const filteredBySearchAndDateAndSpeciesRivers = filterRiversByNameAndDateCombined(filteredByDateAndSpeciesRivers, input)

    // Filter away any rivers in filteredRivers which already are selected
    return new Map([...filteredBySearchAndDateAndSpeciesRivers].filter(([key, _]) => !selectedRivers.has(key)))
  }

  /**
   * Filters stations based on the input and the selected date
   * @param {Array} stations - The array of stations to filter
   * @param {string} input - The user input matching the station name
   * @param {Date} startDate - The start date of the station
   * @param {Date} endDate -  The end date of the station
   * @returns {Array} - The filtered array of stations
   */
  function filterStationSuggestions (stations, input, startDate, endDate) {
    // Filter stations based on the selected date and species
    const filteredByDateAndSpeciesStations = filterStationsByDateAndSpecies(stations, [], startDate, endDate)

    // Filter stations based on the input
    const filteredBySearchAndDateAndSpeciesStations = filterStationsByNameAndDateCombined(filteredByDateAndSpeciesStations, input)

    // Filter away any stations in filteredStations which already are selected
    return new Map([...filteredBySearchAndDateAndSpeciesStations].filter(([key, _]) => !selectedStations.has(key)))
  }

  // Get the species to suggest to the user based on the input
  $: selectableRivers = filterRiverSuggestions(rivers, input, selectedStartDate, selectedEndDate)
  $: selectableStations = filterStationSuggestions(stations, input, selectedStartDate, selectedEndDate)

  $: showRiverSuggestions = input.trim().length > 0 && dataType === 'river' && selectableRivers.size > 0
  $: showStationSuggestions = input.trim().length > 0 && dataType === 'station' && selectableStations.size > 0

</script>

<!-- Input for adding a river/station to the selected rivers/stations -->
<input
  type="text"
  bind:value={input}
  on:keydown={handleKeydown}
  placeholder="Legg til {dataTypeText}"/>
<button on:click={addInput}>+</button>

<!-- Error message to display to the user -->
{#if showError}
<p>{showError}</p>
{/if}

<!-- Suggestions for rivers -->
{#if showRiverSuggestions}
  <div class="suggestions">
    {#each Array.from(selectableRivers.entries()) as [_, river]}
      <button on:click={() => { input = river.name + ' ' + river.startDate; addInput() }}>
        {capitalizeFirstLetter(river.name + ' ' + river.startDate)}
      </button>
    {/each}
  </div>
{:else if showStationSuggestions}
  <!-- Suggestions for stations -->
  <div class="suggestions">
    {#each Array.from(selectableStations.entries()) as [_, station]}
      <button on:click={() => { input = station.name + ' ' + station.date; addInput() }}>
        {capitalizeFirstLetter(station.name + ' ' + station.date)}
      </button>
    {/each}
  </div>
{/if}

<!-- List of selected rivers -->
{#if dataType === 'river'}
  <p>Valgte elver</p>
  <ul>
    {#each Array.from(selectedRivers.entries()) as [key, river]}
      <li>
        {capitalizeFirstLetter(river.name + ' ' + river.startDate)}
        <button on:click={() => removeRiverStation(key)}>x</button>
      </li>
    {/each}
  </ul>
{:else}
  <!-- List of selected stations -->
  <p>Valgte stasjoner</p>
  <ul>
    {#each Array.from(selectedStations.entries()) as [key, station]}
      <li>
        {capitalizeFirstLetter(station.name + ' ' + station.date)}
        <button on:click={() => removeRiverStation(key)}>x</button>
      </li>
    {/each}
  </ul>
{/if}
