export enum ED2ElementType {
	D2Point = 'D2Point',
	D2AssistLine = 'D2AssistLine',
	D2Line = 'D2Line',
	D2Circle = 'D2Circle',
	D2Arc = 'D2Arc',
	D2Text = 'D2Text',
	D2Image = 'D2Image',
	D2Rect = 'D2Rect',
}

export enum ED2ElementGeometryRelation {
	Intersect = 'Intersect',
	AContainB = 'AContainB',
	BContainA = 'BContainA',
	Separared = 'Separared',
}

export enum ED2ElementUpdateAttr {
	IS_FILP_X = 'isFlipX',
	IS_FILP_Y = 'isFlipY',
	ROTATION = 'rotation',
	STROKE_COLOR = 'strokeColor',
	FILL_COLOR = 'fillColor',
	LINE_CAP = 'lineCap',
	IS_SOLID = 'isSolid',
	ELEMENT_ITEM_NAME = 'elementItemName',
}
