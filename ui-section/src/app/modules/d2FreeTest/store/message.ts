import { topRightSuccessToast } from '@/app/utils/toast'
import { messageTool } from '@/app/utils/MessageTool'
import { TDrawLayerItemResult } from './types'
import { valtioAction } from './actions'
import { MessageBusTask } from '../../../../../../utils-section/messageBus'

export function messageHandle(): Array<MessageBusTask> {
	const taskItems: Array<MessageBusTask> = []
	taskItems.push(
		messageTool.messageBus.registeAsyncService(
			`CAS2UI_SVR-CANVAS_READY`,
			async (params: {
				ready: boolean
			}): Promise<{
				ask: boolean
				userTag: string
			}> => {
				const { ready } = params
				if (ready) {
					topRightSuccessToast(`WebCanvas Ready`)
				}
				return {
					ask: true,
					userTag: 'UI',
				}
			}
		)
	)
	taskItems.push(
		messageTool.messageBus.subscribe(
			`CAS2UI_EVT-UPDATE_DRAWLAYER_LIST`,
			(params: { allDrawLayers: ReadonlyArray<TDrawLayerItemResult>; selectedDrawLayerItemId: string }): void => {
				const { allDrawLayers, selectedDrawLayerItemId } = params
				valtioAction.setAllDrawLayers(allDrawLayers)
				valtioAction.setSelectedDrawLayerItemId(selectedDrawLayerItemId)
			}
		)
	)
	return taskItems
}
