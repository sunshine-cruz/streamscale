import { app } from "@azure/functions";
import { TableClient } from "@azure/data-tables";
import {
  BlobServiceClient,
  BlobSASPermissions
} from "@azure/storage-blob";

app.http("videos", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "videos",
  handler: async (request, context) => {
    try {
      const connectionString =
        process.env.VIDEO_STORAGE_CONNECTION_STRING;

      const containerName =
        process.env.VIDEO_CONTAINER || "videos";

      if (!connectionString) {
        throw new Error(
          "VIDEO_STORAGE_CONNECTION_STRING is not configured."
        );
      }

      const tableClient = TableClient.fromConnectionString(
        connectionString,
        "VideoMetadata"
      );

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);

      const containerClient =
        blobServiceClient.getContainerClient(containerName);

      const videos = [];

      const entities = tableClient.listEntities({
        queryOptions: {
          filter: "PartitionKey eq 'video'"
        }
      });

      for await (const entity of entities) {
        const blobClient =
          containerClient.getBlockBlobClient(entity.blobName);

        const videoUrl = await blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse("r"),
          expiresOn: new Date(Date.now() + 60 * 60 * 1000)
        });

        videos.push({
          id: entity.rowKey,
          title: entity.title,
          publisher: entity.publisher,
          producer: entity.producer,
          genre: entity.genre,
          ageRating: entity.ageRating,
          description: entity.description || "",
          blobName: entity.blobName,
          uploadedAt: entity.uploadedAt,
          videoUrl
        });
      }

      videos.sort(
        (a, b) =>
          new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );

      return {
        status: 200,
        jsonBody: videos
      };
    } catch (error) {
      context.error("Unable to load videos:", error);

      return {
        status: 500,
        jsonBody: {
          error: "Unable to load videos."
        }
      };
    }
  }
});