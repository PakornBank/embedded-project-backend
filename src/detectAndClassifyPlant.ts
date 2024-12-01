import axios from "axios";
import fs from "fs/promises";

export async function detectAndClassifyPlant(imagePath: string) {
	const image = await fs.readFile(imagePath, {
		encoding: "base64",
	});

	axios({
		method: "POST",
		url: process.env.ROBOFLOW_API_URL,
		params: {
			api_key: process.env.ROBOFLOW_API_KEY,
		},
		data: image,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
	})
		.then(function (response) {
			console.log(response.data);
			return response.data;
		})
		.catch(function (error) {
			console.log(error.message);
			return error;
		});
}
