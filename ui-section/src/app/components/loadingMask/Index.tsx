import React, { useCallback, useEffect, useRef, useState } from 'react'

const maskElementCommonStyle: React.CSSProperties = {
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100vw',
	height: '100vh',
	display: 'flex',
	justifyContent: 'center',
	alignContent: 'center',
	alignItems: 'center',
	zIndex: 99999,
	transition: 'all 0.75s ease-out',
	backgroundColor: 'rgba(22, 22, 22, 1.0)',
	opacity: 1,
	color: '#ffffff',
	cursor: 'wait',
}
const maskElementShowStyle: React.CSSProperties = {
	...maskElementCommonStyle,
	opacity: 1,
}
const maskElementHiddenStyle: React.CSSProperties = {
	...maskElementCommonStyle,
	opacity: 0,
}

type TComponentDataHandlerRef = {
	isLoadMaskElement: boolean
	hasBindMaskElementEvent: boolean
}
export type TLoadingMaskProps = {
	isShowMask: boolean
}
export function LoadingMask(props: TLoadingMaskProps): React.ReactElement {
	const { isShowMask } = props
	const maskElementRef: { current: HTMLElement } = useRef<HTMLElement>(null!)
	const [flush, setFlush] = useState<number>(0)
	const dataHandlerRef: { current: TComponentDataHandlerRef } = useRef<TComponentDataHandlerRef>({
		isLoadMaskElement: false,
		hasBindMaskElementEvent: false,
	})
	const transitionendCallback = useCallback((e: Event): void => {
		if (maskElementRef.current) {
			maskElementRef.current.removeEventListener('transitionend', transitionendCallback)
		}
		dataHandlerRef.current.isLoadMaskElement = false
		setFlush((prev: number): number => {
			return prev + 1
		})
	}, [])
	useEffect((): void => {
		if (maskElementRef.current && !dataHandlerRef.current.hasBindMaskElementEvent) {
			dataHandlerRef.current.hasBindMaskElementEvent = true
			maskElementRef.current.addEventListener('transitionend', transitionendCallback)
		}
	}, [maskElementRef.current])
	return (
		<>
			{dataHandlerRef.current.isLoadMaskElement ? (
				<section ref={maskElementRef} style={isShowMask ? maskElementShowStyle : maskElementHiddenStyle}>
					<span>Iframe Canvas loading...</span>
				</section>
			) : null}
		</>
	)
}
