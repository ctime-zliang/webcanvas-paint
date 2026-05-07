import { Constant } from '../Constant'
import { BaseManager } from './BaseManage'

export enum EPointerEventName {
	POINTER_LEFTDOWN = 'POINTER_LEFTDOWN',
}

/**
 * Events
 * 		{
 * 			"ElementId" -> {
 * 				"EventId": Function
 * 			}
 * 		}
 */

export type TPointEventHandler = (elementItemId: string, eventId: string) => void
export class EventsManager extends BaseManager<TPointEventHandler> {
	private static instance: EventsManager
	public static getInstance(): EventsManager {
		if (EventsManager.instance === undefined) {
			EventsManager.instance = new EventsManager()
		}
		return EventsManager.instance
	}

	private _pointerLeftDownEvents: Map<string, Map<string, TPointEventHandler>>
	constructor() {
		super()
		this._pointerLeftDownEvents = new Map()
	}

	public triggerEventHandlers(elementItemId: string, eventName: EPointerEventName): void {
		const eventTypeMap: Map<string, Map<string, TPointEventHandler>> = this.getEventTypeMap(eventName)
		if (!eventTypeMap) {
			throw new Error(`not support event: ${eventName}.`)
		}
		const eventMap: Map<string, TPointEventHandler> = eventTypeMap.get(elementItemId)!
		if (typeof eventMap === 'undefined') {
			return null!
		}
		for (let [eventId, handler] of eventMap) {
			handler(elementItemId, eventId)
		}
	}

	public appendEventItem(elementItemId: string, eventName: EPointerEventName, callback: TPointEventHandler): string {
		const eventTypeMap: Map<string, Map<string, TPointEventHandler>> = this.getEventTypeMap(eventName)
		if (!eventTypeMap) {
			throw new Error(`not support event: ${eventName}.`)
		}
		let eventMap: Map<string, TPointEventHandler> = eventTypeMap.get(elementItemId)!
		if (typeof eventMap === 'undefined') {
			eventMap = new Map()
		}
		const eventHandlerId: string = Constant.globalIdenManager.getEventHandlerIden()
		eventMap.set(eventHandlerId, callback)
		eventTypeMap.set(elementItemId, eventMap)
		return eventHandlerId
	}

	public removeEventItem(elementItemId: string, eventName: EPointerEventName, eventHandlerId: string): void {
		const eventTypeMap: Map<string, Map<string, TPointEventHandler>> = this.getEventTypeMap(eventName)
		if (!eventTypeMap) {
			throw new Error(`not support event: ${eventName}.`)
		}
		let eventMap: Map<string, TPointEventHandler> = eventTypeMap.get(elementItemId)!
		if (typeof eventMap === 'undefined') {
			return
		}
		eventMap.delete(eventHandlerId)
	}

	public removeAllEvents(elementItemId: string): void {
		let allEventMaps: Array<Map<string, Map<string, TPointEventHandler>>> = this.getAllEventTypeMaps()
		for (let i: number = 0; i < allEventMaps.length; i++) {
			const eventMap: Map<string, TPointEventHandler> = allEventMaps[i].get(elementItemId)!
			if (typeof eventMap !== 'undefined') {
				eventMap.clear()
				allEventMaps[i].delete(elementItemId)
			}
		}
	}

	public getEventTypeMap(eventName: EPointerEventName): Map<string, Map<string, TPointEventHandler>> {
		let eventMap: Map<string, Map<string, TPointEventHandler>> = null!
		switch (eventName) {
			case EPointerEventName.POINTER_LEFTDOWN: {
				eventMap = this._pointerLeftDownEvents
				break
			}
		}
		return eventMap
	}

	public getAllEventTypeMaps(): Array<Map<string, Map<string, TPointEventHandler>>> {
		return [this._pointerLeftDownEvents]
	}

	public quit(): void {
		this._pointerLeftDownEvents.clear()
		this._pointerLeftDownEvents = undefined!
		super.quit()
		EventsManager.instance = undefined!
	}
}
