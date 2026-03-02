import { topRightSuccessToast } from '@/app/utils/toast'
import { messageTool } from '@/app/utils/MessageTool'
import { MessageBusTask } from '../../../../../../utils-section/messageBus'

export function messageHandle(): Array<MessageBusTask> {
	const taskItems: Array<MessageBusTask> = []
	taskItems.push(
		messageTool.messageBus.registeAsyncService(`LIB2UI_SVR-CANVAS_READY`, async (params: { ready: boolean }): Promise<boolean> => {
			const { ready } = params
			if (ready) {
				topRightSuccessToast(`WebCanvas Ready`)
			}
			return true
		})
	)
	console.warn(taskItems)
	return taskItems
}
