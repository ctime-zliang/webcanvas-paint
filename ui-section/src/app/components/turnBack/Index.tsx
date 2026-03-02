import React from 'react'
import styles from './Index.module.less'

export type TTurnBackProps = {
	onClick?: () => void
}
export function TurnBack(props: TTurnBackProps): React.ReactElement {
	const { onClick } = props
	return (
		<div className={styles['btn-container']}>
			<div className={styles['btn-wrapper']} onClick={onClick}>
				<span>Exit</span>
			</div>
		</div>
	)
}
