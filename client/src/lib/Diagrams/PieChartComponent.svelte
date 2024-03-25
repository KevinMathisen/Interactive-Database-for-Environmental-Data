<script>
  // Imports the onMount function from svelte.
  import { onMount } from 'svelte'

  export let plotData = new Map()
  let Plotly

  // Initializes the Plotly library when the component is mounted.
  onMount(async () => {
    Plotly = await import('plotly.js-dist-min')
  })

  $: if (Plotly && plotData.size > 0) {
    console.log('drawing plot with plotData: ', plotData)
    drawPlot(plotData)
  }

  /**
   * Creates and draws pie charts with the given data
   * @param {Map<string, Map<string, number>>} plotData - The data to be displayed in the pie chart
   */
  function drawPlot (plotData) {
    // Find the rows and columns for the pie charts
    // The number of rows and columns should be as close to each other as possible
    const rows = Math.ceil(Math.sqrt(plotData.size))
    const columns = Math.ceil(plotData.size / rows)

    // Create pie charts for each observation point
    const piecharts = []
    plotData.forEach((observationPoint, name) => {
      piecharts.push({
        labels: Array.from(observationPoint.keys()),
        values: Array.from(observationPoint.values()),
        type: 'pie',
        name,
        // text: Array.from(observationPoint.entries(), ([key, value]) => `${key}: ${value}`),
        textposition: 'auto',
        domain: { // Find the position of the pie chart in the grid based on its index and the number of columns
          row: Math.floor(piecharts.length / columns),
          column: piecharts.length % columns
        }
      })
    })

    // The title and fontsize.
    const layout = {
      title: 'FORDELING AV ARTER',
      font: { size: 14 },
      grid: { rows, columns }
    }

    // Adjust the graph size according to the screen size.
    const config = { responsive: true }

    // Creates the pie chart.
    Plotly.newPlot('sectorOne', piecharts, layout, config)
  }
</script>

{#if plotData.size === 0}
  <p>Velg elv/stasjon</p>
{/if}

<!--Displays the pie chart with id "sectorOne"-->
<div id='sectorOne'></div>

<style>

</style>
