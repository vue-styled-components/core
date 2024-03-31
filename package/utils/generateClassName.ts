import { CLASS_PREFIX } from '../constants/constants'

const generateClassName = () => {
  return `${CLASS_PREFIX}-${Math.random().toString(36).substring(4)}`
}

export default generateClassName
