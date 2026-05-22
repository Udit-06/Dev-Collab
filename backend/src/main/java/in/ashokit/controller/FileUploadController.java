package in.ashokit.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import in.ashokit.entity.FileAttachment;
import in.ashokit.service.S3FileService;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    private final S3FileService s3FileService;

    public FileUploadController(S3FileService s3FileService) {
        this.s3FileService = s3FileService;
    }

    @PostMapping("/upload/{projectId}")
    public FileAttachment uploadFile(@RequestParam("file") MultipartFile file,
                                     @PathVariable Long projectId,
                                     Authentication authentication) throws IOException {
        return s3FileService.uploadFile(file, projectId, authentication.getName());
    }

    @GetMapping("/project/{projectId}")
    public List<FileAttachment> getProjectFiles(@PathVariable Long projectId,
                                                Authentication authentication) {
        return s3FileService.getProjectFiles(projectId, authentication.getName());
    }
}