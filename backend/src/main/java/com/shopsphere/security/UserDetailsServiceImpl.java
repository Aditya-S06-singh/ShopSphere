package com.shopsphere.security;

import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new ShopSphereUserDetails(user);
    }

    /**
     * Custom UserDetails implementation that carries the User's database ID.
     * This lets controllers resolve the current user's ID directly from the
     * @AuthenticationPrincipal without an extra DB lookup.
     */
    public static final class ShopSphereUserDetails implements UserDetails {

        private final Long userId;
        private final String email;
        private final String password;
        private final boolean enabled;
        private final Collection<? extends GrantedAuthority> authorities;

        public ShopSphereUserDetails(User user) {
            this.userId = user.getId();
            this.email = user.getEmail();
            this.password = user.getPassword();
            this.enabled = user.isEnabled();
            this.authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));
        }

        /** The database primary key of this user — use this to look up owned resources. */
        public Long getUserId() {
            return userId;
        }

        @Override public String getUsername() { return email; }
        @Override public String getPassword() { return password; }
        @Override public boolean isEnabled() { return enabled; }
        @Override public boolean isAccountNonExpired() { return true; }
        @Override public boolean isAccountNonLocked() { return true; }
        @Override public boolean isCredentialsNonExpired() { return true; }
        @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    }
}

