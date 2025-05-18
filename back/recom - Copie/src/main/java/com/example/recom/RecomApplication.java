package com.example.recom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class RecomApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecomApplication.class, args);
	}

}
