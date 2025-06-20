package com.decathlon.retailstockunited.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final String apiKey;
    private static final String API_KEY_HEADER = "X-API-KEY";
    private final RequestMatcher publicEndpoints;

    public ApiKeyAuthFilter(String apiKey) {
        this.apiKey = apiKey;

        // Define paths that don't require API key authentication
        List<RequestMatcher> publicPaths = List.of(
                new AntPathRequestMatcher("/"),
                new AntPathRequestMatcher("/actuator/**"),
                new AntPathRequestMatcher("/error"),
                new AntPathRequestMatcher("/swagger-ui.html"),
                new AntPathRequestMatcher("/swagger-ui/**"),
                new AntPathRequestMatcher("/v3/api-docs/**"),
                new AntPathRequestMatcher("/api-docs/**"),
                new AntPathRequestMatcher("/swagger-resources/**")
        );

        this.publicEndpoints = new OrRequestMatcher(publicPaths);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip API key check for public endpoints
        if (publicEndpoints.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String requestApiKey = request.getHeader(API_KEY_HEADER);

        // Check if API key is present and valid
        if (requestApiKey == null || requestApiKey.isEmpty()) {
            handleUnauthorized(response, "API key is missing");
            return;
        }

        if (!apiKey.equals(requestApiKey)) {
            handleUnauthorized(response, "Invalid API key");
            return;
        }

        // Set authentication in the security context if API key is valid
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "API", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_API")));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    private void handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + message + "\"}");
    }
}