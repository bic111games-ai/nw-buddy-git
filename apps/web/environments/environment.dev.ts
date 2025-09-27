import { env } from './env'
import { Environment, getCharacterUrl, getNwDataUrl } from './utils'

export const environment: Environment = {
  ...env,
  production: false,
  standalone: false,
  environment: 'DEV',
  nwbtUrl: '/nwbt',
  modelsUrl: '/nwbt/models',
  nwDataUrl: getNwDataUrl(env, 'deployUrl'),
  nwImagesUrl: getNwDataUrl(env, 'deployUrl'),
  nwTilesUrl: getNwDataUrl(env, 'deployUrl'),
  nwCharUrl: getCharacterUrl(env, 'cdnUrl'),
  pocketbaseUrl: null,
  cdnUrl: '',
}
