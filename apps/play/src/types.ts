export interface StoryMeta {
	readonly id: string;
	title: string;
	name: string;
	group: string;
	description?: string;
}

export interface StoryModuleMeta extends Omit<StoryMeta, "id"> {}

export interface StoryModule {
	default: React.FunctionComponent;
	meta: StoryModuleMeta;
}

export interface Story {
	id: string;
	module: StoryModule;
	moduleMeta: {
		ext: string;
		path: string;
	};
}
