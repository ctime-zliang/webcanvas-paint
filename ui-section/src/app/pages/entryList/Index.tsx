import React, { useEffect, useRef, useState } from 'react'
import styles from './Index.module.less'
import { EModuleTag, entryList, TListItem } from './data'
import { ListItem } from './ListItem'
import { D2FreeTestIndex } from '@/app/modules/d2FreeTest/Index'
import { D2SimpleClockIndex } from '@/app/modules/d2SimpleClock/Index'

type TComponentDataHandlerRef = {
	viewComponent: React.ReactElement
	viewTagName: string
}
export function EntryList(): React.ReactElement {
	const [flush, setFlush] = useState<number>(0)
	const dataHandlerRef: { current: TComponentDataHandlerRef } = useRef<TComponentDataHandlerRef>({
		viewComponent: null!,
		viewTagName: undefined!,
	})
	const onEntryClickAction = (id: string): void => {
		dataHandlerRef.current.viewTagName = id
		window.localStorage.setItem('webcanvas-viewtagname', id)
		setFlush((prev: number): number => {
			return prev + 1
		})
	}
	useEffect((): void => {
		if (!dataHandlerRef.current.viewTagName) {
			dataHandlerRef.current.viewComponent = null!
			setFlush((prev: number): number => {
				return prev + 1
			})
			return
		}
		let iframeUrl: string = undefined!
		for (let i: number = 0; i < entryList.length; i++) {
			for (let j: number = 0; j < entryList[i].menus.length; j++) {
				if (entryList[i].menus[j].id === dataHandlerRef.current.viewTagName) {
					iframeUrl = entryList[i].menus[j].iframeUrl
					break
				}
			}
		}
		switch (dataHandlerRef.current.viewTagName) {
			case EModuleTag.d2FreeTest: {
				dataHandlerRef.current.viewComponent = (
					<D2FreeTestIndex
						iframeUrl={iframeUrl}
						iframeId={dataHandlerRef.current.viewTagName}
						onTurnBackAction={(): void => {
							dataHandlerRef.current.viewTagName = undefined!
							dataHandlerRef.current.viewComponent = null!
							window.localStorage.setItem('webcanvas-viewtagname', undefined!)
							setFlush((prev: number): number => {
								return prev + 1
							})
						}}
					/>
				)
				setFlush((prev: number): number => {
					return prev + 1
				})
				break
			}
			case EModuleTag.d2SimpleClock: {
				dataHandlerRef.current.viewComponent = (
					<D2SimpleClockIndex
						iframeUrl={iframeUrl}
						iframeId={dataHandlerRef.current.viewTagName}
						onTurnBackAction={(): void => {
							dataHandlerRef.current.viewTagName = undefined!
							dataHandlerRef.current.viewComponent = null!
							window.localStorage.setItem('webcanvas-viewtagname', undefined!)
							setFlush((prev: number): number => {
								return prev + 1
							})
						}}
					/>
				)
				setFlush((prev: number): number => {
					return prev + 1
				})
				break
			}
			default: {
				dataHandlerRef.current.viewComponent = null!
				window.localStorage.setItem('webcanvas-viewtagname', undefined!)
				setFlush((prev: number): number => {
					return prev + 1
				})
			}
		}
	}, [dataHandlerRef.current.viewTagName])
	useEffect((): void => {
		const lsc: string = window.localStorage.getItem('webcanvas-viewtagname')!
		dataHandlerRef.current.viewTagName = lsc
		setFlush((prev: number): number => {
			return prev + 1
		})
	}, [])
	if (dataHandlerRef.current.viewComponent) {
		return dataHandlerRef.current.viewComponent
	}
	return (
		<section className={styles['container']}>
			<section className={styles['wrapper']}>
				{entryList.map((menuItem: TListItem, index: number): React.ReactElement => {
					return <ListItem key={String(index)} title={menuItem.title} menus={menuItem.menus} onClick={onEntryClickAction} />
				})}
			</section>
		</section>
	)
}
