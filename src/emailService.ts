import nodemailer from "nodemailer";
import { db, storage } from "./firebase";
import { convertRGB565ToJpeg } from "./utils/rgb565ToJpeg";
import fs from "fs/promises";
import { detectAndClassifyPlant } from "./detectAndClassifyPlant";

interface SensorData {
	capture: number;
	gas: number;
	humidity: number;
	light: number;
	soilMoisture: number;
	temperature: number;
	waterPump: number;
}

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Fetch sensor data
export const fetchSensorData = async (): Promise<SensorData> => {
	const snapshot = await db.ref("/esp32").once("value");
	return snapshot.val();
};

// Download and convert the RGB565 image
export const downloadAndConvertImage = async (
	storagePath: string,
	width: number,
	height: number
): Promise<string> => {
	const bucket = storage.bucket();
	const rawFilePath = "./tempImage.raw";

	// Download .raw image
	const file = bucket.file(storagePath);
	await file.download({ destination: rawFilePath });
	console.log(`Downloaded RGB565 .raw image to ${rawFilePath}`);

	// Convert RGB565 to JPEG
	const jpegFilePath = await convertRGB565ToJpeg(rawFilePath, width, height);

	// Clean up raw file
	await fs.unlink(rawFilePath);

	return jpegFilePath;
};

// Send email with sensor data and image
export const sendSensorDataEmail = async (
	sensorData: SensorData,
	imagePath: string
): Promise<void> => {
	const { top } = await detectAndClassifyPlant(imagePath);
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: "pakorn22120@gmail.com",
		subject: "ESP32 Daily Report",
		html: `
      <h1>ESP32 Sensor Data Report</h1>
      <ul>
        <li><strong>Plant health:</strong> ${top}</li>
        <li><strong>Temperature:</strong> ${sensorData.temperature} °C</li>
        <li><strong>Humidity:</strong> ${sensorData.humidity} %</li>
        <li><strong>Light:</strong> ${sensorData.light} lux</li>
        <li><strong>Soil Moisture:</strong> ${sensorData.soilMoisture}</li>
        <li><strong>Gas:</strong> ${sensorData.gas} ppm</li>
        <li><strong>Water Pump:</strong> ${
					sensorData.waterPump ? "ON" : "OFF"
				}</li>
      </ul>
      <p>Generated at: ${new Date().toLocaleString()}</p>
    `,
		attachments: [
			{
				filename: "sensor-image.jpg",
				path: imagePath,
			},
		],
	};

	await transporter.sendMail(mailOptions);
	console.log("Email sent successfully with sensor data and image");

	// Clean up JPEG file
	await fs.unlink(imagePath);
};
