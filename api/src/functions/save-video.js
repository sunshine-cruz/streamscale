import { app } from "@azure/functions";
import { TableClient } from "@azure/data-tables";
import { randomUUID } from "node:crypto";

app.http("save-video", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "videos",
  handler: async (request, context) => {
    try {
      const body = await request.json();

      const {
        blobName,
        title,
        publisher,
        producer,
        genre,
        ageRating,
        description = ""
      } = body;

      if (
        !blobName ||
        !title ||
        !publisher ||
        !producer ||
        !genre ||
        !ageRating
      ) {
        return {
          status: 400,
          jsonBody: {
            error: "All required video metadata must be provided."
          }
        };
      }

      const connectionString =
        process.env.VIDEO_STORAGE_CONNECTION_STRING;

      if (!connectionString) {
        throw new Error(
          "VIDEO_STORAGE_CONNECTION_STRING is not configured."
        );
      }

      const tableClient = TableClient.fromConnectionString(
        connectionString,
        "VideoMetadata"
      );

      const id = randomUUID();

      const entity = {
        partitionKey: "video",
        rowKey: id,
        blobName,
        title,
        publisher,
        producer,
        genre,
        ageRating: String(ageRating),
        description,
        uploadedAt: new Date().toISOString()
      };

      await tableClient.createEntity(entity);

      return {
        status: 201,
        jsonBody: {
          message: "Video metadata saved successfully.",
          id
        }
      };
    } catch (error) {
      context.error("Unable to save video metadata:", error);

      return {
        status: 500,
        jsonBody: {
          error: "Unable to save video metadata."
        }
      };
    }
  }
});