import { Duplex } from 'stream'
import { Base64Encode } from 'base64-stream'
import errors from 'restify-errors'

import xl from 'excel4node'

const bufferToStream = ( buffer ) => {
    let stream = new Duplex()

    stream.push( buffer )
    stream.push( null )
    return stream
}

const HEADER_HEIGHT = 30

export const sendDataAsExcel = ( req, res ) => {
    const {
        sheet, style
    } = req.body


    if ( !sheet || !style ) {
        return new errors.BadRequestError()
    }

    const { data } = sheet

    if ( !data ) {
        return new errors.BadRequestError()
    }

    let wb = new xl.Workbook()
    let ws = wb.addWorksheet( 'Sheet 1', {
        sheetFormat: {
            baseColWidth: 20, // Defaults to 10. Specifies the number of characters of the maximum digit width of the normal style's font. This value does not include margin padding or extra padding for gridlines. It is only the number of characters.,
            defaultColWidth: 20,
            defaultRowHeight: 100,
            baseRowHeight: 100,
            thickBottom: false, // 'true' if rows have a thick bottom border by default.
            thickTop: false // 'true' if rows have a thick top border by default.
        }
    } )
   
    wb.createStyle( style )

    const writeCell = ( innerWs, cell, rowIndex, colIndex ) => {
        const row = rowIndex + 1
        const col = colIndex + 1

        switch ( typeof cell.value ) {
            case 'string':
                innerWs.cell( row, col )
                    .string( cell.value )
                    .style( style )
                break
            case 'number':
                innerWs.cell( row, col )
                    .number( cell.value )
                    .style( style )
                break
            default:
                innerWs.cell( row, col )
                    .string( cell.value )
                    .style( style )
        }
    }

    const cleanCell = ( cell ) => {
        if ( Array.isArray( cell.value ) ){
            cell.value = cell.value.filter( ( val ) => val != null )
        }
    }

    ws.row( 1 ).setHeight( HEADER_HEIGHT )
    const writeRow = ( row, rowIndex ) => {
        row.forEach( ( cell, colIndex ) => {
            cleanCell( cell )
            writeCell( ws, cell, rowIndex, colIndex )
        } )
    }

    data.forEach( ( row, rowIndex ) => writeRow( row, rowIndex ) )

    wb.writeToBuffer().then( ( buffer ) => {
        const stream = bufferToStream( buffer )

        stream.pipe( new Base64Encode() ).pipe( res )
    } ).catch( ( error ) => {
        console.log( error )
    } )
}
