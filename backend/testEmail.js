const nodemailer = require('nodemailer');

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

// Call the function to send a test email
sendTestEmail();
