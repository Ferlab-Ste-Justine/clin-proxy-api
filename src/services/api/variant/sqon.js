/* eslint-disable */

import { cloneDeep, isArray, isObject } from 'lodash';

const BODY = {
    from: 0,
    size: 25,
    query: {}
}

export const groupByPriorities = (queries = []) => {
    const groupedQueries = []
    const flattenByDepth = (list, depth = 0) => {
        list.forEach( ( item ) => {
            if (!isArray( item )) {
                if (!groupedQueries[depth]) {
                    groupedQueries[depth] = []
                }

                groupedQueries[depth].push( item )
            } else {
                flattenByDepth( item, (depth+1) )
            }
        } )
    }

    flattenByDepth(queries)
    return groupedQueries.reverse()
}


export const denormalizeSubqueries = (queries = []) => {
    //@TODO Should inject matching queries content into subquery

    const denormalizedQueries = []

    const denormalize = (list) => {
        list.forEach( ( item ) => {
            if (isObject( item )) {

                //@TODO denormalize subqueries, if any.
                console.log('Denormalizing subqueries for ' + JSON.stringify(item))

            } else {
                // Array of instruction
                // [ instructions ],

                console.log('...........')
                denormalize(item)
            }
        } )
    }

    // Find all subqueries
    //

    denormalize(queries)
    return denormalizedQueries;
}

















const transform = ( sqon ) => {
    if (!(sqon instanceof Array) || sqon.length < 1) {
        return null;
    }

    const query = Object.assign(BODY, {})




    // ???





    return query
}

export default transform
