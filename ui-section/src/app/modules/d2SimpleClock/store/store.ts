import { proxy, useSnapshot } from 'valtio'
import { TValtioStore } from './types'

export const valtioStore: TValtioStore = proxy<TValtioStore>({
	iframeStatusLoaded: false,
	iframeElementId: '',
})
