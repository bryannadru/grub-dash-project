const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


function list(req, res) {
  res.status(200).json({ data : orders })
}


/* order exists validation 
function orderExists(req, res, next) {
  const { orderId } = req.params
  const foundOrder = orders.find(order => order.id === Number(orderId))
  if (foundOrder) {
    res.locals.order = foundOrder
    return next()
  } next ({
    status: 404,
    message: `Order does not match route id. Order: ${order.id} Router: ${orderId}`
    // how do i get the id to put into ${id}
  })
}
*/


// missing property validation
function orderBodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body
    if (data[propertyName]) {
      return next()
    }
    next ({
      status: 400,
      message: `Order must include a ${propertyName}`
    })
  }
}


// 
function orderExists(req, res, next) {
  const { orderId } = req.params
  const foundOrder = orders.find(order => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    return next()
  } next ({
    status: 404,
    message: `Order does not match route id. Router: ${orderId}`
  })
}


// validation to check if id == orderId
function noMatch(req, res, next) {
  const { orderId } = req.params
  const { data: { id } = {} } = req.body
  if (id) {
    if (id !== orderId) {
    return next ({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route ${orderId}`
      })
    }
  }
  return next()
}



// status validation 
function statusValidation(req, res, next) {
  const { orderId } = req.params
  const { data: { status, id } = {} } = req.body
  const validStatus = ["pending", "preparing", "out-for-delivery"]
  
  if (id && id !== orderId) {
    return res.status(400).json({ error: `Order id does not match route id. Order: ${id}, Route: ${orderId}.` });
  }
  if (!status || status === "") {
    return res.status(400).json({ error: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
  }
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: "Order must have a status of pending, preparing, out-for-delivery, delivered" });
  }
  next()
}

function isDishesValid(req, res, next) {
  const { data: { dishes } = {} } = req.body
  if (Array.isArray(dishes) && dishes.length > 0) {
    return next()
  }
  next({
    status: 400, 
    message: 'Order must include at least one dish'
  })
}


function hasValidQuantity(req, res, next) {
  const { data: { dishes} = {} } = req.body
  dishes.forEach((dish, index) => {
    if (!dish.quantity || !(Number(dish.quantity) > 0) || typeof dish.quantity !== "number") {
      return next({
      status: 400,
  message: `Dish ${index} must have a quantity that is an integer greater than 0`
    })
   }
  })
  next()
}
 


// delete validation 
function deleteValidation(req, res, next) {
  const status = res.locals.order.status;
  if (status && status === 'pending') {
    return next()
  }
  next({
    status: 400, 
    message: 'An order cannot be deleted unless it is pending.'
  })
}

/* function orderStatus(req, res, next) {
  const { data: { status } = {} } = req.body
  
  if (!status || status === 'delivered') 
 */

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res, next) {
  
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
    const order = res.locals.order
    
    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.dishes = dishes
    
    res.json({ data: order }) 
}


function create(req, res, next) {
  
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body
  
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes
    // how do i do this part : 
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

function destroy (req, res, next) {
  const { orderId } = req.params
  const index = orders.findIndex(order => order.id === Number(orderId ))
  const deleteOrders = orders.splice(index, 1)
  res.sendStatus(204)
}


module.exports = {
  list, 
  read: [orderExists, read],
  create: [
    orderBodyDataHas('deliverTo'),
    orderBodyDataHas('mobileNumber'),
    orderBodyDataHas('dishes'),  
    isDishesValid,
    hasValidQuantity,
    create
  ],
  update: [
    orderBodyDataHas('deliverTo'),
    orderBodyDataHas('mobileNumber'),
    orderBodyDataHas('dishes'), 
    orderExists,
    isDishesValid,
    hasValidQuantity,
    statusValidation,
    noMatch,
    update
  ], 
  destroy: [orderExists, deleteValidation, destroy]
}







