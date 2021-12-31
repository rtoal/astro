export default function error(message, { line, column }) {
  throw new Error(`Line ${line}, Column ${column}: ${message}`)
}
