import { BaseInterface } from '../controller/BaseInterface'

export abstract class Presenter extends BaseInterface {
	constructor() {
		super()
	}

	public abstract notify(...args: Array<any>): void
}
