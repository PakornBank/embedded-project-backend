import sharp from "sharp";
import fs from "fs/promises";

// Decode RGB565 to RGB888
const decodeRGB565 = (
	buffer: Buffer,
	width: number,
	height: number
): Buffer => {
	const outputBuffer = Buffer.alloc(width * height * 3); // RGB888 has 3 channels

	for (let i = 0, j = 0; i < buffer.length; i += 2, j += 3) {
		// Swap bytes for little-endian RGB565 data
		const VH = buffer[i + 1]; // High byte (was Low byte)
		const VL = buffer[i]; // Low byte (was High byte)

		// Extract RGB components
		const b = ((VH & 0x1f) * 527 + 23) >> 6; // Blue
		const r = (((VL >> 3) & 0x1f) * 527 + 23) >> 6; // Red
		const g =
			(((((VH & 0xf0) >> 5) | ((VL & 0x0f) << 3)) & 0x3f) * 259 + 33) >> 6; // Green

		// Write RGB888 values to the output buffer
		outputBuffer[j] = r; // Red
		outputBuffer[j + 1] = g; // Green
		outputBuffer[j + 2] = b; // Blue
	}

	return outputBuffer;
};

// Convert RGB565 to JPEG
export const convertRGB565ToJpeg = async (
	inputFilePath: string,
	width: number,
	height: number
): Promise<string> => {
	const rawBuffer = await fs.readFile(inputFilePath); // Read the .raw RGB565 file
	const rgbBuffer = decodeRGB565(rawBuffer, width, height); // Decode RGB565 to RGB888

	const outputFilePath = "./tmp/outputImage.jpg";
	await sharp(rgbBuffer, { raw: { width, height, channels: 3 } }) // Create a raw image from RGB888 buffer
		.jpeg() // Convert to JPEG
		.toFile(outputFilePath);

	console.log(`Converted RGB565 to JPEG at ${outputFilePath}`);
	return outputFilePath;
};
