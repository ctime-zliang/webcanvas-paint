import React from 'react'
import styles from './Index.module.less'
import { TListItem, TMenuItem } from './data'
import { MenuItem } from './MenuItem'

export type TListItemProps = TListItem & {
	title: string
	menus: Array<TMenuItem>
	onClick?: (id: string) => void
}
export function ListItem(props: TListItemProps): React.ReactElement {
	const { title, menus, onClick } = props
	return (
		<div className={styles['listitem-container']}>
			<div className={styles['listitem-wrapper']}>
				<div className={styles['listitem-title-wrapper']}>
					<span>{title}</span>
				</div>
				<div className={styles['listitem-content-wrapper']}>
					{menus.map((menuItem: TMenuItem, index: number): React.ReactElement => {
						return (
							<div className={styles['listitem-content-item']} key={menuItem.id}>
								<MenuItem
									key={menuItem.id}
									title={menuItem.title}
									id={menuItem.id}
									description={menuItem.description}
									iframeUrl={menuItem.iframeUrl}
									onClick={onClick}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
