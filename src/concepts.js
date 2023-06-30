/*
{
  conceptID: {
    id: ''
    type: '',
    data: '',
    prev: [

    ]
    next: [ // should be sorted by relevance
      {
        id: ''
        lastUsed: date
        timesUsed: int
      }
    ]
    child: [

    ]
    parent: [// just ids

    ]
  }
}
*/

const conceptData = {}
let conceptCounter = 0

const getConcept = (conceptID) => {
  return conceptData[conceptID]
}

const createConcept = ({ value, type }) => {
  const id = 'concept' + conceptCounter++
  return conceptData[id] = {
    id: id,
    type: type ? type : 'simple',
    data: value,
    lastUsed: Date.now(),
    timesUsed: 1,
    prev: [],
    next: [],
    parent: [],
    child: []
  }
}

const createParentConcept = (childConcepts, type) => {
  const id = 'concept' + conceptCounter++
  conceptData[id] = {
    id: id,
    type: type ? type : 'parent',
    data: '',
    lastUsed: Date.now(),
    timesUsed: 1,
    prev: [],
    next: [],
    parent: [],
    child: childConcepts.map(c => c.id)
  }

  for (const childConcept of childConcepts) {
    childConcept.parent.push({
      id: id,
      lastUsed: Date.now(),
      timesUsed: 1
    })
  }

  return conceptData[id]
}

const updateSimpleRelationship = (conceptA, conceptB) => {
  if (!conceptA || !conceptB) return 

  // Update the forward facing rel
  const relationA = conceptA.next.find(relation => relation.id === conceptB.id)
  if (!relationA) {
    conceptA.next.push({
      id: conceptB.id,
      lastUsed: Date.now(),
      timesUsed: 1
    })
  } else {
    relationA.lastUsed = Date.now()
    relationA.timesUsed++
  }

  // Update the backward facing rel (maybe not a good idea to do that here *shrug*)
  const relationB = conceptB.prev.find(relation => relation.id === conceptA.id)
  if (!relationB) {
    conceptB.prev.push({
      id: conceptA.id,
      lastUsed: Date.now(),
      timesUsed: 1
    })
  } else {
    relationB.lastUsed = Date.now()
    relationB.timesUsed++
  }
  return {
    relationA: relationA,
    relationB: relationB
  }
}

const updateParentRelationship = (parentConcept) => {
  for (const childID of parentConcept.child) {
    const rel = conceptData[childID].parent.find(c => c.id === parentConcept.id)
    rel.lastUsed = Date.now()
    rel.timesUsed++
  }
}

const searchByData = (input) => {
  let foundConcept = null

  for (const [conceptID, concept] of Object.entries(conceptData)) {
    if (concept.data === input) foundConcept = concept
  }
  if (!foundConcept) {
    return createConcept({value: input})
  }

  foundConcept.lastUsed = Date.now()
  foundConcept.timesUsed++
  return foundConcept
}

// maybe we can return similar concepts later, but for now this will only return concepts
// that contain all childConcepts
const searchByChildConcepts = (childConcepts) => {
  let foundConcept = null

  for (const parentRel of childConcepts[0]?.parent) {
    const parent = conceptData[parentRel.id]
    let found = true
    for (let i = 1; i < childConcepts.length; i++) {
      if (i >= parent.child.length || childConcepts[i] !== parent.child[i]) {
        found = false
        break
      }
    }
    if (found) {
      foundConcept = parent
      break
    }
  }

  return foundConcept
}

export default {
  getConcepts: () => conceptData,
  getConcept: getConcept,
  createConcept: createConcept,
  createParentConcept: createParentConcept,
  updateSimpleRelationship: updateSimpleRelationship,
  updateParentRelationship: updateParentRelationship,
  searchByData: searchByData,
  searchByChildConcepts: searchByChildConcepts

}