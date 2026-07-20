import { Schema, model, models } from "mongoose";

const PhotoSchema = new Schema(
  {
    galleryId: {
      type: Schema.Types.ObjectId,
      ref: "Gallery",
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    width: {
      type: Number,
      required: true,
    },

    height: {
      type: Number,
      required: true,
    },

    bytes: {
      type: Number,
      required: true,
    },

    format: {
      type: String,
      required: true,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PhotoSchema.index({
  galleryId: 1,
  createdAt: -1,
});

const Photo = models.Photo || model("Photo", PhotoSchema);

export default Photo;