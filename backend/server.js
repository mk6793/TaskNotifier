const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Update database path
const db = new sqlite3.Database(path.join(__dirname, '../database/tasks.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
    }
});

// Create table if not exists
db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, taskName TEXT, deadline TEXT, email TEXT, emailSent INTEGER DEFAULT 0)', (err) => {
    if (err) {
        console.error('Error creating tasks table: ' + err.message);
    } else {
        console.log('Tasks table checked/created successfully.');
    }
});

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mk6793@srmist.edu.in', // Change to your email
        pass: 'Zen2905@!' // Change to your password or App Password
    }
});

// Function to send a test email
function sendTestEmail() {
    const mailOptions = {
        from: 'mk6793@srmist.edu.in', // Use your email
        to: 'muthukumaranp292005@gmail.com', // Change to recipient's email
        subject: 'Test Email from Task Notifier',
        text: 'This is a test email to verify the email sending functionality.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error sending email:', error);
        }
        console.log('Test email sent:', info.response);
    });
}

// Add Task Route
app.post('/addTask', (req, res) => {
    const { taskName, deadline, email } = req.body;
    console.log('Adding task:', taskName, 'with deadline:', deadline, 'for email:', email);
    
    // Convert deadline to UTC format
    const utcDeadline = new Date(deadline).toISOString(); // Convert to UTC ISO format

    db.run(`INSERT INTO tasks (taskName, deadline, email) VALUES (?, ?, ?)`, [taskName, utcDeadline, email], function(err) {
        if (err) {
            console.error('Error adding task:', err.message);
            return res.status(500).json({ message: 'Error adding task' });
        }
        res.json({ message: 'Task added', taskId: this.lastID });
    });
});

// Get Tasks Route
app.get('/getTasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching tasks' });
        }
        res.json(rows);
    });
});

// Delete Task Route
app.delete('/deleteTask/:id', (req, res) => {
    const taskId = req.params.id;
    db.run(`DELETE FROM tasks WHERE id = ?`, taskId, function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting task' });
        }
        res.json({ message: 'Task deleted' });
    });
});

// Notify User via Email
function sendEmailReminders() {
    // Log the current server time
    const currentDateTime = new Date();
    console.log(`Current server time: ${currentDateTime.toString()}`);

    // Get current time in UTC for comparison
    const formattedDateTime = currentDateTime.toISOString(); // Use full ISO string for comparison

    console.log(`Checking for tasks due for notification at ${formattedDateTime}`);

    db.all('SELECT * FROM tasks WHERE emailSent = 0', [], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks for email:', err);
            return;
        }

        if (rows.length === 0) {
            console.log('No tasks due for notification');
            return;
        }

        rows.forEach(task => {
            const taskDeadline = new Date(task.deadline); // Convert task deadline to Date object
            if (taskDeadline <= currentDateTime) { // Compare deadlines in local time
                const mailOptions = {
                    from: 'mk6793@srmist.edu.in', // Use your email
                    to: task.email, // Send email to the user's email address
                    subject:  `⚠️ URGENT: Your Task "${task.taskName}" IS DUE SOON! 🕐`, // Attention-grabbing subject,
                    text: `⏰ Heads up! Your task "${task.taskName}" is approaching its deadline! 🗓️ Don't forget, it's due on ${new Date(task.deadline).toLocaleString()}. Let's get it done! 🚀`
// Format deadline for readability
                };

                console.log(`Sending email to ${task.email} for task "${task.taskName}"`);
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                        db.run(`UPDATE tasks SET emailSent = 1 WHERE id = ?`, [task.id], (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating emailSent status:', updateErr);
                            } else {
                                console.log(`Updated emailSent status for task ID ${task.id}`);
                            }
                        });
                    }
                });
            }
        });
    });
}


// Schedule the email notifications to run every minute
setInterval(sendEmailReminders, 60000); // Check every 60 seconds

// Call the function to send a test email (optional)
// Uncomment the next line to send a test email on server start
// sendTestEmail(); 

// Catch-all route to serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
