import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  dataForBarAndPieChart,
  dataForHistogramAndBoxplot
} from './plotlyData'
import { getObservationsForRiver, getStationsForRiver } from './dataManager.js'
import { River } from '../models/River.js'
import { Station } from '../models/Station.js'

vi.mock('../utils/dataManager', () => ({
  getObservationsForRiver: vi.fn(),
  getStationsForRiver: vi.fn()
}))

describe('test dataForBarAndPieChart function', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should return count of 0 for each species if no observations are found for rivers', () => {
    getObservationsForRiver.mockReturnValue([])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = ['species1', 'species2']
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map([
        ['species1', 0],
        ['species2', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return river with no species in data if no species are given', () => {
    getObservationsForRiver.mockReturnValue([
      {
        id: 1,
        species: 'species1',
        length: 10,
        count: 1
      }
    ])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = []
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map()]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map([
        ['species1', 1],
        ['species2', 2],
        ['species3', 1]
      ])],
      ['Test river 2 2021-01-02', new Map([
        ['species1', 2],
        ['species2', 1],
        ['species3', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when subset species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map([
        ['species1', 1]
      ])],
      ['Test river 2 2021-01-02', new Map([
        ['species1', 2]
      ])]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given, and it should include others', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map([
        ['species1', 1],
        ['others', 3]
      ])],
      ['Test river 2 2021-01-02', new Map([
        ['species1', 2],
        ['others', 1]
      ])]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, true)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct relative river data when species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    getStationsForRiver.mockReturnValue(new Map([
      [1, new Station({
        id: 1,
        secFished: 120
      })]
    ]))
    const expectedData = new Map([
      ['Test river 2021-01-01', new Map([
        ['species1', 0.5],
        ['species2', 1],
        ['species3', 0.5]
      ])],
      ['Test river 2 2021-01-02', new Map([
        ['species1', 1],
        ['species2', 0.5],
        ['species3', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(rivers, 'river', species, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return count of 0 for each species if no observations are found for stations', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: []
      })]
    ])
    const species = ['species1', 'species2']
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map([
        ['species1', 0],
        ['species2', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return station with no species in data if no species are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          {
            id: 1,
            species: 'species1',
            length: 10,
            count: 1
          }
        ]
      })]
    ])
    const species = []
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map()]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map([
        ['species1', 1],
        ['species2', 2],
        ['species3', 1]
      ])],
      ['Test station 2 2021-01-02', new Map([
        ['species1', 2],
        ['species2', 1],
        ['species3', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when subset species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map([
        ['species1', 1]
      ])],
      ['Test station 2 2021-01-02', new Map([
        ['species1', 2]
      ])]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given, and it should include others', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map([
        ['species1', 1],
        ['others', 3]
      ])],
      ['Test station 2 2021-01-02', new Map([
        ['species1', 2],
        ['others', 1]
      ])]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, true)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct relative station data when species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        secFished: 120,
        observations: [
          { id: 1, species: 'species1', length: 10, count: 1 },
          { id: 2, species: 'species2', length: 20, count: 2 },
          { id: 3, species: 'species3', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        secFished: 120,
        observations: [
          { id: 1, species: 'species1', length: 10, count: 2 },
          { id: 2, species: 'species2', length: 20, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const expectedData = new Map([
      ['Test station 2021-01-01', new Map([
        ['species1', 0.5],
        ['species2', 1],
        ['species3', 0.5]
      ])],
      ['Test station 2 2021-01-02', new Map([
        ['species1', 1],
        ['species2', 0.5],
        ['species3', 0]
      ])]
    ])

    const data = dataForBarAndPieChart(stations, 'station', species, false, false)

    expect(data).toEqual(expectedData)
  })
})

