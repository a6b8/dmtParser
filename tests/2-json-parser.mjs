function findJsonObjects( { str } ) {
    if( typeof str === undefined ) {
        console.log( `str is undefined.` )
        process.exit( 1 )

    } else if( typeof str !== 'string' ) {
        console.log( `str is not type of string: "${str}"` )
        process.exit( 1 )
    } 

    const result = str
        .split( '' )
        .reduce( ( acc, char, index, all ) => {
            let flush = false
            if( acc['type'] === null ) {
                if( char === '{' ) {
                    acc['type'] = 'json'
                    acc['balance']++
                } else if( char === '[' ) {
                    acc['type'] = 'array'
                    acc['balance']++
                }
            
            } else {
                switch( acc['type'] ) {
                    case 'json':
                        if( char === '{' ) {
                            acc['balance']++
                        } else if( char === '}' ) {
                            acc['balance']--
                            acc['balance'] === 0 ? flush = true : null
                        }
                        break
                    case 'array': 
                        if( char === '[' ) {
                            acc['balance']++
                        } else if( char === ']' ) {
                            acc['balance']--
                            acc['balance'] === 0 ? flush = true : null
                        }
                        break
                    default:
                        break
                } 
            }
            
            if( acc['type'] !== null ) {
                acc['chars'].push( char )
                if( flush ) {
                    acc['jsons'].push( acc['chars'].join( '' ) )
                    acc['chars'] = []
                    acc['type'] = null
                    flush = false
                }
            } 

            if( all.length -1 === index ) {
                acc = acc['jsons']
                    .map( ( json, index ) => JSON.parse( json ) )
            }

            return acc
        }, { 'balance': 0, 'jsons': [], 'chars': [], 'type': null } )

    return result
}


const str = `
{ "a": 1, "b": 2 }sdsds  \n  
[[[[[[{}, {"a":23}]]]]]] {"a": 
{ "b":{ "c": {}}}}  dsdsds[ {"a": 2323 }]
sadsdaasdasdwee{ "data": [ { "a": 1, "b": 2 }, 
{ "a": 3, "b": 4 } ]}
`

const jsonObjects = findJsonObjects( { str } )
console.log( JSON.stringify( jsonObjects ) )