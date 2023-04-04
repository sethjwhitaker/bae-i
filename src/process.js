import promptSync from 'prompt-sync'
import chalk from 'chalk'
import fs from 'fs'
import concepts from './concepts.js'


const prompt = promptSync()

// thjis is supposed to be essentially, the medula oblongata

const main = () => {
  let alive = true
  let response = 'hello'
  while (alive) {
    console.log(chalk.magenta(response))
    const input = prompt('> ')
    if (input === 'bye') {
      alive = false
    }

    let parentConcept = null
    let conceptList = [] // Essentially just grouping the charcaters in the string together

    let prevConcept = null
    let index = 0 // I think this should be tied to the most recent char rather than the distance from the start of the string

    for (const c of input) {
      const concept = concepts.searchByData(c)

      console.log('Found a concept:')
      console.log(concept)
      if (parentConcept) {
        console.log('Predicted Concept')
        console.log(parentConcept)
        const predicted = concepts.getConcept(parentConcept.child[index])
        console.log(predicted)
        if (predicted.id === concept.id) console.log('POG!! It was RIGHT!')
        if (predicted.id !== concept.id) console.log('The predicted concept didnt match the actual concept. We should probably do something in this case.') // Such as increase focus (not implemented lmao)
      } 
      concepts.updateSimpleRelationship(prevConcept, concept)

      conceptList.push(concept)

      parentConcept = concepts.searchByChildConcepts(conceptList)

      prevConcept = concept
      index++
    }

    console.log('Parent')
    if (!parentConcept) console.log(concepts.createParentConcept(conceptList))
    else concepts.updateParentRelationship(parentConcept)
    console.log(parentConcept)
  }
  fs.writeFileSync('concepts.json', JSON.stringify(concepts.getConcepts(), null, 2))
}

export default {
  main: main
}