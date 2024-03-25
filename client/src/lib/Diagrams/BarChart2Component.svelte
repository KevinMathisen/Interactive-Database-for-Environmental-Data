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
   * Creates and draws a grouped bar chart with the given data
   * @param {Map<string, Map<string, number>>} plotData - The data to be displayed in the bar chart
   */
  function drawPlot (plotData) {
    // Create bars for each species in each observation point
    const traces = []
    plotData.forEach((observationPoint, name) => {
      traces.push({
        x: Array.from(observationPoint.keys()),
        y: Array.from(observationPoint.values()),
        type: 'bar',
        name,
        text: Array.from(observationPoint.entries(), ([key, value]) => `${key}: ${value}`),
        textposition: 'auto'
      })
    })

    // Set the barmode to 'group', add title, font size and the cornerradius og the displayed bars.
    const layout = {
      barmode: 'group',
      title: 'Fordelign av arter',
      font: { size: 15 },
      barcornerradius: 10
    }

    // Adjust the graph size according to the screen size.
    const config = { responsive: true }

    // Creates the grouped bar chart.
    Plotly.newPlot('barGroupOne', traces, layout, config)
  }
</script>

{#if plotData.size === 0}
  <p>Velg elv/stasjon</p>
{/if}

<!--Displays the grouped bar chart with id='barGroupOne'-->
<div id='barGroupOne'></div>

<style>

</style>
