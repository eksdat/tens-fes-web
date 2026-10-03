package br.unibh.fisiotech;

import org.springframework.boot.SpringApplication;

public class TestFisiotechApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(FisiotechApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
