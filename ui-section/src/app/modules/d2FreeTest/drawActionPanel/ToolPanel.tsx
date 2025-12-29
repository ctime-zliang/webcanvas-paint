import React from 'react'
import styles from './index.module.less'
import { useSnapshot } from 'valtio'
import { valtioStore } from '../store/store'
import { TValtioStore } from '../store/types'
import { valtioAction } from '../store/actions'
import { EDrwaAction } from '@/app/config/drawAction'

export function ToolPanel(props: any): React.ReactElement {
	const valtioStoreSnap: TValtioStore = useSnapshot(valtioStore)
	const clickAction = (action: EDrwaAction): void => {
		valtioAction.dispatchCanvasAction(action, '')
	}
	return (
		<section className={styles['panel-container']}>
			<div className={styles['panel-label']}>
				<div className={styles['panel-label-text']}>工具栏</div>
			</div>
			<div>|</div>
			<ul className={styles['panel-list-wrapper']}>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.SET_SELECTION)
					}}
				>
					<span>选择</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DO_COPY)
					}}
				>
					<span>复制</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DO_UNDO)
					}}
				>
					<span>撤回</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DO_REDO)
					}}
				>
					<span>重做</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.DO_DELETE)
					}}
				>
					<span>删除选中</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.IMPORT)
					}}
				>
					<span>导入</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.EXPORT)
					}}
				>
					<span>导出</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.CLEAR_DRAWLAYER_ELEMENTS)
					}}
				>
					<span>清空当前层的所有元素</span>
				</li>
				<li
					className={styles['panel-list-item']}
					onClick={(): void => {
						clickAction(EDrwaAction.CLEAR_CANVAS_ELEMENTS)
					}}
				>
					<span>清空整个画布的所有元素</span>
				</li>
			</ul>
		</section>
	)
}
