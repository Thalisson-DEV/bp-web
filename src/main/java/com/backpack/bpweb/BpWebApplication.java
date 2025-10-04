package com.backpack.bpweb;

import org.flywaydb.core.internal.util.JsonUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BpWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(BpWebApplication.class, args);
    }

}
