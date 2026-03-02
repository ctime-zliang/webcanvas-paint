import React, { useLayoutEffect, useRef, useState } from 'react'
import { messageHandle } from './store/message'
import { TurnBack } from '@/app/components/turnBack/Index'
import { LoadingMask } from '@/app/components/loadingMask/Index'
import { useSnapshot } from 'valtio'
import { TValtioStore } from './store/types'
import { valtioStore } from './store/store'
import { IframeView } from '@/app/components/iframeView/Index'
import { canvasIframeLoadURL } from '@/app/config/config'
import { valtioAction } from './store/actions'
import { MessageBusTask } from '../../../../../utils-section/messageBus'

type TComponentDataHandlerRef = {
	taskItems: Array<MessageBusTask>
}
export type D2SimpleClockIndexProps = {
	iframeId: string
	iframeUrl: string
	onTurnBackAction?: () => void
}
export function D2SimpleClockIndex(props: D2SimpleClockIndexProps): React.ReactElement {
	const { onTurnBackAction, iframeId } = props
	const valtioStoreSnap: TValtioStore = useSnapshot(valtioStore)
	const [flush, setFlush] = useState<number>(0)
	const dataHandlerRef: { current: TComponentDataHandlerRef } = useRef<TComponentDataHandlerRef>({
		taskItems: [],
	})
	const onIframeLoadAction = (iframeId: string): void => {
		valtioAction.setIframeLoadedStatus(true)
		valtioAction.setIframeElementId(iframeId)
	}
	const onWillTurnBackAction = (): void => {
		valtioAction.setIframeLoadedStatus(false)
		valtioAction.setIframeElementId(null!)
		for (let i: number = 0; i < dataHandlerRef.current.taskItems.length; i++) {
			dataHandlerRef.current.taskItems[i].cancel()
		}
		onTurnBackAction && onTurnBackAction()
	}
	useLayoutEffect((): void => {
		dataHandlerRef.current.taskItems = [...messageHandle()]
		setFlush((prev: number): number => {
			return prev + 1
		})
	}, [])
	return (
		<main style={{ position: 'relative' }}>
			<LoadingMask isShowMask={valtioStoreSnap.iframeStatusLoaded === false} />
			<IframeView iframeUrl={canvasIframeLoadURL + `?instance=${iframeId}`} onIframeLoad={onIframeLoadAction} />
			<div
				style={{
					position: 'fixed',
					right: '5px',
					top: '5px',
				}}
			>
				<TurnBack onClick={onWillTurnBackAction} />
			</div>
		</main>
	)
}
