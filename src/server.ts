import express from "express";
import {
	fetchSensorData,
	sendSensorDataEmail,
	downloadAndConvertImage,
} from "./emailService";
import { scheduleSensorDataEmail } from "./scheduler";

const app = express();
const port = process.env.PORT || 3000;

app.get("/trigger-sensor-email", async (req, res) => {
	try {
		const sensorData = await fetchSensorData();
		const imagePath = await downloadAndConvertImage(
			"uploads/photo.raw",
			640,
			480
		);
		await sendSensorDataEmail(sensorData, imagePath);
		res.status(200).send("Sensor data email sent successfully");
	} catch (error) {
		console.error("Error triggering sensor data email:", error);
		res.status(500).send("Failed to send sensor data email");
	}
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
	scheduleSensorDataEmail();
});
