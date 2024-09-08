const allowedChars = 'abcdefghijklmnopkrstuvwxyz1234567890'
export default function getRandomId(charNumber = 10): string {
  let randomId = ''
  while (charNumber > 0) {
    const randomIndex = Math.floor(Math.random() * allowedChars.length)
    randomId += allowedChars[randomIndex]
    charNumber--
  }

  return randomId
}
