const db = require('../db')

// @desc    Get all orders
// @route   GET /orders
// @acess   Public
exports.getOrders = async (req, response) => {
    const rows = await db.query('SELECT * FROM orders', (err, result) => {
        if (err) {
            console.error(err.stack);
            throw err
        } else {
            if (!result.rows[0]) {
                response.status(404).json({ success: false, msg: `Failed to get all orders. There could be no order yet.` })
            } else {
                console.log('Successfully get all orders')
                response.status(200).json({ success: true, msg: result.rows })
            }
        }
    })

}

// @desc    Get single orders
// @route   GET /orders/:oid
// @acess   Public
exports.getOrder = async (req, response) => {
    const oid = req.params.oid
    const row = await db.query('SELECT * FROM orders WHERE oid = $1', [oid], (err, result) => {
        if (err) {
            console.error(err.stack)
            throw err
        } else {
            if (!result.rows[0]) {
                response.status(404).json({ success: false, msg: `Failed to get order ${id}. Order does not exist.` })
            } else {
                console.log(`Successfully get order with oid ${oid}`)
                response.status(200).json({ success: true, msg: result.rows[0] })
            }
        }
    })
}

// @desc    Create new order
// @route   POST /orders
// @acess   Private
exports.createOrder = async (req, response) => {
    const { location, dfee, odatetime, paymethod, cid, rname, foodlist, fprice } = req.body;
    const createOrderQuery = `INSERT INTO orders(location, dfee, status, fprice, odatetime, paymethod, cid, rname) 
            VALUES(${location}, ${dfee}, 0, ${fprice}, ${odatetime}, ${paymethod}, ${cid}, ${rname}) returning *`
    const rows = await db.query(createOrderQuery, (err, result) => {
        if (err) {
            console.error(err.stack)
            response.status(404).json({ success: false, msg: `Failed to create new order.` })
        } else {
            if (!result.rows) {
                response.status(404).json({ success: false, msg: `Failed to create new order.` })
            } else {
                console.log('Successfully created order')
                oid = result.rows[0].oid
                console.log('Order id = ', oid)
                for (var i = 0; i < foodlist.length; i += 1) {
                    var food = foodlist[i]
                    console.log("Food:", food)
                    db.query(`INSERT INTO Consists (oid, fname, quantity) VALUES (${oid}, ${food.fname}, ${food.qty}) returning *;`, (err, result2) => {
                        if (err) {
                            console.log("Some error occured for adding ", food.fname)
                            console.log(err.stack)
                        } else {
                            console.log("Added item:")
                            console.log(result2.rows)
                        }
                    })
                }
                response.status(200).json({ success: true, msg: oid })
            }
        }
    });
}

// @desc    Update existing order's location
// @route   PUT /orders/:oid
// @acess   Private
exports.updateOrder = async (req, response) => {
    const oid = req.params.oid
    const { location } = req.body

    // TODO: handle update of variable number of fields
    const row = await db.query('UPDATE orders SET location = $1 WHERE oid = $2 returning *', [location, oid], (err, result) => {
        if (err) {
            console.error(err.stack)
            throw err
        } else {
            if (!result.rows[0]) {
                response.status(404).json({ success: false, msg: `Failed to update order ${id}. Order does not exist.` })
            } else {
                console.log(`Successfully updated order with oid ${oid}`)
                response.status(200).json({ success: true, msg: result.rows[0] })
            }
        }
    })
}

// @desc    Delete order
// @route   DELETE /orders/:oid
// @acess   Private
exports.deleteOrder = async (req, response) => {
    const oid = req.params.oid
    const row = await db.query('DELETE FROM orders WHERE oid = $1', [oid], (err, result) => {
        if (err) {
            console.error(err.stack)
            throw err
        } else {
            // TODO: detect case and handle when nothing is deleted

            console.log(`Successfully deleted order with oid ${oid}`)
            response.status(200).json({ success: true, msg: `Successfully deleted order with oid ${oid}` })
        }
    })
}
