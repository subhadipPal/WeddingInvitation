import { customAlphabet } from 'nanoid'

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 8)

export function generateToken(): string {
  return nanoid()
}
