/**
 * Demo user account for the prototype login simulation. `password` is
 * plaintext by design — this is a front-end-only prototype with no
 * backend, so there is no real secret to protect. Do not treat these
 * as production credentials.
 */
export interface User {
  id: string
  username: string
  name: string
  role: string
  password: string
}
