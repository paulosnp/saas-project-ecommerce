package com.saas.ecommerce.controller;

import com.saas.ecommerce.tenant.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
@Tag(name = "Admin - Upload", description = "Upload de imagens")
@SecurityRequirement(name = "bearerAuth")
public class ImageUploadController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping
    @Operation(summary = "Upload de imagem", description = "Faz upload de uma imagem e retorna a URL")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Arquivo vazio"));
        }

        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Arquivo muito grande (máx 5MB)"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF"));
        }

        UUID storeId = TenantContext.requireCurrentTenant();
        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;

        Path storePath = Paths.get(uploadDir, storeId.toString());
        Files.createDirectories(storePath);

        Path filePath = storePath.resolve(filename);
        file.transferTo(filePath);

        String imageUrl = "/api/uploads/" + storeId + "/" + filename;
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    private String getExtension(String filename) {
        if (filename == null)
            return ".jpg";
        int lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot) : ".jpg";
    }
}
