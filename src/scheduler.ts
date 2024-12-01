import {
	fetchSensorData,
	sendSensorDataEmail,
	downloadAndConvertImage,
} from "./emailService";

export const scheduleSensorDataEmail = () => {
	const now = new Date();
	const next8am = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		8,
		0,
		0
	);

	if (now > next8am) {
		next8am.setDate(next8am.getDate() + 1);
	}

	const delay = next8am.getTime() - now.getTime();

	setTimeout(() => {
		setInterval(async () => {
			console.log("Running 8 AM sensor data email task");
			try {
				const sensorData = await fetchSensorData();
				const imagePath = await downloadAndConvertImage(
					"uploads/photo.raw",
					640,
					480
				);
				await sendSensorDataEmail(sensorData, imagePath);
			} catch (error) {
				console.error("Error sending scheduled sensor data email:", error);
			}
		}, 24 * 60 * 60 * 1000); // Run daily
	}, delay);

	console.log("Scheduled 8 AM task for:", next8am);
};
