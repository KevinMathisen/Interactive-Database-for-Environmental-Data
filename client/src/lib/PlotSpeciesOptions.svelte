<script>
  import RadioInput from './RadioInput.svelte'

  export let showPlotA
    export let showValueA
    export let plotTypeA

  // Options when choosing y value
    const yValueOptions = [
      { value: 'absolute', label: 'Antall per art' },
      { value: 'relative', label: 'Ant/min per art' }
    ]

  // Options when choosing plot type
    const plotTypeOptions = [
      { value: 'barchart', label: 'Stolpediagram' },
      { value: 'piechart', label: 'Sektordiagram' }
    ]
</script>

<label for="showPlotA">
  Vis
  <input type="checkbox" id="showPlotA" name="showPlotA" bind:checked={showPlotA}>
</label>

<h4>Y-akse verdi</h4>

<RadioInput name="showPlotA" options={yValueOptions} bind:selected={showValueA}/>

<h4>Diagram type</h4>

<RadioInput name="plotTypeA" options={plotTypeOptions} bind:selected={plotTypeA}/>
