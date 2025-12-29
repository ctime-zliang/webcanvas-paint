import { initIframeElement, TInitIframeElementResult } from '@/app/utils/iframe'
import React, { useEffect, useRef } from 'react'

const iframeElementCommonStyle: React.CSSProperties = {
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100vw',
	height: '100vh',
	display: 'flex',
	justifyContent: 'center',
	alignContent: 'center',
	alignItems: 'center',
	transition: 'all 0.5s ease-out',
	opacity: '1',
	backgroundColor: '#000000',
}

export type TIframeViewProps = {
	iframeUrl: string
	onIframeLoad?: (iframeId: string) => void
}
export function IframeView(props: TIframeViewProps): React.ReactElement {
	const { iframeUrl, onIframeLoad } = props
	const iframeWrapperElementRef = useRef<HTMLDivElement>(null)
	useEffect((): void => {
		initIframeElement(iframeWrapperElementRef.current as HTMLElement, iframeUrl).then((result: TInitIframeElementResult): void => {
			window.setTimeout((): void => {
				onIframeLoad && onIframeLoad(result.id)
			})
		})
	}, [])
	return (
		<>
			<section ref={iframeWrapperElementRef} style={iframeElementCommonStyle}></section>
		</>
	)
}
