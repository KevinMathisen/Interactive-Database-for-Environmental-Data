<script>
    import BarChart2Component from '../../lib/Diagrams/BarChart2Component.svelte'
    import PieChartComponent from '../../lib/Diagrams/PieChartComponent.svelte'
    import BoxPlotComponent from '../../lib/Diagrams/BoxPlottComponent.svelte'
    import HistogramComponent from '../../lib/Diagrams/HistogramComponent.svelte'
    import {
      dataForBarAndPieChart,
      dataForHistogramAndBoxplot
    } from '../../utils/plotlyData.js'

    export let type = 'bar' // The type of graph to display, 'barchart', 'piechart', 'boxplot' or 'histogram'
    export let plotData = new Map() // The data to be displayed in the graph
    export let dataType // The type of data to display, 'river' or 'station'
    export let species = [] // The species to display in the graph
    export let absoluteValues = true // Whether to display absolute values in the graph
    export let interval = 1 // The interval to display in the graph
    export let includeOthers // Whether to include 'others' category in the graph
    export let combineSpecies = false // Whether to combine species for each river/station in the graph

    let formattedData = new Map()

    $: if (plotData.size > 0 && dataType && species.length > 0) {
      formattedData = (type === 'barchart' || type === 'piechart')
        ? dataForBarAndPieChart(plotData, dataType, species, includeOthers, absoluteValues === 'absolute')
        : dataForHistogramAndBoxplot(type, plotData, dataType, species, interval, includeOthers, combineSpecies)
    }

    $: console.log('plotData: ', plotData, ' ', type)
    $: console.log('formatted data: ', formattedData, ' ', type)
</script>

<!-- Plot graph choosen by user -->
{#if type === 'barchart'}
    <BarChart2Component plotData={formattedData} {absoluteValues}/>
{:else if type === 'piechart'}
    <PieChartComponent plotData={formattedData} {absoluteValues}/>
{:else if type === 'boxplot'}
    <BoxPlotComponent plotData={formattedData}/>
{:else}
    <HistogramComponent plotData={formattedData}/>
{/if}
