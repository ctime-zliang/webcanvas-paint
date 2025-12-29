import { proxy, useSnapshot } from 'valtio'
import { valtioStore } from './store'

export const useComparisonThreshold = (): boolean => {
	const valtioStoreSnapshot = useSnapshot(valtioStore)
	return valtioStoreSnapshot.iframeElementId !== ''
}
