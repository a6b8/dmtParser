import { Inscription } from './parse/Inscription.mjs'
import { DigitalMatter } from './parse/DigitalMatter.mjs'

import { config } from './data/config.mjs'


class Ordinal {
    #inscription
    #digitalMatter


    constructor() {
        this.#inscription = new Inscription()
        this.#digitalMatter = new DigitalMatter()

        return true
    }


    async parseTransaction( { hex, block_time, id, filter='dmt' } ) {
        if( hex.startsWith( '0x' ) ) { 
            hex = hex.slice( 2 ) 
        }

        const { isEnvelope, includeJSON } = this.#inscription.getStatus( { hex } )
        let results = []
        switch( filter ) {
            case 'dmt': 
                if( isEnvelope === true && includeJSON === true ) {
                    const jsons = this.#inscription.getJSONs( { hex } )
                    results = await this.#digitalMatter.getValidDmts( { jsons, block_time, id } )
                }
                break
            default:
                break
        }

        return results
    }
}


export { Ordinal }