package in.ashokit.dto;

public class ChatUserDto {
    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private String lastMessage;
    private String lastMessageTime;

    public ChatUserDto() {
    }

    public ChatUserDto(Long id, String name, String email, String profileImage, String lastMessage, String lastMessageTime) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = profileImage;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(String lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
}