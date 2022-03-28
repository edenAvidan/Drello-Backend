const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const { ObjectId } = require('mongodb')

module.exports = {
  remove,
  query,
  getById,
  add,
  update,
}

async function query(filterBy) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('board')
    var boards = await collection.find(criteria).toArray()
    return boards //_sort(boards, filterBy);
  } catch (err) {
    logger.error('cannot find boards', err)
    throw err
  }
}

async function getById(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    const board = await collection.findOne({ _id: ObjectId(boardId) })
    return board
  } catch (err) {
    logger.error(`while finding board ${boardId}`, err)
    throw err
  }
}

async function remove(boardId) {
  try {
    const collection = await dbService.getCollection('board')
    await collection.deleteOne({ _id: ObjectId(boardId) })
    return boardId
  } catch (err) {
    logger.error(`cannot remove board ${boardId}`, err)
    throw err
  }
}

async function add(board) {
  try {
    const collection = await dbService.getCollection('board');
    board.createdAt = Date.now();
    const addedBoard = await collection.insertOne(board);
    return board;
  } catch (err) {
    logger.error('cannot insert board', err)
    throw err
  }
}

async function update(board) {
  try {
    const { _id, ...boardToSave } = board;
    boardToSave._id = ObjectId(_id);
    const collection = await dbService.getCollection('board')
    await collection.updateOne({ _id: boardToSave._id }, { $set: { ...boardToSave } })
    return boardToSave;
  } catch (err) {
    logger.error(`cannot update board ${board._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}

  // console.log(req.session?.user)
  console.log(filterBy.currUser);
  criteria.members = { $elemMatch: { _id: filterBy.currUser._id } }
  // by name
  // const regex = new RegExp(filterBy.name, 'i')
  // criteria.name = { $regex: regex }

  // // filter by inStock
  // if (filterBy.inStock) {
  //   criteria.inStock = { $eq: JSON.parse(filterBy.inStock) }
  // }

  // filter by labels
  // if (filterBy.labels?.length) {

  // }

  return criteria
}

function _sort(boards, { sortBy }) {
  switch (sortBy) {
    case 'name':
      boards.sort((t1, t2) => {
        return t1.name.toLowerCase().localeCompare(t2.name.toLowerCase());
      })
      break;
    case 'time':
      boards.sort((t1, t2) => {
        return ObjectId(t2._id).getTimestamp() - ObjectId(t1._id).getTimestamp();
      })
      break;
    case 'price':
      boards.sort((t1, t2) => t1.price - t2.price);
      break;
  }
  return boards;
}
