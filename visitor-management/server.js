/*const express = require('express');
const mysql = require('mysql2');

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', // Update with your actual MySQL root password
    database: 'visitor'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});



app.post('/api/visitors', (req, res) => {


    const visitor = req.body;
    console.log(visitor.purposeRemark)

    // console.log(JSON.stringify(visitor.otherRemark))
    //console.log(visitor)
    // console.log(JSON.stringify(visitor))

    const sql = 'INSERT INTO visitors (name, licNo, mobile, meetTo, department, purposeremark, purposegroup, timein, timeout, otherremark, visitCard, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [visitor.name, visitor.licNo, visitor.mobile, visitor.meetTo, visitor.department, visitor.purposeRemark, visitor.purposeGroup, visitor.timeIn, visitor.timeOut, visitor.otherRemark, visitor.visaCard, visitor.photo],
        (err, result) => {
            if (err) {
                console.error('Error inserting visitor:', err);
                res.status(500).send('Error inserting visitor');
                return;
            }
            res.status(201).send({ "message": "visitor added" });
        });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});*/


const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use('/assets/photo', express.static(path.join(__dirname, 'src/assets/photo')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin', // Update with your actual MySQL root password
    database: 'visitor'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});




// Create the directory if it doesn't exist
const photoDir = path.join('C:\\Form\\myApp\\src\\assets\\photo');
if (!fs.existsSync(photoDir)) {
    fs.mkdirSync(photoDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, photoDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/api/visitors/upload', upload.single('photo'), (req, res) => {
    try {
        const imagePath = `assets/photo/${req.file.filename}`;
        res.json({ imagePath });
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(400).send('Error uploading image');
    }
});

// Fetch all visitors with pagination
app.get('/api/visitors', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;

    const query = 'SELECT SQL_CALC_FOUND_ROWS * FROM visitors LIMIT ? OFFSET ?';
    const countQuery = 'SELECT FOUND_ROWS() as total';

    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.error('Error fetching visitors:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }

        db.query(countQuery, (err, countResult) => {
            if (err) {
                console.error('Error fetching total count:', err.message);
                res.status(500).json({ message: 'Internal Server Error' });
                return;
            }

            const total = countResult[0].total;
            res.json({ visitors: results, total });
        });
    });
});

////
app.get('/api/allvisitors', (req, res) => {
    var deptName = "";
    var startDate = "";
    var endDate = "";

    var query = 'SELECT SQL_CALC_FOUND_ROWS * FROM visitors';
    // if (deptName != null) {

    //     query = query + "where department=" + deptName;
    // }
    // // Add if conditopn for startate
    // if (startDate != null && endDate != null) {

    //     query = query + "and timein between " + startDate + " and " + endDate;
    // }

    console.log(query);

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching visitors:', err.message);
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
        console.log(JSON.stringify(results))
        res.json({ visitors: results });
        // db.query(countQuery, (err, countResult) => {
        //     if (err) {
        //         console.error('Error fetching all visitors:', err.message);
        //         res.status(500).json({ message: 'Internal Server Error' });
        //         return;
        //     }

        //     console.log(JSON.stringify(results))
        //     res.json({ visitors: results });
        // });
    });
});



// Search visitors by date range
app.get('/api/visitors/byDateRange', (req, res) => {
    const { startDate, endDate } = req.query;

    // Check if both startDate and endDate are provided
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate' });
    }

    // SQL query to fetch visitors within the date range
    const sql = `
        SELECT * FROM visitors
        WHERE timeIn BETWEEN ? AND ?
        AND timeOut BETWEEN ? AND ?
    `;

    db.query(sql, [startDate, endDate, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching visitors by date range:', err);
            return res.status(500).json({ error: 'An error occurred while fetching visitors by date range.' });
        }

        res.json({ visitors: results });
    });
});


// Search visitors based on query
app.get('/api/visitors/search', (req, res) => {
    const query = req.query.q
    const sql = 'SELECT * FROM visitors WHERE name LIKE ? OR licNo LIKE ? OR mobile LIKE ? OR meetTo LIKE ? OR department LIKE ? OR purposeremark LIKE ? OR purposegroup LIKE ?';
    const values = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error searching visitors:', err);
            res.status(500).json({ error: 'An error occurred while searching visitors.' });
        } else {
            results.forEach(data => {
                if (data.photo) {
                    data.photo = `${data.photo}`;
                    console.log('Photo path:', data.photo);
                }
            });
            res.json(results);
        }
    });
});

// Fetch a single visitor by ID
app.get('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM visitors WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching visitor:', err);
            res.status(500).json({ error: 'An error occurred while fetching the visitor.' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Visitor not found.' });
        } else {
            const visitor = results[0];
            if (visitor.photo) {
                visitor.photo = Buffer.from(visitor.photo).toString('base64');
            }
            res.json(visitor);
        }
    });
});
// add new visitorr
app.post('/api/visitors', (req, res) => {
    const visitor = req.body;
    const photoPath = req.body.photo; // Assuming 'photo' contains the path

    const sql = 'INSERT INTO visitors (name, licNo, mobile, meetTo, department, purposeremark, purposegroup, timein, timeout, otherremark, visitCard, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [
        visitor.name,
        visitor.licNo,
        visitor.mobile,
        visitor.meetTo,
        visitor.department,
        visitor.purposeRemark,
        visitor.purposeGroup,
        visitor.timeIn,
        visitor.timeOut,
        visitor.otherRemark,
        visitor.visitCard,
        photoPath // Use photo path instead of photo buffer
    ], (err, result) => {
        if (err) {
            console.error('Error adding visitor:', err);
            res.status(500).send('Error adding visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor added' });
    });
});

// Update a visitor by ID
app.put('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const visitor = req.body;
    let photoBuffer = null;
    if (visitor.photo) {
        const base64Data = visitor.photo.replace(/^data:image\/\w+;base64,/, "");
        photoBuffer = Buffer.from(base64Data, 'base64');
    }

    const sql = 'UPDATE visitors SET name = ?, licNo = ?, mobile = ?, meetTo = ?, department = ?, purposeremark = ?, purposegroup = ?, timein = ?, timeout = ?, otherremark = ?, visitCard = ?, photo = ? WHERE id = ?';

    db.query(sql, [
        visitor.name,
        visitor.licNo,
        visitor.mobile,
        visitor.meetTo,
        visitor.department,
        visitor.purposeRemark,
        visitor.purposeGroup,
        visitor.timeIn,
        visitor.timeOut,
        visitor.otherRemark,
        visitor.visitCard,
        photoBuffer,
        id
    ], (err, result) => {
        if (err) {
            console.error('Error updating visitor:', err);
            res.status(500).send('Error updating visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor updated' });
    });
});

// Delete a visitor by ID
app.delete('/api/visitors/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM visitors WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting visitor:', err);
            res.status(500).send('Error deleting visitor');
            return;
        }
        res.status(200).send({ message: 'Visitor deleted' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});