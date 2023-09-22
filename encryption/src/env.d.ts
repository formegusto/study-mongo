declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_ROOT_USERNAME: string;
    MONGO_ROOT_PASSWORD: string;
    MONGO_CONN_URL: string;

    ENCKEY: string;
    SIGKEY: string;
  }
}
