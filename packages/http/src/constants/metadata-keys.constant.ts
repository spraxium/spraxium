/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export const HTTP_METADATA_KEYS = {
  PREFIX: 'spraxium:http:prefix',
  ROUTES: 'spraxium:http:routes',
  MIDDLEWARE: 'spraxium:http:middleware',
  GUARDS: 'spraxium:http:guards',
  PARAMS: 'spraxium:http:params',
  STATUS_CODE: 'spraxium:http:status_code',
  HTTP_CLIENT_MODULE: 'spraxium:http:client_module',
} as const;
