import Elysia from "elysia";
import { t } from "elysia";
import { authMiddleware } from "@/shared/infrastructure/auth/auth.middleware";
import { uploadMenuItemPhoto, deleteMenuItemPhoto } from "@/shared/s3";
import { MenuPhotoRepository } from "./menu-photo.repository";
import { createId } from "@paralleldrive/cuid2";

export const MenuPhotoController = new Elysia({ prefix: "/menu/items" })
  .use(authMiddleware)
  .post(
    "/:id/photos",
    async ({ params, body, set, validateSession }) => {
      try {
        const user = await validateSession();
        if (!user || user.role !== "admin") {
          set.status = 403;
          return {
            status: "error",
            message: "Only admin users can upload menu item photos.",
          };
        }
        const { file, contentType, ext } = body;
        if (!file || !contentType || !ext) {
          set.status = 400;
          return {
            status: "error",
            message: "Missing file, contentType, or ext.",
          };
        }
        const menuItemId = params.id;
        const id = createId();
        const { publicUrl, presignedUrl } = await uploadMenuItemPhoto(
          menuItemId,
          id,
          file,
          contentType,
          ext
        );
        await MenuPhotoRepository.create({ id, menuItemId, ext });
        return {
          status: "success",
          data: {
            id,
            menuItemId,
            ext,
            publicUrl,
            presignedUrl,
          },
        };
      } catch (e: any) {
        set.status = 400;
        return {
          status: "error",
          message: e.message || "Failed to upload menu item photo.",
        };
      }
    },
    {
      body: t.Object({
        file: t.Any(), // Should be Buffer, handled by multipart middleware
        contentType: t.String(),
        ext: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Any(),
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        403: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Item Photos"],
        summary: "Upload de fotos (S3)",
        description:
          "Upload de fotos para um item do menu. Apenas administradores podem acessar (admin only).",
      },
    }
  )
  .delete(
    "/:id/photos/:photoId",
    async ({ params, set, validateSession }) => {
      try {
        const user = await validateSession();
        if (!user || user.role !== "admin") {
          set.status = 403;
          return {
            status: "error",
            message: "Only admin users can delete menu item photos.",
          };
        }
        const { id: menuItemId, photoId } = params;
        const photo = await MenuPhotoRepository.getById(photoId);
        if (!photo) {
          set.status = 404;
          return {
            status: "error",
            message: "Photo not found.",
          };
        }
        await deleteMenuItemPhoto(menuItemId, photoId, photo.ext);
        await MenuPhotoRepository.delete(photoId);
        return {
          status: "success",
          data: { id: photoId },
        };
      } catch (e: any) {
        set.status = 400;
        return {
          status: "error",
          message: e.message || "Failed to delete menu item photo.",
        };
      }
    },
    {
      response: {
        200: t.Object({
          status: t.String(),
          data: t.Any(),
        }),
        400: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        403: t.Object({
          status: t.String(),
          message: t.String(),
        }),
        404: t.Object({
          status: t.String(),
          message: t.String(),
        }),
      },
      detail: {
        tags: ["Menu Item Photos"],
        summary: "Remover foto",
        description:
          "Remove uma foto de um item do menu. Apenas administradores podem acessar (admin only).",
      },
    }
  );
