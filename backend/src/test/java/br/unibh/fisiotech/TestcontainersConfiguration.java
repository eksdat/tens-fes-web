package br.unibh.fisiotech;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/** PostgreSQL 17 descartável, com os papéis do Supabase ({@code anon}, {@code authenticated}) que as migrations usam. */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	PostgreSQLContainer postgresContainer() {
		return new PostgreSQLContainer(DockerImageName.parse("postgres:17"))
				.waitingFor(Wait.forSuccessfulCommand("pg_isready -h 127.0.0.1"))
				.withInitScript("papeis-supabase.sql");
	}

}
