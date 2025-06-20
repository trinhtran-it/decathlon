package com.decathlon.retailstockunited.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;

import java.util.Arrays;
import java.util.List;

@Configuration
public class OpenApiConfig {

    // The actual API key value used for authentication
    @Value("${api.key}")
    private String apiKeyValue;
    
    private static final String API_KEY = "decathlon-retail-stock-united-key-2025";
    private static final String SECURITY_SCHEME_NAME = "apiKey";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("RetailStockUnited API")
                        .description("API documentation for the RetailStockUnited service, which provides real-time stock information for Decathlon products." +
                                "\n\n## 🔑 Authentication Required" +
                                "\n\n**IMPORTANT:** This API requires API key authentication. All requests must include the API key in the `X-API-KEY` header." +
                                "\n\n**API Key Value:** `" + API_KEY + "`" +
                                "\n\n### How to Authorize in Swagger UI:" +
                                "\n1. Click the 'Authorize' button (🔓) at the top right of this page" +
                                "\n2. Enter the API key: `" + API_KEY + "` in the value field" +
                                "\n3. Click 'Authorize' and then 'Close'" +
                                "\n\n**Without authorization, all API calls will fail with a 401 error.**" +
                                "\n\n**Example curl command:**" +
                                "\n```bash\ncurl -X GET \"http://localhost:8080/api/v1/stocks\" -H \"X-API-KEY: " + API_KEY + "\"\n```" +
                                "\n\n**Response Codes:**\n" +
                                "- 401 Unauthorized: Missing or invalid API key" +
                                "\n- 403 Forbidden: API key has insufficient permissions")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Decathlon API Team")
                                .email("api-team@decathlon.com")
                                .url("https://developer.decathlon.com"))
                        .license(new License()
                                .name("Decathlon Internal License")
                                .url("https://www.decathlon.com/license")))
                .servers(List.of(
                        new Server().url("/").description("Default Server URL"),
                        new Server().url("http://localhost:8080").description("Local development server")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-API-KEY")
                                .description("API Key Authentication: Enter the value `" + API_KEY + "` in this field.")))
                // Add a global security requirement
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }

    /**
     * Custom operation customizer to ensure that all generated curl examples include the API key header
     */
    @Bean
    public OperationCustomizer operationCustomizer() {
        return (Operation operation, HandlerMethod handlerMethod) -> {
            // Add API Key as a header parameter to make it visible in the curl examples
            Parameter apiKeyHeader = new HeaderParameter()
                .name("X-API-KEY")
                .description("API Key for authentication")
                .required(true)
                .schema(new StringSchema().example(API_KEY));
            
            // Add security requirement to ensure the API key is included in Swagger UI
            if (operation.getSecurity() == null || operation.getSecurity().isEmpty()) {
                operation.addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
            }
            
            // Check if the header parameter already exists
            boolean headerExists = false;
            if (operation.getParameters() != null) {
                headerExists = operation.getParameters().stream()
                    .anyMatch(param -> "X-API-KEY".equals(param.getName()));
            }
            
            // Add the parameter if it doesn't exist
            if (!headerExists) {
                operation.addParametersItem(apiKeyHeader);
            }
            
            return operation;
        };
    }
}