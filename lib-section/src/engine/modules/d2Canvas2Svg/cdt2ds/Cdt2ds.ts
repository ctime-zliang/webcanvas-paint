import { createCells } from '../../../algorithm/faceIndex/FaceIndex'
import { createTriangulation, Triangulation } from '../../../algorithm/triangulation/Triangulation'
import { monotoneTriangulates } from '../../../algorithm/monotoneTriangulates/MonotoneTriangulates'
import { TD2EdgeItem, TD2PointItem, TD2TriangleIndicesItem } from '../../../types/Common'

export class Cdt2ds {
	static process(points: Array<TD2PointItem>, edges: Array<TD2EdgeItem>): Array<TD2TriangleIndicesItem> {
		const cells: Array<TD2TriangleIndicesItem> = monotoneTriangulates(points, edges)
		const triangulation: Triangulation = createTriangulation(points.length, edges)
		/**
		 * 将凸包三角剖分的三角形顶点列表依次增加到三角剖分数据结构类实例中
		 */
		for (let i: number = 0; i < cells.length; i++) {
			triangulation.addTriangle(cells[i][0], cells[i][1], cells[i][2])
		}
		return createCells(triangulation)
	}
}
