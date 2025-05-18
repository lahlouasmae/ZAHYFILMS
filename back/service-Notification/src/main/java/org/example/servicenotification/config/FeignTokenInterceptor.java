package org.example.servicenotification.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignTokenInterceptor implements RequestInterceptor {

    @Value("${admin-token}")
    private String adminToken;

    @Override
    public void apply(RequestTemplate template) {
        template.header("Authorization", "Bearer " + adminToken);
    }
}

