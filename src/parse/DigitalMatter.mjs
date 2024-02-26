import moment from 'moment'


class DigitalMatter {
    constructor() {}


    getValidDmts( { jsons, block_time, id } ) {
        const results = jsons
            .filter( ( json, index ) => {
                const stateGeneral = this.#getStateGeneral( { json } )
                const state = this.#getStateByOperation( { json, stateGeneral } )
                return state['allRequiredKeys']
            } )
            .map( json => {
                let result = { ...json }

                switch( json['op'] ) {
                    case 'dmt-deploy':
                        const { urls, date } = this.#addDeployKeys( { json, block_time, id } )
                        result = { 'content': { ...result }, urls, date }
                        break
                    case 'dmt-mint':
                        break
                    case 'dmt-transfer':
                        break
                }


                return result
            } )

        return results
    }


    #addDeployKeys( { json, block_time, id } ) {
        const struct = {
            'date': {
                'hours': null,
                'format': null
            },
            'urls': {
                'elem': null,
                'inscription': null,
            }
        }

        struct['date']['hours'] = moment()
            .utc()
            .diff( 
                moment.utc( block_time, 'YYYY-MM-DD HH:mm:ss.SSS Z' ), 
                'hours' 
            )
        struct['date']['format'] = block_time

        struct['urls']['elem'] = `https://ordinals.com/inscription/${json['elem']}`
        struct['urls']['inscription'] = `https://ordinals.com/inscription/${id.slice( 2 )}i0`

        if( Object.hasOwn( json, 'prj' ) ) {
            struct['urls']['project'] = `https://ordinals.com/project/${json['prj']}`
        }

        return struct
    }


    #getStateByOperation( { json, stateGeneral } ) {
        const state = {
            ...stateGeneral,
            'allRequiredKeys': false
        }

        if( !stateGeneral['overall'] ) {
            return state
        }

        const keys = Object.keys( json )
        switch( json['op'] ) {
            case 'dmt-deploy': 
                state['allRequiredKeys'] = [ 'elem', 'tick' ]
                    .map( key => keys.includes( key ) )
                    .every( a => a )
                break
            case 'dmt-mint':
                state['allRequiredKeys'] = [ 'dep', 'tick', 'blk' ]
                    .map( key => keys.includes( key ) )
                    .every( a => a )
                break
            case 'dmt-transfer':
                state['allRequiredKeys'] = [ 'tick', 'amt' ]
                    .map( key => keys.includes( key ) )
                    .every( a => a )
                break
        }

        return state
    }


    #getStateGeneral( { json } ) {
        const state = {
            'hasMinimalKey': false,
            'isTap': false,
            'knownOperator': false,
            'overall': false
        }

        state['hasMinimalKey'] = [ 'p', 'op' ]
            .map( key => Object.keys( json ).includes( key ) )
            .every( a => a )

        if( state['hasMinimalKey'] ) {
            if( json['p'] === 'tap' ) {
                state['isTap'] = true
            } 

            if( ['dmt-deploy', 'dmt-mint', 'dmt-transfer' ].includes( json['op'] ) ) {
                state['knownOperator'] = true
            }
        }

        state['overall'] = [ 'hasMinimalKey', 'isTap', 'knownOperator' ] 
            .map( key => state[ key ] )
            .every( a => a )

        return state
    }
}

export { DigitalMatter }