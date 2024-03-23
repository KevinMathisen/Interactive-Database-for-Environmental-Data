import Ajv from 'ajv'
import Papa from 'papaparse'
import ExcelJS from 'exceljs'
import fs from 'fs'
import path from 'path'
import * as yup from 'yup'
import validator from 'validator'

const schemaRiverWithSpecies = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    pos: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    species: { type: 'array', items: { type: 'string' } }
  },
  required: ['id', 'name', 'pos', 'start_date', 'end_date', 'species']
}

const schemaStationWithSpecies = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    start_pos: { type: 'string' },
    end_pos: { type: 'string' },
    date: { type: 'string' },
    species: { type: 'array', items: { type: 'string' } }
  },
  required: ['id', 'name', 'start_pos', 'end_pos', 'date', 'species']
}

const schemaRiverSummary = {
  type: 'object',
  properties: {
    ID: { type: 'string' },
    name: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    project_id: { type: 'string' },
    waterflow: { type: 'string' },
    boattype: { type: 'string' },
    skipper: { type: 'string' },
    crew: { type: 'string' },
    comment: { type: 'string' },
    stations: { type: 'array', items: { type: 'string' } }
  },
  required: ['ID', 'name', 'start_date', 'end_date', 'project_id', 'waterflow', 'boattype', 'skipper', 'crew', 'comment', 'stations']
}

const schemaStationSummary = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    date: { type: 'string' },
    time: { type: 'string' },
    river_id: { type: 'string' },
    description: { type: 'string' },
    rivertype: { type: 'string' },
    weather: { type: 'string' },
    water_temp: { type: 'string' },
    air_temp: { type: 'string' },
    sec_fished: { type: 'string' },
    voltage: { type: 'string' },
    pulse: { type: 'string' },
    conductivity: { type: 'string' },
    observations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          species: { type: 'string' },
          size: { type: 'string' },
          amount: { type: 'string' }
        },
        required: ['species', 'size', 'amount']
      }
    }
  },
  required: ['id', 'name', 'date', 'time', 'river_id', 'description', 'rivertype', 'weather', 'water_temp', 'air_temp', 'sec_fished', 'voltage', 'pulse', 'conductivity', 'observations']
}

const schemaStationDownload = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    transect_length: { type: 'string' },
    display: { type: 'string' },
    gpx_file: { type: 'string' },
    observations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          station: { type: 'string' },
          round: { type: 'string' },
          species: { type: 'string' },
          length: { type: 'string' },
          count: { type: 'string' },
          gender: { type: 'string' },
          age: { type: 'string' },
          released: { type: 'string' },
          sampletype: { type: 'string' },
          comment: { type: 'string' }
        },
        required: ['id', 'station', 'round', 'species', 'length', 'count', 'gender', 'age', 'released', 'sampletype', 'comment']
      }
    }
  },
  required: ['id', 'transect_length', 'display', 'gpx_file', 'observations']
}

/**
 * Sanitizes input using regex to allow specific characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized input string
 */
function sanitizeInput (input) {
  const allowedPattern = /^[a-zA-Z0-9 .,?!]+$/

  // Handles invalid input
  if (!allowedPattern.test(input)) {
    return ''
  }

  // Sanitize input
  return validator.escape(input)
}

/**
 * Validate river with species data
 * @param {object} data - The river with species data to validate
 */
