import { useParams, useSearchParams } from '@solidjs/router';
import { Component, For, Show, createEffect, createSignal } from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { compress } from '../../utils/functions/compressThumb';
import { createStore } from 'solid-js/store';
import { ImageItem } from '../image-components/image-item';
import { itemsOfEachPage } from '../../types/constant';
import { Zoom } from '../image-components/zoom';
import { pageSubject, titleSubject } from '../../utils/subject';
import { Loading } from '../loading';
import { NormalImage } from '../../types/global';

const fs = window.require('fs');

export const Pack: Component = () => {
	const params = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const id = params.id;
	const [imageList, setImageList] = createStore(
		new Array<string>(itemsOfEachPage).fill('')
	);
	const [fileList, setFileList] = createSignal([] as string[]);
	const [srcNum, setSrcNum] = createSignal(-1);
	const [packInfo, setPackInfo] = createStore({} as NormalImage);

	createEffect(() => {
		setImageList(new Array<string>(itemsOfEachPage).fill(''));
		if (!packInfo.id) {
			const pack = galleryOperator.getPackImages(id);
			titleSubject.next(pack?.title || '');
			setPackInfo(pack || {});
		}
		const packPath = packInfo?.path;
		const page = parseInt(searchParams.page || '1');
		if (fs.existsSync(packPath)) {
			if (fileList().length === 0) {
				const imagePathList = fs
					.readdirSync(packPath)
					.filter(
						(e) =>
							(e.endsWith('.jpg') ||
								e.endsWith('.png') ||
								e.endsWith('.jpeg') ||
								e.endsWith('.webp')) &&
							e !== 'thumb.jpg'
					)
					.map((image, index) => {
						return `${packPath}/${image}`;
					}) as string[];
				setFileList(imagePathList);
			}
			pageSubject.next(Math.ceil(fileList().length / itemsOfEachPage));
			fileList()
				.slice((page - 1) * itemsOfEachPage, page * itemsOfEachPage)
				.map((path, index) => {
					compress(path, '', false).then((res) => {
						setImageList(index, res as string);
					});
				});
		}
	});

	createEffect(() => {
		if (srcNum() === -1) {
			return;
		}
		const page = parseInt(searchParams.page || '1');
		const newPage = Math.ceil((srcNum() + 1) / itemsOfEachPage);
		if (page !== newPage) {
			setSearchParams({ page: newPage });
		}
	});

	const handleWheel = (e: WheelEvent) => {
		if (e.deltaY > 0) {
			setSrcNum(srcNum() + 1);
		} else {
			setSrcNum(srcNum() - 1);
		}
	};

	return (
		<>
			<Show when={srcNum() > -1}>
				<Zoom
					src={fileList()[srcNum()]}
					setSrc={setSrcNum}
					handleWheel={handleWheel}
				/>
			</Show>

			<div class="page">
				<For each={imageList}>
					{(e, index) => {
						return (
							<ImageItem
								src={e}
								setZoom={setSrcNum}
								index={index()}
							/>
						);
					}}
				</For>
			</div>
		</>
	);
};
