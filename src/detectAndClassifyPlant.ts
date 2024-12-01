import axios from "axios";
import fs from "fs/promises";

// Define the Prediction type for individual predictions
export interface Prediction {
	class: string; // The class label (e.g., 'sick', 'healthy')
	class_id: number; // The numeric ID of the class
	confidence: number; // Confidence score for the prediction
}

// Define the main InferenceResponse type
export interface InferenceResponse {
	inference_id: string; // Unique ID for the inference
	time: number; // Time taken for inference in seconds
	image: {
		width: number; // Width of the image
		height: number; // Height of the image
	};
	predictions: Prediction[]; // Array of predictions
	top: string; // The top predicted class
	confidence: number; // Confidence score of the top prediction
}

export const detectAndClassifyPlant = async (
	imagePath: string
): Promise<InferenceResponse> => {
	try {
		// Read the image and encode it to Base64
		const image = await fs.readFile(imagePath, {
			encoding: "base64",
		});

		// Make the API request
		const response = await axios({
			method: "POST",
			url: process.env.ROBOFLOW_API_URL,
			params: {
				api_key: process.env.ROBOFLOW_API_KEY,
			},
			data: image, // Use the image as the raw data
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		// Return the response data
		return response.data as InferenceResponse;
	} catch (error: any) {
		console.error(
			"Error during plant detection and classification:",
			error.message
		);
		throw new Error(error.response?.data?.message || error.message);
	}
};
