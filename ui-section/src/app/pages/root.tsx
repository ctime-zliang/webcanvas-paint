import React from 'react'
import { TCommonComponentBaseProps } from '../types/comm.types'
import { EntryList } from './entryList/Index'

function Root(props: TCommonComponentBaseProps): React.ReactElement {
	return (
		<>
			<EntryList />
		</>
	)
}

export default React.memo(Root)
