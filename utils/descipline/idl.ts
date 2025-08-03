import { Idl } from '@coral-xyz/anchor'

// Import the JSON IDL
const idlJson = require('./idl.json')

// For Anchor v0.28.0 compatibility, we need to ensure the IDL structure is correct
// The error "Type not found: TokenAllowed" suggests the types aren't being resolved properly
export const IDL: Idl = {
  version: idlJson.version,
  name: idlJson.name,
  constants: idlJson.constants || [],
  instructions: idlJson.instructions,
  accounts: idlJson.accounts || [],
  types: idlJson.types || [],
  events: idlJson.events || [],
  errors: idlJson.errors || [],
  metadata: idlJson.metadata
}