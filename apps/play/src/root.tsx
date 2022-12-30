import * as React from "react";
import {
	type LoaderFunctionArgs,
	useRouteError,
	isRouteErrorResponse,
	useLoaderData,
	Link,
} from "react-router-dom";
import { json } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { parse as parsePath } from "path-browserify";
import { importStories } from "~/lib/utils";
import type { StoryMeta } from "~/types";
import styles from "./root.module.css";

export const path = "/";

export async function loader({ params }: LoaderFunctionArgs) {
	let stories = await importStories({
		getId: (path) => parsePath(path).name,
		getModuleMap: () => import.meta.glob("./stories/*.(js|jsx|ts|tsx)"),
	});
	let storyMap = new Map<string, StoryMeta[]>();
	for (let story of stories) {
		let meta = { id: story.id, ...story.module.meta };
		if (storyMap.has(meta.group)) {
			storyMap.get(meta.group)?.push(meta);
		} else {
			storyMap.set(meta.group, [meta]);
		}
	}
	return json<LoaderData>({ storyGroups: Array.from(storyMap) });
}

export default function Root() {
	let { storyGroups } = useLoaderData() as LoaderData;
	return (
		<RootLayout
			sidebarHeader={
				<form autoComplete="off" className={styles.searchForm}>
					<input
						type="text"
						id="storybook-explorer-searchfield"
						placeholder='Press "/" to search...'
						aria-label="Search stories"
						className={styles.searchField}
					/>
					<svg viewBox="0 0 1024 1024" className="css-ha8kg">
						<path
							d="M218 670a318 318 0 0 1 0-451 316 316 0 0 1 451 0 318 318 0 0 1 0 451 316 316 0 0 1-451 0m750 240L756 698a402 402 0 1 0-59 60l212 212c16 16 42 16 59 0 16-17 16-43 0-60"
							className="css-kqzqgg"
						/>
					</svg>
					<button
						type="reset"
						value="reset"
						title="Clear search"
						className="css-yd8iva"
					>
						<svg viewBox="0 0 1024 1024" className="css-ha8kg">
							<path
								d="M586.7 512L936 861.4a52.8 52.8 0 0 1-74.6 74.7L512 586.7 162.6 936A52.8 52.8 0 0 1 88 861.4L437.3 512 88 162.6A52.8 52.8 0 1 1 162.6 88L512 437.3 861.4 88a52.8 52.8 0 1 1 74.7 74.7L586.7 512z"
								className="css-kqzqgg"
							/>
						</svg>
					</button>
				</form>
			}
			sidebarBody={
				<section className={styles.storyTreeSection}>
					<h3>Some Stories</h3>
					{storyGroups.length > 0 ? (
						<ul role="tree" aria-labelledby="tree1">
							{storyGroups.map(([group, stories]) => {
								return (
									<li
										role="treeitem"
										aria-expanded="true"
										tabIndex={-1}
										key={group}
									>
										<span>{group}</span>
										<ul role="group">
											{stories.map((story) => {
												return (
													<li role="none" key={story.id}>
														<Link
															role="treeitem"
															to={`/stories/${story.id}`}
															tabIndex={-1}
														>
															{story.name}
														</Link>
													</li>
												);
											})}
										</ul>
									</li>
								);
							})}
						</ul>
					) : null}
				</section>
			}
		>
			<Outlet />
		</RootLayout>
	);
}

export function ErrorBoundary() {
	let error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<RootLayout>
				<h1>Oh No!</h1>
				<p>Status: {error.status}</p>
			</RootLayout>
		);
	}
	return (
		<RootLayout>
			<h1>Oh No!</h1>
			<p>Something went wrong!</p>
		</RootLayout>
	);
}

function RootLayout({
	children,
	sidebarHeader,
	sidebarBody,
}: {
	children: React.ReactNode;
	sidebarHeader?: React.ReactNode;
	sidebarBody?: React.ReactNode;
}) {
	return (
		<div className={styles.outer}>
			<div className={styles.inner}>
				<div className={styles.side}>
					<div className={styles.sideHeader}>
						<a href="./" target="" className={styles.sideHeaderLink}>
							Playtime!
						</a>
					</div>
					{sidebarHeader}
					<div className={styles.storyTree}>{sidebarBody}</div>
				</div>
				<div className={styles.main}>
					<div className={styles.canvas}>{children}</div>
				</div>
			</div>
		</div>
	);
}

type LoaderData = {
	storyGroups: Array<[Group: string, Stories: Array<StoryMeta>]>;
};
