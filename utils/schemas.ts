import * as z from "zod";
import { ZodSchema } from "zod";

function validateFile() {
  const maxUploadSize = 1024 * 1024;
  const acceptedFileTypes = ["image/"];
  return z
    .instanceof(File)
    .refine((file) => {
      return !file || file.size <= maxUploadSize;
    }, "File must be less than 1 MB")
    .refine((file) => {
      return (
        !file || acceptedFileTypes.some((type) => file.type.startsWith(type))
      );
    }, "File must be an Image");
}

export const imageSchema = z.object({
  image: validateFile(),
});

export const multipleImagesSchema = z.object({
  images: z
    .array(validateFile())
    .min(1, { message: "Please upload at least 1 image, the image must be less than 1 MB and be an image file" })
    .max(4, { message: "You can upload a maximum of 4 images" }),
});

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(", "));
  }
  return result.data;
}

export const profileSchema = z.object({
  firstName: z.string().min(2, { message: "first name must be of at least two characters" }),
  lastName: z.string().min(2, { message: "last name must be of at least two characters" }),
  username: z.string().min(2, { message: "username must be of at least two characters" }),
});

export const propertySchema = z.object({
  name: z.string().min(2, { message: "name must be at least 2 characters." }).max(100, { message: "name must be less than 100 characters." }),
  tagline: z.string().min(2, { message: "tagline must be at least 2 characters." }).max(100, { message: "tagline must be less than 100 characters." }),
  price: z.coerce.number().int().min(0, { message: "price must be a positive number." }),
  category: z.string(),
  description: z.string().refine((description) => {
    const wordCount = description.split(" ").length;
    return wordCount >= 10 && wordCount <= 1000;
  }, { message: "description must be between 10 and 1000 words." }),
  country: z.string(),
  guests: z.coerce.number().int().min(0, { message: "guest amount must be a positive number." }),
  bedrooms: z.coerce.number().int().min(0, { message: "bedrooms amount must be a positive number." }),
  beds: z.coerce.number().int().min(0, { message: "beds amount must be a positive number." }),
  baths: z.coerce.number().int().min(0, { message: "baths amount must be a positive number." }),
  amenities: z.string(),
});

export const createReviewSchema = z.object({
  propertyId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});