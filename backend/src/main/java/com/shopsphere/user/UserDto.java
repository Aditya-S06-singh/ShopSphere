package com.shopsphere.user;

public record UserDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        Role role
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
