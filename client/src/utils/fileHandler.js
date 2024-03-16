import ExcelJS from 'exceljs'
import {
  FEEDBACK_TYPES,
  FEEDBACK_CODES,
  FEEDBACK_MESSAGES
} from '../constants/feedbackMessages.js';
import { addFeedbackToStore } from './addFeedbackToStore';

//  - - - - DOWNLOAD FUNCTIONALITY - - - -
export async function generateExcelFile (data) {
  console.log(data)
  const workbook = new ExcelJS.Workbook()

  const worksheet = workbook.addWorksheet('Sheet1')

  worksheet.addRow(['stasjon', 'navn', 'dato', 'klokkeslett', 'lat start', 'long start', 'lat stopp', 'long stopp',
  'elvtype', 'vær', 'vanntemperatur', 'lufttemperatur','sekunder fisket', 'volt', 
  'puls', 'ledningsevne', 'arter??', 'oservasjoner', 'transektlengde', 'display','gpx File', 'kommentar'])

  

  /* const worksheet2 = workbook.addWorksheet('Sheet2');
    worksheet2.addRow(['Name2', 'Age2', 'Email2']); */

  // Add data
  data.forEach(row => {
    // Loop through each property of the row
    for (let key in row) {
        // If the property value is null, set it to '.'
        if (row[key] === null) {
            row[key] = ' ';
        }
    }

    let str = row.name;
    let parts = str.split(' ');
    worksheet.addRow([parts[1], parts[0], row.date ,row.time , row.startPos.coordinates[0] , row.startPos.coordinates[1],
      row.endPos.coordinates[0],row.endPos.coordinates[1], row.riverType, row.weather, row.waterTemp, row.airTemp,
      row.secFished, row.voltage, row.pulse, row.conductivity, "art", row.observations , 
      row.transectLength, row.display, row.gpxFile, row.comment ])
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

export async function generateCSVFile (data) {
  // Generate CSV content
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n')

  return csvContent
}

//  - - - - UPLOAD FUNCTIONALITY - - - -

export function validateFile (file) {
  // Check if the file type is valid
  if (!['.csv', '.xlsx'].includes(file.name.slice(file.name.lastIndexOf('.')))) {
    
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.UNSUPPORTED_CONTENT_TYPE, FEEDBACK_MESSAGES.UNSUPPORTED_CONTENT_TYPE)
    return false
  }
  // Check if the file size exceeds the limit
  if (file.size > 10 * 1024 * 1024) {
    addFeedbackToStore(FEEDBACK_TYPES.ERROR, FEEDBACK_CODES.CONTENT_TO_LARGE, FEEDBACK_MESSAGES.CONTENT_TO_LARGE)
    return false
  }
  return true
}

export function fileExistsInArray (file, filesArray) {
  return filesArray.some(existingFile => existingFile.name === file.name)
}
