import bitcoin from 'bitcoinjs-lib'


class Inscription {
    #config


    constructor() {
        return true
    }


    getStatus( { hex } ) {
        const status = {
            'isEnvelope': null,
            'includeJSON': null
        }

        status['isEnvelope'] = this.#isEnvelope( { hex } )
        status['includeJSON'] = this.#isJSONInscription( { hex } )

        return status
    }


    getJSONs( { hex } ) {
        const tx = bitcoin.Transaction.fromHex( hex )
        const results = tx['ins']
            .reduce( ( acc, a, index ) => {
                a['witness']
                    .forEach( ( buffer ) => {
                        const str = Buffer.from( buffer ).toString( 'ascii' )
                        const jsons = this.#findJsonObjects( { str } )
                        if( jsons.length > 0 ) { 
                            acc.push( ...jsons ) 
                        }
                    } )

                return acc
            }, [] )

        return results
    }

 
    #isEnvelope( { hex } ) {
        if( hex.includes( '0063036f726401' ) ) {
            return true
        } else {
            return false
        }
    }


    #isJSONInscription( { hex } ) {
        // '{' 7b
        // '}' 7d

        if( hex.includes( '7b' ) && hex.includes( '7d' ) ) {
            return true
        } else {
            return false
        }
    }


    #findJsonObjects( { str } ) {
        if( typeof str === undefined ) {
            console.log( `str is undefined.` )
            process.exit( 1 )
    
        } else if( typeof str !== 'string' ) {
            console.log( `str is not type of string: "${str}"` )
            process.exit( 1 )
        } 
    
        const results = str
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
                        .reduce( ( acc, json, index ) => {
                            try {
                                const result = JSON.parse( json )
                                acc.push( result )
                            } catch( e ) {}
                            return acc
                        }, [] )
                }
    
                return acc
            }, { 'balance': 0, 'jsons': [], 'chars': [], 'type': null } )
    
        return results
    }    
}


export { Inscription }