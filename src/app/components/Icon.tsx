import { iconUrl } from '../../game/data/resourcePaths.js'

type Props = {
  name: string
  label?: string
  className?: string
}

export default function Icon({ name, label, className = 'ui-png-icon' }: Props) {
  return <img className={className} src={iconUrl(name)} alt={label ?? ''} draggable="false" />
}
