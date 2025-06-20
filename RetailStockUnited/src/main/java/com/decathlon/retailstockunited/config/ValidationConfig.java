package com.decathlon.retailstockunited.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * Configuration class for customizing validation behavior.
 * Ensures that all custom validators are properly registered with Spring's validation framework.
 */
@Configuration
public class ValidationConfig {
    
    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }
}