describe('test dataForHistogramAndBoxplot function for histogram', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should return empty arrays if no observations are found for rivers', () => {
    getObservationsForRiver.mockReturnValue([])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = ['species1', 'species2']
    const interval = 10
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        count: [],
        intervals: [],
        interval
      }],
      ['Test river 2021-01-01 - species2', {
        count: [],
        intervals: [],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return empty map if no species are given for rivers', () => {
    getObservationsForRiver.mockReturnValue([
      {
        id: 1,
        species: 'species1',
        length: 10,
        count: 1
      }
    ])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = []
    const interval = 10
    const expectedData = new Map()

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 5
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test river 2021-01-01 - species2', {
        count: [1, 2],
        intervals: [12.5, 17.5],
        interval
      }],
      ['Test river 2021-01-01 - species3', {
        count: [],
        intervals: [],
        interval
      }],
      ['Test river 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }],
      ['Test river 2 2021-01-02 - species2', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test river 2 2021-01-02 - species3', {
        count: [],
        intervals: [],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when subset species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const interval = 5
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test river 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given, and it should include others', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const interval = 5
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test river 2021-01-01 - others', {
        count: [1, 2],
        intervals: [12.5, 17.5],
        interval
      }],
      ['Test river 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }],
      ['Test river 2 2021-01-02 - others', {
        count: [1],
        intervals: [7.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, true, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given, and it should combine species for each river', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 5
    const expectedData = new Map([
      ['Test river 2021-01-01 - sum', {
        count: [1, 1, 2],
        intervals: [7.5, 12.5, 17.5],
        interval
      }],
      ['Test river 2 2021-01-02 - sum', {
        count: [1, 1, 0, 2],
        intervals: [7.5, 12.5, 17.5, 22.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', rivers, 'river', species, interval, false, true)

    expect(data).toEqual(expectedData)
  })

  it('should return empty arrays if no observations are found for stations', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: []
      })]
    ])
    const species = ['species1', 'species2']
    const interval = 10
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        count: [],
        intervals: [],
        interval
      }],
      ['Test station 2021-01-01 - species2', {
        count: [],
        intervals: [],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return empty map if no species are given for stations', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          {
            id: 1,
            species: 'species1',
            length: 10,
            count: 1
          }
        ]
      })]
    ])
    const species = []
    const interval = 10
    const expectedData = new Map()

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 5
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test station 2021-01-01 - species2', {
        count: [1, 2],
        intervals: [12.5, 17.5],
        interval
      }],
      ['Test station 2021-01-01 - species3', {
        count: [],
        intervals: [],
        interval
      }],
      ['Test station 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }],
      ['Test station 2 2021-01-02 - species2', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test station 2 2021-01-02 - species3', {
        count: [],
        intervals: [],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when subset species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const interval = 5
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test station 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given, and it should include others', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const interval = 5
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        count: [1],
        intervals: [7.5],
        interval
      }],
      ['Test station 2021-01-01 - others', {
        count: [1, 2],
        intervals: [12.5, 17.5],
        interval
      }],
      ['Test station 2 2021-01-02 - species1', {
        count: [1, 0, 2],
        intervals: [12.5, 17.5, 22.5],
        interval
      }],
      ['Test station 2 2021-01-02 - others', {
        count: [1],
        intervals: [7.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, true, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given, and it should combine species for each station', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 5
    const expectedData = new Map([
      ['Test station 2021-01-01 - sum', {
        count: [1, 1, 2],
        intervals: [7.5, 12.5, 17.5],
        interval
      }],
      ['Test station 2 2021-01-02 - sum', {
        count: [1, 1, 0, 2],
        intervals: [7.5, 12.5, 17.5, 22.5],
        interval
      }]
    ])

    const data = dataForHistogramAndBoxplot('histogram', stations, 'station', species, interval, false, true)

    expect(data).toEqual(expectedData)
  })
})

