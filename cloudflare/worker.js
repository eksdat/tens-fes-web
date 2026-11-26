import { Container, getContainer } from "@cloudflare/containers";

export class FisiotechApi extends Container {
  defaultPort = 8080;
  pingEndpoint = "localhost/actuator/health";
  enableInternet = true;
  sleepAfter = "5m";

  envVars = {
    DB_URL: this.env.DB_URL,
    DB_USERNAME: this.env.DB_USERNAME,
    DB_PASSWORD: this.env.DB_PASSWORD,
    SUPABASE_URL: this.env.SUPABASE_URL,
    CORS_ALLOWED_ORIGINS: this.env.CORS_ALLOWED_ORIGINS,
    SUPABASE_SECRET_KEY: this.env.SUPABASE_SECRET_KEY ?? "",
  };
}

export default {
  fetch(request, env) {
    return getContainer(env.API).fetch(request);
  },
};
