import React from 'react'
import styles from './Index.module.less'
import { TMenuItem } from './data'

export type TMenuItemProps = TMenuItem & {
	onClick?: (id: string) => void
}
export function MenuItem(props: TMenuItemProps): React.ReactElement {
	const { title, id, description, onClick } = props
	return (
		<div
			className={styles['menuitem-container']}
			onClick={(): void => {
				onClick && onClick(id)
			}}
		>
			<div className={styles['menuitem-wrapper']}>
				<div className={styles['menuitem-title-wrapper']}>
					<span>{title}</span>
				</div>
				<div className={styles['menuitem-description-wrapper']}>
					<span>{description}</span>
				</div>
			</div>
		</div>
	)
}
