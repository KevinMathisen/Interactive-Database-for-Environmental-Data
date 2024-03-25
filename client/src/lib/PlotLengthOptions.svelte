<script>
  import RadioInput from './RadioInput.svelte'

  export let showPlotB
  export let intervallPlotB
  export let plotTypeB
  export let combineSpecies

  // Options when choosing plot type
    const plotTypeOptions = [
      { value: 'histogram', label: 'Histogram' },
      { value: 'boxplot', label: 'Boksplott' }
    ]
</script>

<label for="showPlotB">
  Vis
  <input type="checkbox" id="showPlotB" name="showPlotB" bind:checked={showPlotB}>
</label>

<h4>Diagram type</h4>

<RadioInput name="plotTypeB" options={plotTypeOptions} bind:selected={plotTypeB}/>

{#if plotTypeB === 'histogram'}
  <h4>Intervall i mm</h4>
  <!-- Input intervall for plotting-->
  <input type="number" id="intervallPlotB" name="intervallPlotB" bind:value={intervallPlotB} placeholder="mm" />
{/if}

<h4>Grupper arter</h4>
<label for="combineSpecies">
  Grupper arter valgt for hver elv/stasjon
  <input type="checkbox" id="combineSpecies" name="combineSpecies" bind:checked={combineSpecies}>
</label>
