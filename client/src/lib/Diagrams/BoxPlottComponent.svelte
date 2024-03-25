<script>
  // Imports the onMount function from svelte.
  import { onMount } from 'svelte'

  export let plotData = new Map() // The data to be displayed in the graph
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
   * Creates and draws box plots with the given data
   * @param {Map<string, {lengths}>} plotData - The data to be displayed in the box plot
   */
  function drawPlot (plotData) {
    // Create boxplot with dots and mean with standard deviation for each species in each observation point
    const traces = []
    plotData.forEach((observationPoint, name) => {
      traces.push({
        y: observationPoint.lengths,
        type: 'box',
        name,
        boxpoints: 'all',
        marker: {
          color: observationPoint.color
        },
        boxmean: 'sd'
      })
    })

    // The title, font size and the title of the y-axis.
    const layout = {
      title: 'Box Plot Styling Mean and Standard Deviation',
      font: { size: 15 },
      yaxis: { title: 'Size (cm)' }
    }

    const config = { responsive: true }

    // Creates the boxplot.
    Plotly.newPlot('boxPlot', traces, layout, config)
  }
</script>

<!--Displays the box plot with id "boxPlot"-->
<div id='boxPlot'></div>

<style>

</style>
