package com.backpack.bpweb.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ResponseErrorDTO {
    private java.time.Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
