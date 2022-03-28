const utilService = require('./util.service')
const gToys = require('../data/toy.json')
const path = 'data/toy.json'

module.exports = {
  query,
  getById,
  remove,
  save,
}

function query(filterBy = {}) {
  const toys = _filterToys(filterBy)
  return Promise.resolve(toys)
}

function getById(toyId) {
  const toy = gToys.find((toy) => toy._id === toyId)
  if (!toy) return Promise.reject('No such toy')
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = gToys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('No such toy')
  gToys.splice(idx, 1)
  return utilService.saveToFile(path, gToys)
}

function save(toyToSave) {
  if (toyToSave._id) {
    const idx = gToys.findIndex((toy) => toy._id === toyToSave._id)
    if (idx === -1) return Promise.reject('No such toy')
    gToys[idx] = toyToSave
  } else {
    toyToSave._id = utilService.makeId()
    toyToSave.createdAt = new Date()
    gToys.unshift(toyToSave)
  }
  return utilService.saveToFile(path, gToys).then(() => toyToSave)
}

function _filterToys(filterBy) {
  let filteredToys = []

  // filter by name
  const regex = new RegExp(filterBy.name, 'i')
  filteredToys = gToys.filter((toy) => regex.test(toy.name))

  // filter by inStock
  if (filterBy.inStock) {
    filteredToys = filteredToys.filter(
      (toy) => JSON.parse(toy.inStock) === JSON.parse(filterBy.inStock)
    )
  }

  // filter by labels
  if (filterBy.labels.length) {
    filteredToys = filteredToys.filter((toy) => {
      return filterBy.labels.some((label) => {
        return toy.labels.includes(label)
      })
    })
  }

  // Sorting
  if (filterBy.sortBy) {
    if (filterBy.sortBy === 'name') {
      filteredToys = filteredToys.sort((t1, t2) =>
        t1.name.toLowerCase() > t2.name.toLowerCase() ? 1 : -1
      )
    } else {
      filteredToys = filteredToys.sort((t1, t2) => t1[filterBy.sortBy] - t2[filterBy.sortBy])
    }
  }

  return filteredToys
}
