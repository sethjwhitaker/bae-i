import concepts from './concepts.js'

/* 
algorithms in this context are just meant as concepts that do a thing
sometimes the algorithm does nothing

maybe an operation is just transforming an input to an output (translate one concept to another)

when generating an algorithm, we probably need to keep track of the things that didn't work somehow
maybe we should remember everything that we try (only for a limited amount of time, but we can address forgetting stuff later)
*/

/* basically type definitions

const workingMemoryReference = {
  id: '',
  type: 'workmemref',
  data: '' // slot number 0 guess 
}

const loadInstruction = {
  id: '',
  type: 'loadworkmem',
  memoryRef: '' // working memory reference id
}

const orderConcept = {
  id: '',
  first: '',
  second: ''
}

const ifConcept = {
  id: '',
  condition: '',
  ifTrue: '',
  ifFalse: ''
}

const conditionConcept = {
  comparison: '',
  left: '',
  right: '',
  result: true/false
}
*/

const atomicOperationConceptIDs = {
  loadworkmem: [],
  outworkmem: []
}
const algorithmIDs = []

const workMemRefs = [
  null, null, null, null, null, null, null, null, null, null
]

const createWorkMemRefConcept = (memorySlot) => {
  return concepts.createConcept({ value: memorySlot, type: 'workmemref' })
}

const getWorkMemRef = (memorySlot) => {
  if (memorySlot > 9) return null

  if (!workMemRefs[memorySlot]) {
    workMemRefs[memorySlot] = createWorkMemRefConcept(memorySlot)
  }

  return workMemRefs[memorySlot]
}

const getAtomicOpID = (type, value, createIfNotExist) => {
  let id = atomicOperationConceptIDs[type].find(cID => concepts.getConcept(cID).data === value)
  if (!id) {
    id = concepts.createConcept({ value: getWorkMemRef(0).id, type: 'loadworkmem' }).id
    atomicOperationConceptIDs[type].push(id)
  }
  return id
}

// Not really sure what to do here yet, but I know I want to start by outputting the input, 
// then listen for feedback (a good job / bad job button) and if it is bad job, trying something else 
// (but make sure only to tag the relationship between the input and the algorithm as bad if it is "bad job")
// When trying something else, how should we decide what to try next? 
const generateAlgorithm = (input) => {

  /*
    this is the core of the problem I guess
    if we try to iterate over every possible algorithm, we probably wont find one that works in a reasonable amount of time
    i want to try some way that follows paths through concepts and sub algorithms to prioritize using patterns that have already been observed/used
    this is why the observation part is so important
    
    i think the generation should start by searching within close proximity of the input concept, recently used algorithms, and historically useful algorithms
    but if it cant find anything it should just pseudo 'give up' and simply map the specific input to the output
  */

  // need to check existing algorithms first before creating a new one
  // start with most recently used?
  const loadIntoMemory = getAtomicOpID('loadworkmem', 0, true)

  const outputFromMemory = getAtomicOpID('outworkmem', 0, true)

  const steps = [
    loadIntoMemory,
    outputFromMemory
  ]

  const newAlg = concepts.createParentConcept(steps.map(step => concepts.getConcept(step)), 'algorithm')

  const inputConcept = concepts.getConcept(input)
  if (!inputConcept.algorithm) inputConcept.algorithm = []
  inputConcept.algorithm.push(newAlg.id)
  algorithmIDs.push(newAlg.id)
  return newAlg.id
}

const findAlgorithm = (input) => {
  const concept = concepts.getConcept(input)
  
  if (concept.algorithm) return concept.algorithm

  /*
    find an algorithm given an input
    get the concept
    check if the concept already has algorithms associated with it
      if the association between concept and alg is < 1, move on to the next
      if an alg is found with ass > 1 return it
    if no suitable algs are found 
      check through recently used algs (some better method of search would be nice, but cant think of anything right now)
    if all recently used algs have been checked
      generate a new alg

    thats all this function should do, but there should be some process that evaluates the suitability of the associated alg
    and adjusts the ass strength accordingly
  */


  // need to check existing algorithms first before creating a new one

  algorithmIDs.sort((a, b) => concepts.getConcept(a).lastUsed - concepts.getConcept(b).lastUsed)
  
  return generateAlgorithm(input)
}

export default {
  generateAlgorithm: generateAlgorithm,
  findAlgorithm: findAlgorithm
}