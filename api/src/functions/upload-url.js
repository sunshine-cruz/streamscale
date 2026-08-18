import { app } from "@azure/functions";
import {
  BlobServiceClient,
  BlobSASPermissions
} from "@azure/storage-blob";
import { randomUUID } from "node:crypto";

const allowedTypes = ["video/mp4", "video/webm"];
const maximumSize = 250 * 1024 * 1024;

app.http("upload-url", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "upload-url",

  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { fileName, contentType, fileSize } = body;

      if (!fileName || !contentType || !fileSize) {
        return {
          status: 400,
          jsonBody: {
            error: "fileName, contentType and fileSize are required."
          }
        };
      }

      if (!allowedTypes.includes(contentType)) {
        return {
          status: 400,
          jsonBody: {
            error: "Only MP4 and WebM files are allowed."
          }
        };
      }

      if (fileSize > maximumSize) {
        return {
          status: 400,
          jsonBody: {
            error: "Maximum file size is 250 MB."
          }
        };
      }

      const connectionString =
        process.env.VIDEO_STORAGE_CONNECTION_STRING;

      const containerName =
        process.env.VIDEO_CONTAINER || "videos";

      if (!connectionString) {
        throw new Error(
          "VIDEO_STORAGE_CONNECTION_STRING is missing."
        );
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      await containerClient.createIfNotExists();

      const safeName = fileName
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase();

      const blobName =
        `${new Date().toISOString().slice(0, 10)}/` +
        `${randomUUID()}-${safeName}`;

      const blobClient =
        containerClient.getBlockBlobClient(blobName);

      const startsOn =
        new Date(Date.now() - 5 * 60 * 1000);

      const expiresOn =
        new Date(Date.now() + 15 * 60 * 1000);

      const uploadUrl =
        await blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse("cw"),
          startsOn,
          expiresOn,
          contentType
        });

      context.log(`Upload authorised: ${blobName}`);

      return {
        status: 200,
        jsonBody: {
          uploadUrl,
          blobUrl: blobClient.url,
          blobName,
          expiresAt: expiresOn.toISOString()
        }
      };
    } catch (error) {
      context.error("Upload URL error", error);

      return {
        status: 500,
        jsonBody: {
          error: "Upload authorisation could not be generated."
        }
      };
    }
  }
});