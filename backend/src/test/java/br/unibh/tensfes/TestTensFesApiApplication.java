package br.unibh.tensfes;

import org.springframework.boot.SpringApplication;

public class TestTensFesApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(TensFesApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
