package in.ashokit.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.ashokit.entity.FileAttachment;
import in.ashokit.entity.Project;
import in.ashokit.entity.User;
import in.ashokit.repository.FileAttachmentRepository;
import in.ashokit.repository.ProjectRepository;
import in.ashokit.repository.UserRepository;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3FileService {

    private final S3Client s3Client;
    private final FileAttachmentRepository fileAttachmentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public S3FileService(S3Client s3Client,
                         FileAttachmentRepository fileAttachmentRepository,
                         ProjectRepository projectRepository,
                         UserRepository userRepository) {
        this.s3Client = s3Client;
        this.fileAttachmentRepository = fileAttachmentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public FileAttachment uploadFile(MultipartFile file, Long projectId, String email) throws IOException {
        User user = userRepository.findByEmailIgnoreCase(email);

        Project project = projectRepository.findAccessibleProjectById(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String key = "projects/" + projectId + "/" + UUID.randomUUID() + "-" + originalName.replace(" ", "_");

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        String fileUrl = "https://" + bucketName + ".s3." +
                s3Client.serviceClientConfiguration().region().id() + ".amazonaws.com/" + key;

        FileAttachment attachment = new FileAttachment();
        attachment.setFileName(originalName);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileUrl(fileUrl);
        attachment.setProject(project);

        return fileAttachmentRepository.save(attachment);
    }

    public List<FileAttachment> getProjectFiles(Long projectId, String email) {
        User user = userRepository.findByEmailIgnoreCase(email);

        projectRepository.findAccessibleProjectById(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found or access denied"));

        return fileAttachmentRepository.findByProjectId(projectId);
    }
}