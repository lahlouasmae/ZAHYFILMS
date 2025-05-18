package org.example.service_commentaire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "org.example.service_commentaire.client")
@SpringBootApplication
@EnableDiscoveryClient
public class ServiceCommentaireApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceCommentaireApplication.class, args);
    }

}
