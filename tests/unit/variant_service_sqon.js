import { expect } from 'chai'

import sum from '../../src/services/api/variant/sqon'

describe( 'sum function', () => {
    it( 'sums up two integers', () => {
        expect( sum( 1, 2 ) ).to.eql( 3 )
    } )
} )