describe('test dataForHistogramAndBoxplot function for boxplot', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should return empty arrays if no observations are found for rivers', () => {
    getObservationsForRiver.mockReturnValue([])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = ['species1', 'species2']
    const interval = 1
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        lengths: []
      }],
      ['Test river 2021-01-01 - species2', {
        lengths: []
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return empty map if no species are given for rivers', () => {
    getObservationsForRiver.mockReturnValue([
      {
        id: 1,
        species: 'species1',
        length: 10,
        count: 1
      }
    ])
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })]
    ])
    const species = []
    const interval = 1
    const expectedData = new Map()

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 1
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test river 2021-01-01 - species2', {
        lengths: [18, 18, 10]
      }],
      ['Test river 2021-01-01 - species3', {
        lengths: []
      }],
      ['Test river 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }],
      ['Test river 2 2021-01-02 - species2', {
        lengths: [5]
      }],
      ['Test river 2 2021-01-02 - species3', {
        lengths: []
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when subset species and observations are given', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const interval = 1
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test river 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given, and it should include others', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1']
    const interval = 1
    const expectedData = new Map([
      ['Test river 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test river 2021-01-01 - others', {
        lengths: [18, 18, 10]
      }],
      ['Test river 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }],
      ['Test river 2 2021-01-02 - others', {
        lengths: [5]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, true, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct river data when species and observations are given, and it should combine species for each river', () => {
    // Mock getObservationsForRiver function to return observations for rivers given their id
    getObservationsForRiver.mockImplementation((river) => {
      if (river.id === 1) {
        return [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      } else if (river.id === 2) {
        return [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      }
    })
    const rivers = new Map([
      [1, new River({
        id: 1,
        name: 'Test river',
        startDate: '2021-01-01'
      })],
      [2, new River({
        id: 2,
        name: 'Test river 2',
        startDate: '2021-01-02'
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 1
    const expectedData = new Map([
      ['Test river 2021-01-01 - sum', {
        lengths: [5, 18, 18, 10]
      }],
      ['Test river 2 2021-01-02 - sum', {
        lengths: [20, 20, 5, 10]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', rivers, 'river', species, interval, false, true)

    expect(data).toEqual(expectedData)
  })

  it('should return empty arrays if no observations are found for stations', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: []
      })]
    ])
    const species = ['species1', 'species2']
    const interval = 1
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        lengths: []
      }],
      ['Test station 2021-01-01 - species2', {
        lengths: []
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return empty map if no species are given for stations', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          {
            id: 1,
            species: 'species1',
            length: 10,
            count: 1
          }
        ]
      })]
    ])
    const species = []
    const interval = 1
    const expectedData = new Map()

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 1
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test station 2021-01-01 - species2', {
        lengths: [18, 18, 10]
      }],
      ['Test station 2021-01-01 - species3', {
        lengths: []
      }],
      ['Test station 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }],
      ['Test station 2 2021-01-02 - species2', {
        lengths: [5]
      }],
      ['Test station 2 2021-01-02 - species3', {
        lengths: []
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when subset species and observations are given', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const interval = 1
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test station 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, false, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given, and it should include others', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1']
    const interval = 1
    const expectedData = new Map([
      ['Test station 2021-01-01 - species1', {
        lengths: [5]
      }],
      ['Test station 2021-01-01 - others', {
        lengths: [18, 18, 10]
      }],
      ['Test station 2 2021-01-02 - species1', {
        lengths: [20, 20, 10]
      }],
      ['Test station 2 2021-01-02 - others', {
        lengths: [5]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, true, false)

    expect(data).toEqual(expectedData)
  })

  it('should return the correct station data when species and observations are given, and it should combine species for each station', () => {
    const stations = new Map([
      [1, new Station({
        id: 1,
        name: 'Test station',
        date: '2021-01-01',
        observations: [
          { id: 1, species: 'species1', length: 5, count: 1 },
          { id: 2, species: 'species2', length: 18, count: 2 },
          { id: 3, species: 'species2', length: 10, count: 1 }
        ]
      })],
      [2, new Station({
        id: 2,
        name: 'Test station 2',
        date: '2021-01-02',
        observations: [
          { id: 1, species: 'species1', length: 20, count: 2 },
          { id: 2, species: 'species2', length: 5, count: 1 },
          { id: 3, species: 'species1', length: 10, count: 1 }
        ]
      })]
    ])
    const species = ['species1', 'species2', 'species3']
    const interval = 1
    const expectedData = new Map([
      ['Test station 2021-01-01 - sum', {
        lengths: [5, 18, 18, 10]
      }],
      ['Test station 2 2021-01-02 - sum', {
        lengths: [20, 20, 5, 10]
      }]
    ])

    const data = dataForHistogramAndBoxplot('boxplot', stations, 'station', species, interval, false, true)

    expect(data).toEqual(expectedData)
  })
})
