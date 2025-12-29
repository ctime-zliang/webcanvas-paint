import React from 'react'
import styles from './Index.module.less'
import { DrawLayerPanel } from './DrawLayerPanel'
import { DrawElementPanel } from './DrawElementPanel'
import { ToolPanel } from './ToolPanel'

export function DrawActionPanel(props: any): React.ReactElement {
	return (
		<section className={styles['container']}>
			<DrawLayerPanel />
			<DrawElementPanel />
			<ToolPanel />
		</section>
	)
}
