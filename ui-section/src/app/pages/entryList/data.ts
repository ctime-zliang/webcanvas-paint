import { canvasIframeLoadURL } from '@/app/config/config'

export enum EModuleTag {
	d2FreeTest = 'd2FreeTest',
	d2SimpleClock = 'd2SimpleClock',
}

export type TMenuItem = {
	title: string
	id: string
	description: string
	iframeUrl: string
}
export type TListItem = {
	title: string
	menus: Array<TMenuItem>
}
export const entryList: Array<TListItem> = [
	{
		title: `Free Test`,
		menus: [
			{
				title: `2D Free Test`,
				id: EModuleTag.d2FreeTest,
				description: `2D Free Test`,
				iframeUrl: canvasIframeLoadURL + `?instance=d2FreeTest`,
			},
			{
				title: `2D Simple Clock`,
				id: EModuleTag.d2SimpleClock,
				description: `2D Simple Clock`,
				iframeUrl: canvasIframeLoadURL + `?instance=simpleClock`,
			},
		],
	},
]