export function validateRiverWithSpecies (data) {
  const ajv = new Ajv()
  const validate = ajv.compile(schemaRiverWithSpecies)
  const valid = validate(data)
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Validate station with species data
 * @param {object} data - The station with species data to validate
 */
export function validateStationWithSpecies (data) {
  const ajv = new Ajv()
  const validate = ajv.compile(schemaStationWithSpecies)
  const valid = validate(data)
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Validate river summary data
 * @param {object} data - The river summary data to validate
 */
export function validateRiverSummary (data) {
  const ajv = new Ajv()
  const validate = ajv.compile(schemaRiverSummary)
  const valid = validate(data)
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Validate station summary data
 * @param {object} data - The station summary data to validate
 */
export function validateStationSummary (data) {
  const ajv = new Ajv()
  const validate = ajv.compile(schemaStationSummary)
  const valid = validate(data)
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Validate station download data
 * @param {object} data - The river with species data to validate
 */
export function validateStationDownload (data) {
  const ajv = new Ajv()
  const validate = ajv.compile(schemaStationDownload)
  const valid = validate(data)
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Validate river with species data
 * @param {object} data - The river with species data to validate
 * @param {object} schema - The schema to validate the data against
 */
export function validateData (data, schema) {
  const ajv = new Ajv()
  const validate = ajv.compile(schema)

  // Sanitize strings in data before it validates
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = sanitizeInput(data[key])
    }
  })
  const valid = validate(data)

  // Throws an error if the data is invalid
  if (!valid) {
    throw new Error(validate.errors.map(error => error.message).join('\n'))
  }
}

/**
 * Parse and validate workbook data
 * @param {string} filename - The name of the file to parse and validate
 * @param {string} dataType - The type of data to validate
 */
export async function parseAndValidateWorkbook (filename, dataType) {
  const ext = path.extname(filename)
  let workbook
  let schema

  // Determine schema based on data type
  if (dataType === 'station') {
    schema = schemaStationDownload
  } else if (dataType === 'river') {
    schema = schemaRiverSummary
  } else {
    throw new Error('Invalid data type')
  }

  let sheetNames

  if (ext === '.xlsx') {
    workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filename)
    sheetNames = workbook.worksheetNames
  } else if (ext === '.csv') {
    try {
      const fileContent = await fs.promises.readFile(filename, 'utf8')
      const results = Papa.parse(fileContent, { header: true })
      workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Sheet1')
      worksheet.addRows(results.data)
      sheetNames = ['Sheet1']
    } catch (error) {
      console.error(`Failed to process CSV file: ${error}`)
    }
  }

  await Promise.all(sheetNames.map(async (sheetName) => {
    const worksheet = workbook.getWorksheet(sheetName)
    let headers = []
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) {
        // Capture header row to map column names to schema properties
        headers = row.values
      } else {
        const rowData = {} // Prepare an object for sanitized row data
        row.eachCell((cell, colNumber) => {
          // Use header for key if available, falling back to `col${colNumber}` otherwise
          const key = headers[colNumber] || `col${colNumber}`
          rowData[key] = typeof cell.value === 'string' ? sanitizeInput(cell.value) : cell.value
        })
        validateData(rowData, schema) // Adjusted to ensure rowData structure matches schema
      }
    })
  }))
}

const formSchema = yup.object().shape({
  typeData: yup.string().oneOf(['Elvedata', 'Stasjonsdata']).required('Type data is required'),
  fromDate: yup.string().required('From date is required').test(
    'is-valid-date',
    'From date is invalid',
    (value) => validator.isDate(value, { format: 'MM/DD/YYYY', strictMode: true })
  ),
  toDate: yup.string().required('To date is required').test(
    'is-valid-date',
    'To date is invalid',
    (value) => validator.isDate(value, { format: 'MM/DD/YYYY', strictMode: true })
  ).test(
    'is-after-from-date',
    'To date must be after from date',
    function (value) {
      const { fromDate } = this.parent
      return validator.isAfter(value, fromDate)
    }
  ),
  art: yup.string().oneOf(['Velg alle', 'Egendefinert']).required('Art is required')
})

/**
 * Validate form data
 * @param {object} formData - The form data to validate
 * @returns {Promise<object>} - The validated form data
 */
export async function validateFormData (formData) {
  // Sanitize each form field value if it's a string
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      formData[key] = sanitizeInput(formData[key])
    }
  })

  try {
    const validFormData = await formSchema.validate(formData, { abortEarly: false })
    console.log('Validated Form Data:', validFormData)
    return validFormData
  } catch (error) {
    const errors = error.inner.map(err => err.message)
    throw new Error(errors.join(', '))
  }
}
