import { cloudinary } from "../config/cloudinary.js";

export const uploadFileToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "cloudinary-upload", resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    mediaType: result.format.includes("gif") ? "gif" : "image",
                });
            }
        );
        stream.end(fileBuffer);
    });
};