import fs from "node:fs";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Writable } from "node:stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string | undefined): Promise<{ secure_url: string } | null> => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      transformations: [{ quality: "70", fetch_format: "auto" }],
    });

    // File uploaded successfully
    console.log("File uploaded on Cloudinary:", response.url);
    return { secure_url: response.secure_url };
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    if (localFilePath) {
      fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
    }
    console.log(error);
    return null;
  }
};

const uploadMediaurlsOnCloudinary = async (fileUrl: string): Promise<any | null> => {
  try {
    if (!fileUrl) return null;

    // Upload the online file URL to Cloudinary
    const response = await cloudinary.uploader.upload(fileUrl, {
      resource_type: "auto", // Automatically determines the type of the file (image, video, etc.)
      transformations: [{ quality: "70", fetch_format: "auto" }],
    });

    console.log("File uploaded on Cloudinary:", response.url);
    return { secure_url: response.secure_url };
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
};

const deleteMediaByurl = async (url: string): Promise<any | null> => {
  try {
    if (!url) return null;
    const publicId = url.split("/").slice(-1)[0].split(".")[0]; // Assuming the URL ends with the filename
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", response);
    return response;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return null;
  }
};

 const createCloudinaryUploadStream = (
  options: any
): { stream: Writable; promise: Promise<UploadApiResponse> } => {
  let resolve: (val: UploadApiResponse) => void;
  let reject: (err: any) => void;

  const promise = new Promise<UploadApiResponse>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    if (!result) return reject(new Error("Upload failed"));
    resolve(result);
  });

  return { stream, promise };
};

export { uploadOnCloudinary, uploadMediaurlsOnCloudinary, deleteMediaByurl, createCloudinaryUploadStream };
