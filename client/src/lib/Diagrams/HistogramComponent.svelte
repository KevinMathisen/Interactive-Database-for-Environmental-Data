<script>
  import { onMount } from 'svelte'

  export let plotData = new Map() // The data to be displayed in the graph
  let Plotly

  // Initialise plotly when component is mounted
  onMount(async () => {
    Plotly = await import('plotly.js-dist-min')
  })

  // Draw the plot when plotdate is updated and plotly is loaded
  $: if (Plotly && plotData.size > 0) {
    console.log('drawing plot with plotData: ', plotData)
    drawPlot(plotData)
  }

  /**
   * Creates and draws a histogram with the given data
   * @param {Map<string, {count: number[], intervals: number[], interval: number}>} plotData - The data to be displayed in the histogram
   */
  function drawPlot (plotData) {
    // Creates histogram and lines for each species in each observation point
    const traces = []
    plotData.forEach((observationPoint, name) => {
      // Create bars for histogram
      traces.push({
        x: observationPoint.intervals,
        y: observationPoint.count,
        type: 'bar',
        name,
        width: observationPoint.interval
      })
      // Create line to outline histogram
      traces.push({
        x: observationPoint.intervals,
        y: observationPoint.count,
        mode: 'lines+markers',
        type: 'scatter',
        name,
        line: { shape: 'line' },
        marker: { size: 8 }
      })
    })

    // const traceOrret = {
    //   x: xValues,
    //   y: orretData,
    //   type: 'bar',
    //   name: 'Ørret',
    //   marker: { color: 'blue', opacity: 0.6 },
    //   width: 10 // Width of each bar to fill the interval
    // }

    // const traceOrretLine = {
    //   x: xValues,
    //   y: orretData,
    //   mode: 'lines+markers',
    //   type: 'scatter',
    //   name: 'Ørret',
    //   line: { shape: 'line', color: 'blue', width: 2 }, // hvh
    //   marker: { color: 'blue', size: 8 }
    // }

    // Displays the title, names of the axes and removes gaps between bars
    const layout = {
      title: 'Fish Count Distribution by Length Interval',
      xaxis: { title: 'Length (cm)', dtick: plotData.entries().next().value[1].interval }, // Set the interval between text on the x-axis the same as the interval between bars
      yaxis: { title: 'Count' },
      barmode: 'overlay',
      hovermode: 'closest',
      bargap: 0
    }

    // Plot the histogram
    Plotly.newPlot('fishHistogram', traces, layout)
  }
</script>

<!--Displays the bar chart with id "fishHistogram"-->
<div id="fishHistogram"></div>

<style>

</style>
