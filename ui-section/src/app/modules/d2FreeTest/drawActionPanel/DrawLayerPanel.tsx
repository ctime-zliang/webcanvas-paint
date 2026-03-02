import React from 'react'
import styles from './index.module.less'
import { useSnapshot } from 'valtio'
import { valtioStore } from '../store/store'
import { TDrawLayerItemResult, TValtioStore } from '../store/types'
import { valtioAction } from '../store/actions'
import { EDrwaAction } from '@/app/config/drawAction'

export function DrawLayerPanel(props: any): React.ReactElement {
	const valtioStoreSnap: TValtioStore = useSnapshot(valtioStore)
	const clickAction = (action: EDrwaAction): void => {
		valtioAction.dispatchCanvasAction(action, '')
	}
	const selectChangeAction = (action: EDrwaAction, e: React.FormEvent): void => {
		const targetElement: HTMLSelectElement = e.currentTarget as HTMLSelectElement
		valtioAction.dispatchCanvasAction(action, targetElement.value as string)
	}
	return (
		<section className={styles['panel-container']}>
			<div className={styles['panel-label']}>
				<div className={styles['panel-label-text']}>图层操作</div>
			</div>
			<div>|</div>
			<ul className={styles['panel-list-wrapper']}>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.CREATE_DRAWLAYER_ITEM)
					}}
				>
					<span>新建绘制层</span>
				</li>
				<li className={styles['panel-list-item']}>
					<select
						name="draw-layers"
						id="drawLayers"
						value={valtioStoreSnap.selectedDrawLayerItemId}
						onChange={(e: React.FormEvent): void => {
							selectChangeAction(EDrwaAction.SWITCH_ACTIVE_DRAWLAYER_ITEM, e)
						}}
						style={{ width: `155px` }}
					>
						{valtioStoreSnap.allDrawLayers.map((item: TDrawLayerItemResult, index: number): React.ReactElement => {
							return (
								<option key={index} value={item.layerItemId}>
									{item.layerItemName}
								</option>
							)
						})}
					</select>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DELETE_DRAWLAYER_ITEM)
					}}
				>
					<span>删除当前选中的绘制层</span>
				</li>
			</ul>
		</section>
	)
}
