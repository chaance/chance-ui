import { useState } from "react";
import logo from "./logo.svg";
import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
} from "@chance/react-accordion";
import "./App.css";
import styles from "./app.module.css";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className={styles.app}>
			<div className={styles.inner}>
				<div className={styles.side}>
					<div className={styles.sideHeader}>
						<a href="./" target="" className={styles.sideHeaderLink}>
							Playtime!
						</a>
					</div>
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
					<div className={styles.storyTree}>
						<section className={styles.storyTreeSection}>
							<h3>Some Stories</h3>
							<ul role="tree" aria-labelledby="tree1">
								<li role="treeitem" aria-expanded="true" tabIndex={-1}>
									<span>Fruits</span>
									<ul role="group">
										<li role="none">
											<a role="treeitem" href="/" tabIndex={-1}>
												Oranges
											</a>
										</li>
										<li role="none">
											<a role="treeitem" href="/" tabIndex={-1}>
												Pineapple
											</a>
										</li>
										<li role="treeitem" aria-expanded="true" tabIndex={-1}>
											<span>Apples</span>
											<ul role="group">
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Macintosh
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Granny Smith
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Fuji
													</a>
												</li>
											</ul>
										</li>
										<li role="none">
											<a role="treeitem" href="/" tabIndex={-1}>
												Bananas
											</a>
										</li>
									</ul>
								</li>
								<li role="treeitem" aria-expanded="false" tabIndex={-1}>
									<span>Vegetables</span>
									<ul role="group">
										<li role="treeitem" aria-expanded="false" tabIndex={-1}>
											<span>Podded Vegetables</span>
											<ul role="group">
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Lentil
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Pea
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Peanut
													</a>
												</li>
											</ul>
										</li>
										<li role="treeitem" aria-expanded="false" tabIndex={-1}>
											<span>Bulb and Stem</span>
											<ul role="group">
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Asparagus
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Celery
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Leek
													</a>
												</li>
											</ul>
										</li>
									</ul>
								</li>
								<li role="treeitem" aria-expanded="false" tabIndex={0}>
									<span>Grains</span>
									<ul role="group">
										<li role="treeitem" aria-expanded="false" tabIndex={-1}>
											<span>Cereal Grains</span>
											<ul role="group">
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Barley
													</a>
												</li>
												<li role="none">
													<a role="treeitem" href="/" tabIndex={-1}>
														Oats
													</a>
												</li>
											</ul>
										</li>
									</ul>
								</li>
							</ul>
						</section>
					</div>
				</div>
				<div className={styles.main}></div>
			</div>
		</div>
	);
}

export default App;
