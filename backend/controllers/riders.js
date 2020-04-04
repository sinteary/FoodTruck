const db = require('../db')

// @desc    Create new rider
// @route   POST /riders
// @acess   Public
exports.createRider = async (req, response) => {
  const { email, name, isFT } = req.body
  const checkRiderEmailQuery = `SELECT * FROM Users WHERE email = ${email}`
  var riderType = isFT ? 'FTRiders' : 'PTRiders'

  const createRiderQuery =
    `BEGIN;
    SET CONSTRAINTS ALL DEFERRED;
    INSERT INTO Users (email, name)
    VALUES(${email},${name});
    
    INSERT INTO Riders (id, bsalary)
    VALUES((SELECT currval('users_id_seq')), 1000);

    INSERT INTO ${riderType} (id)
    VALUES((SELECT currval('users_id_seq')));

    COMMIT;`

  const rows = await db.query(checkRiderEmailQuery, async (err, result) => {
    console.log("Checking if email exists:", result.rows)
    if (err) {
      console.log("Error:", err.stack)
      response.status(500).json({ success: false, msg: 'Failed to create rider account - email check.' })
    } else {
      if (result.rows.length !== 0) {
        //If email already exists in customers table
        response.status(400).json({ success: false, msg: 'This email is already registered.' })
      } else {
        db.query(createRiderQuery, async (err2, result2) => {
          if (err2) {
            console.log("Error creating rider", err2.stack)
            response.status(500).json({ success: false, msg: 'Failed to create rider account.' })
          } else {
            console.log("New ID:", "user: ", result2[2].rows.id, "rider", result2[3].rows.id)
            if (result2[2].rows.id == result2[3].rows.id)
              response.status(200).json({ success: true, msg: "Created user/rider with id " })
            else {
              response.status(404).json({ success: false, msg: `Failed to create rider.` })
            }
          }
        })
      }
    }
  })
}


exports.viewAssignedOrders = async (req, response) => {
  const { email, name, isFT } = req.body;

  const getOrdersQuery = ``


}


exports.acceptOrder = async (req, response) => {
  const { rid, oid, datetime } = req.body




}