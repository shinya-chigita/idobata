interface ImportMeta {
  readonly env: {
    readonly VITE_ADMIN_FRONTEND_API_BASE_URL: string;
    [key: string]: string | boolean | undefined;
  };
}
