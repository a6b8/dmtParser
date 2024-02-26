import { Ordinal } from '../src/Ordinal.mjs'
import fs from 'fs'


const tmp = fs.readFileSync( './output/query-results--3466868-1708938921--1-1.json', 'utf-8' )
const data = JSON.parse( tmp )


const item = data['data'][ 0 ]
const { hex, block_time, id } = item

const ordinal = new Ordinal()
const result = await ordinal.parseTransaction( { hex, block_time, id } ) 
console.log( result )