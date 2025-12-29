export type MessageCallback = (data: any) => void

export interface IMessageBusRPCData {
	message: any
	replyTopic: string
}

export const RPC_IDEN: string = `__BC_MSG_IDEN__`

export type BroadcastBaseMessage = {
	type: EBroadcastMessageType
	uuid: string
	topic: string
}

export enum EBroadcastMessageType {
	PUBLISH = 'PUBLISH',
	WHO_HAS = 'WHO_HAS',
	I_HAVE = 'I_HAVE',
	I_NEED = 'I_NEED',
	I_GIVE = 'I_GIVE',
}
