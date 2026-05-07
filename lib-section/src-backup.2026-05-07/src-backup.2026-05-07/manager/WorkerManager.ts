import { WindowMessageBridge } from '../../../utils-section/messageBus'
import { BaseManager } from './BaseManage'

const PUBLIC_PATH: string = `./worker`

export class WorkerManager extends BaseManager<Worker> {
	private static instance: WorkerManager
	public static getInstance(): WorkerManager {
		if (WorkerManager.instance === undefined) {
			WorkerManager.instance = new WorkerManager()
		}
		return WorkerManager.instance
	}

	private _id: number
	private _busMap: Map<string, WindowMessageBridge>
	constructor() {
		super()
		this._id = 0
		this._busMap = new Map()
	}

	public createWorker(tag: string): { worker: Worker; id: string } {
		const worker: Worker = new Worker(`${PUBLIC_PATH}/${tag}/${tag}.js`)
		if (!worker) {
			throw new Error(`Create Worker Error.`)
		}
		const newId: string = String(++this._id)
		this.items.set(newId, worker)
		return {
			worker,
			id: newId,
		}
	}

	public destroyWorker(id: string): void {
		const worker: Worker = this.items.get(id)!
		if (!worker) {
			return
		}
		worker.terminate()
		this.items.delete(id)
	}

	public quit(): void {
		for (let [id, worker] of this.items) {
			this.destroyWorker(id)
		}
		this._busMap.clear()
		this._busMap = undefined!
		super.quit()
		WorkerManager.instance = undefined!
	}
}
