import { Readable, Duplex } from 'stream'; 
import { Base64Encode } from 'base64-stream';

import xl from 'excel4node';

function bufferToStream(buffer) {  
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export const sendDataAsExcel = (req, res) => {
  const {
    sheet, style
  } = req.body;
  const { data } = sheet;

  var wb = new xl.Workbook();
  var ws = wb.addWorksheet('Sheet 1', {
    'sheetFormat': {
      'baseColWidth': 20, // Defaults to 10. Specifies the number of characters of the maximum digit width of the normal style's font. This value does not include margin padding or extra padding for gridlines. It is only the number of characters.,
      'defaultColWidth': 20,
      'defaultRowHeight': 100,
      'baseRowHeight': 100,
      'thickBottom': false, // 'true' if rows have a thick bottom border by default.
      'thickTop': false // 'true' if rows have a thick top border by default.
    },
  });
   
  // Create a reusable style
  var wbStyle = wb.createStyle(style);

  const writeCell = (ws, cell, rowIndex, colIndex) => {
    const row = rowIndex + 1;
    const col = colIndex + 1;
    switch (typeof cell.value) {
      case 'string':
        ws.cell(row, col)
          .string(cell.value)
          .style(style);
        break;
      case 'number':
        ws.cell(row, col)
          .number(cell.value)
          .style(style);
        break;
      default:
        ws.cell(row, col)
          .string(cell.value)
          .style(style);
    }
  };
  const writeRow = (row, rowIndex) => {
    row.forEach((cell, colIndex) => writeCell(ws, cell, rowIndex, colIndex));
  };

  data.forEach((row, rowIndex) => writeRow(row, rowIndex));

  wb.writeToBuffer().then(function(buffer) {
    const stream = bufferToStream(buffer);
    stream.pipe(new Base64Encode()).pipe(res);
  });
};
