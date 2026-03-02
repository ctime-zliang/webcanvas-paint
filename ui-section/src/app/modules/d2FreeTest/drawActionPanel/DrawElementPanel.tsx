import React from 'react'
import { useSnapshot } from 'valtio'
import styles from './index.module.less'
import { valtioStore } from '../store/store'
import { TValtioStore } from '../store/types'
import { valtioAction } from '../store/actions'
import { EDrwaAction } from '@/app/config/drawAction'

export function DrawElementPanel(props: any): React.ReactElement {
	const valtioStoreSnap: TValtioStore = useSnapshot(valtioStore)
	const clickAction = (action: EDrwaAction): void => {
		valtioAction.dispatchCanvasAction(action, '')
	}
	return (
		<section className={styles['panel-container']}>
			<div className={styles['panel-label']}>
				<div className={styles['panel-label-text']}>图元操作</div>
			</div>
			<div>|</div>
			<ul className={styles['panel-list-wrapper']}>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRAW_D2LINE)
					}}
				>
					<span>2D (单)线段</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2CIRCLE)
					}}
				>
					<span>2D 圆</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2POINT)
					}}
				>
					<span>2D 点</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2ARC)
					}}
				>
					<span>2D (三点)圆弧</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2TEXT)
					}}
				>
					<span>2D (示例)文本</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2IMAGE)
					}}
				>
					<span>2D 图片</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DRWA_D2RECT)
					}}
				>
					<span>2D 矩形</span>
				</li>
			</ul>
		</section>
	)
}
