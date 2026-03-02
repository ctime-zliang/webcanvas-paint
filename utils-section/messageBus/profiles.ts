import { PriorityQueue } from '../utils/PriorityQueue'
import { MessageBusBridge } from './MessageBusBridge'

export type TRPC_TIMEOUT_DESCP = {
	timeout: number
	topic: string
	reject: (e: any) => void
}

export type TMessageRemoteData = {
	data: any
	bridge?: MessageBusBridge
	source?: typeof InsWeakRef
}

export type TInnerMessage = {
	topic: string
	type: EMessageType
	message: any
}

export enum EMessageType {
	PUBLISH = 'PUBLISH',
	SUBSCRIBE = 'SUBSCRIBE',
	PUSH = 'PUSH',
	PULL = 'PULL',
}

export interface ISwichMessage {
	type: EMessageType
	topic: string
	data: any
}

export type MessageCallback = (data: any, bridge?: MessageBusBridge, source?: any) => void

function getGlobalScope(): any {
	if (typeof window !== 'undefined') {
		return window
	}
	if (typeof self !== 'undefined') {
		return self
	}
	if (typeof globalThis !== 'undefined') {
		return globalThis
	}
	//@ts-ignore
	if (typeof global !== 'undefined') {
		//@ts-ignore
		return global
	}
}

export function getReferenceSource(source: any): any {
	if (typeof source === 'undefined' || source === null) {
		return undefined
	}
	return new InsWeakRef(source)
}

export function delReferenceSource<T>(source?: typeof InsWeakRef): T {
	return source?.deref()
}

export const GLOBAL_SCOPE: any = getGlobalScope()

export const InsWeakRef =
	GLOBAL_SCOPE.WeakRef ||
	class WeakRef<T extends Object> {
		public readonly [Symbol.toStringTag]: 'WeakRef'
		public _item: T
		constructor(item: T) {
			this._item = item
		}

		public deref(): T | undefined {
			return this._item
		}
	}

export const iRequestAnimationFrame: (callback: (timeStamp: number) => void) => void = GLOBAL_SCOPE['requestAnimationFrame']

export const RPC_IDEN: string = `__MSG_IDEN__`
export const RPC_DEFAULT_TIMEOUT: number = 5 * 60 * 1000
export const RPC_TIMEOUT_TASKQUEUE: PriorityQueue<TRPC_TIMEOUT_DESCP> = new PriorityQueue((a: TRPC_TIMEOUT_DESCP, b: TRPC_TIMEOUT_DESCP): number => {
	return a.timeout - b.timeout
})
