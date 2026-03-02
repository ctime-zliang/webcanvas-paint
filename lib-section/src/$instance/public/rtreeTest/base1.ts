import { RtreeDebug_profile } from '../../../algorithm/rtree2/config'
import {
	RtreeDebug_appendContainerViewArea,
	RtreeDebug_appendRectViewSection,
	RtreeDebug_updateRectangleAuxiliary,
} from '../../../algorithm/rtree2/debug'
import { RTree } from '../../../algorithm/rtree2/Rtree'

export function rtreeTest1() {
	const rtree: RTree = new RTree(3)

	const data00: { id: string } = { id: '000' }
	const data01: { id: string } = { id: '001' }
	const data02: { id: string } = { id: '002' }
	const data03: { id: string } = { id: '003' }
	const data04: { id: string } = { id: '004' }
	const data05: { id: string } = { id: '005' }
	const data16: { id: string } = { id: '016' }
	const TestGetData: Array<[{ x: number; y: number; w: number; h: number }, { id: string }]> = [
		[{ x: 100, y: 100, w: 100, h: 100 }, data00],
		[{ x: 250, y: 250, w: 100, h: 100 }, data01],
		[{ x: 150, y: 400, w: 100, h: 100 }, data02],
		[{ x: 300, y: 50, w: 100, h: 100 }, data03],
		[{ x: 400, y: 350, w: 100, h: 100 }, data04],
		[{ x: 450, y: 150, w: 100, h: 100 }, data05],
		[{ x: 650, y: 200, w: 100, h: 100 }, { id: '006' }],
		[{ x: 800, y: 100, w: 100, h: 100 }, { id: '007' }],
		[{ x: 850, y: 300, w: 100, h: 100 }, { id: '008' }],
		[{ x: 700, y: 450, w: 100, h: 100 }, { id: '009' }],
		[{ x: 550, y: 500, w: 100, h: 100 }, { id: '010' }],
		[{ x: 350, y: 600, w: 100, h: 100 }, { id: '011' }],
		[{ x: 50, y: 550, w: 100, h: 100 }, { id: '012' }],
		[{ x: 800, y: 650, w: 100, h: 100 }, { id: '013' }],
		[{ x: 500, y: 700, w: 100, h: 100 }, { id: '014' }],
		[{ x: 900, y: 500, w: 100, h: 100 }, { id: '015' }],
		[{ x: 100, y: 100, w: 100, h: 100 }, data16],
	]

	if (RtreeDebug_profile.isEnableDebug) {
		RtreeDebug_appendRectViewSection(TestGetData, RtreeDebug_profile.debugContainerId)
	}

	TestGetData.forEach((v: [{ x: number; y: number; w: number; h: number }, { id: string }], i) => {
		rtree.insertItemData(v[0], v[1] as any)
		//@ts-ignore
		rbush.insert(v[0], v[1] as any)
	})

	const targetRect1 = { x: 50, y: 50, w: 500, h: 500 }
	RtreeDebug_updateRectangleAuxiliary('SEARCH', targetRect1 as any, 'blue')
	const result1 = rtree.search(targetRect1)
	console.log('区域搜索仅返回绑定数据', result1)
	const result2 = rtree.search(targetRect1)
	console.log('区域搜索返回叶子节点', result2)
	const result3 = rtree.search({ x: 150, y: 150, w: 0, h: 0 })
	console.log('点搜索仅返回绑定数据', result3)

	console.log(rtree)
}
