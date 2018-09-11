const fs = require('fs')
const verbose                  = process.env.VERBOSE || false
const [,,input='patterns.txt'] = process.argv

const usage = () => {
  console.log(`${input} [<filename containing patterns>]\n\tPatterns should match /^[#.]+$/\n\tIf omitted, 'patterns.txt' is assumed.`)
}

const trim = (pattern) => pattern.replace(/^\.*/g, '').replace(/\.*$/g, '')

const getNextRow = (pattern) => {
  const asArray = pattern.split('')
  return asArray.map( (current, index) => {
    const low = Math.max(0, index - 2)
    const high= index + 3
    const filledCount = asArray.slice(low, high)
      .filter( c => c === '#')
      .length
    if (current === '.') {
      return ( filledCount == 2 || filledCount == 3) ? '#' : '.'
    } else { // we also counted middle square, so add 1 to limits
      return ( filledCount == 3 || filledCount == 5) ? '#' : '.'
    }
  }).join('')
}

const analyze = (pattern) => {
  const result = {
    pattern,
    class     : false,
    evolution : [pattern]
  }
  let current = pattern
  let trimmed = trim(current)

  const fullSet   = new Set().add(current)
  const trimmedSet= new Set().add(trimmed)

  while( result.class === false && result.evolution.length < 100) {
    current = getNextRow(current)
    trimmed = trim(current)
    result.evolution.push(current)

    if (trimmed === '') {
      result.class = 'vanishing'
    } else if (fullSet.has(current)) {
      result.class = 'blinking'
    } else if (trimmedSet.has(trimmed)) {
      result.class = 'gliding'
    }
    fullSet.add(current)
    trimmedSet.add(trimmed)
  }
  result.class = result.class || 'other'
  return result
}

const main = async () => {
  try {
    const realpath = await fs.realpathSync(input)
    const patterns = await fs.readFileSync(realpath, 'utf8').split('\n').filter( p => p !== '')
    const results  = patterns.map( analyze )
    const output   = results.map( result => result.class ).join('\n')
    if (verbose) {
      console.log( results.map( result => `Pattern:\t'${result.pattern}'\nClassification:\t${result.class}\nEvolution:\n${result.evolution.join('\n')}\n` ).join('\n') )
    }

    console.log(output)
  } catch (e) {
    usage()
    process.exit(1)
  }
}

main()

