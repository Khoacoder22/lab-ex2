const express = require('express');
const { User, Product, ShoppingCart } = require('./database');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');

const app = express();
app.use(express.json());

// Storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Step 4: CRUD Operations for Models
// Add a record
app.post('/add', async (req, res) => {
    const { type, data } = req.body; // Example: { type: 'User', data: { name: 'John', email: 'john@example.com' } }
    const Model = { User, Product, ShoppingCart }[type];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid type' });

    const result = await Model.create(data);
    res.json({ action: 'add', status: 'success', [type]: result });
});

// Update a record
app.put('/update/:type/:id', async (req, res) => {
    const { type } = req.params;
    const Model = { User, Product, ShoppingCart }[type];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid type' });

    await Model.update(req.body, { where: { id: req.params.id } });
    res.json({ action: 'update', status: 'success', [type]: req.body });
});

// Delete a record
app.delete('/delete/:type/:id', async (req, res) => {
    const { type } = req.params;
    const Model = { User, Product, ShoppingCart }[type];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid type' });

    await Model.destroy({ where: { id: req.params.id } });
    res.json({ action: 'delete', status: 'success', [type]: { id: req.params.id } });
});

// View all records
app.get('/view/:type', async (req, res) => {
    const { type } = req.params;
    const Model = { User, Product, ShoppingCart }[type];
    if (!Model) return res.status(400).json({ status: 'error', message: 'Invalid type' });

    const data = await Model.findAll();
    res.json({ action: 'view', status: 'success', [type]: data });
});

app.post('/send-email', async (req, res) => {
    const { email, content } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lkhoa1227@gmail.com', 
            pass: 'your-password', 
        },
    });

    await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Test Email',
        text: content,
    });
    res.json({ action: 'send-email', status: 'success', email });
});


app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ action: 'upload', status: 'error', message: 'No file uploaded' });
    }
    res.json({ action: 'upload', status: 'success', path: req.file.path });
});


app.get('/images', (req, res) => {
    const fs = require('fs');
    const files = fs.readdirSync('uploads/');
    res.json({ action: 'view-images', status: 'success', images: files });
});

// Step 7: Fetch Users from External API
app.get('/fetch-users', async (req, res) => {
    try {
        // Fetch users from external API
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        
        // Map API response to the User model structure
        const users = response.data.map((user) => ({
            name: user.name,
            email: user.email,
        }));

        // Save users to the database
        await User.bulkCreate(users);

        res.json({
            action: 'fetch-users',
            status: 'success',
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({
            action: 'fetch-users',
            status: 'error',
            message: error.message,
        });
    }
});
// Start server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
