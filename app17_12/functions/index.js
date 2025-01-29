const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();

exports.createScheduledBills = functions.scheduler.onSchedule('0 0 * * *', async (event) => {
    const now = admin.firestore.Timestamp.now();
    const scheduledBillsSnapshot = await admin.firestore().collection('scheduled_bills')
        .where('scheduleDate', '<=', now)
        .where('status', '==', 'pending')
        .get();

    const batch = admin.firestore().batch();

    scheduledBillsSnapshot.forEach((doc) => {
        const billData = doc.data();
        // Create actual bill in 'bills' collection
        const billRef = admin.firestore().collection('bills').doc();
        batch.set(billRef, billData);

        // Update status of scheduled bill
        batch.update(doc.ref, { status: 'completed' });
    });

    await batch.commit();
});