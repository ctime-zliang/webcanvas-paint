import { EPlaneStatus, EPlaneType } from '../config/PlaneProfile'

export type TPlaneJSONData = {
	status: EPlaneStatus
	layerItemType: EPlaneType
	layerItemId: string
	layerItemName: string
	layerItemOpacity: number
	groupId: string
}
