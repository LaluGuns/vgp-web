/**
 * VGP Subscribers - Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet named "VGP Subscribers"
 * 2. Add headers in Row 1: Timestamp | Name | Email
 * 3. Go to Extensions → Apps Script
 * 4. Delete all existing code and paste this entire file
 * 5. Click Deploy → New deployment
 * 6. Type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Click Deploy and copy the Web App URL
 * 10. Replace the URL in SubscribePopup.tsx with your Web App URL
 */

function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = JSON.parse(e.postData.contents);

        // Append new subscriber row
        sheet.appendRow([
            new Date().toISOString(),  // Timestamp
            data.name,                  // Full Name
            data.email                  // Email Address
        ]);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                message: 'Subscribed successfully!'
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Enable CORS for web requests
function doOptions(e) {
    return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT);
}
