import React from 'react'
import { ToastContainer } from 'react-toastify'
import '../common/assets/style/prefix.less'
import Root from './pages/root'
import { TCommonComponentBaseProps } from './types/comm.types'

export default function App(props: TCommonComponentBaseProps): React.ReactElement {
	console.log(`☆☆☆ WebCanvas App ☆☆☆`, props)
	const __app_id__: number = Math.random()
	return (
		<section data-tagitem="React-App-Section" style={{ width: '100vw', height: '100vh' }}>
			<Root __AppProps__={{ __app_id__ }} {...props} />
			<ToastContainer />
		</section>
	)
}
