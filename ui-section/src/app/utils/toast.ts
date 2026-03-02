import { toast } from 'react-toastify'

export function topCenterInfoToast(msg: string): void {
	toast.info(msg, {
		position: 'top-center',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function topCenterSuccessToast(msg: string): void {
	toast.success(msg, {
		position: 'top-center',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function bottomRightInfoToast(msg: string): void {
	toast.info(msg, {
		position: 'bottom-right',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function bottomRightSuccessToast(msg: string): void {
	toast.success(msg, {
		position: 'bottom-right',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function topRightInfoToast(msg: string): void {
	toast.info(msg, {
		position: 'top-right',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function topRightSuccessToast(msg: string): void {
	toast.success(msg, {
		position: 'top-right',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}

export function topRightErrorToast(msg: string): void {
	toast.error(msg, {
		position: 'top-right',
		autoClose: 3000,
		hideProgressBar: true,
		draggable: false,
		theme: 'dark',
	})
}
