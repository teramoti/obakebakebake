/**
 * resources/icons配下のPNGをReact UIで表示する共通部品です。
 * アイコン参照をこの部品に集約し、画面ごとのパス直書きを減らします。
 */
import { iconUrl } from '../../game/data/resourcePaths.js'

type Props = {
  name: string
  label?: string
  className?: string
}

// ファイル名からPNGを引き、alt付きのimgとして返します。
export default function Icon({ name, label, className = 'ui-png-icon' }: Props) {
  return <img className={className} src={iconUrl(name)} alt={label ?? ''} draggable="false" />
}
