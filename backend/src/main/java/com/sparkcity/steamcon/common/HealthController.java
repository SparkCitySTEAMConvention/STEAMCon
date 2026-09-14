package com.sparkcity.steamcon.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController { @GetMapping("/api/health") public String health(){ return "ZipCon backend is running"; } }
