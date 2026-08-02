import ServicePage from '../ServicePage.jsx'
import { services } from '../../content/services.js'

export function Component() {
  return <ServicePage data={services.security} />
}
