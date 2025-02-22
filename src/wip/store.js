import React from "react";
import _ from "lodash";
import { faker } from "@wp-g2/protokit";
import { ui } from "@wp-g2/styles";
import queryString from "query-string";
import flatten from "flat";

import { createStore, shallowCompare } from "@wp-g2/substate";

const DATA_TYPES = {
	boolean: "boolean",
	text: "text",
	textArray: "textArray",
	array: "array"
};

const colorSchema = () => {
	const color = faker.commerce.color();
	return {
		slug: color,
		color: ui.color(color).toHexString()
	};
};

const gradientSchema = () => {
	const color1 = faker.commerce.color();
	const color2 = faker.commerce.color();

	return {
		slug: `${color1}-${color2}`,
		gradient: `linear-gradient(${ui.color(color1).toHexString()} 0%, ${ui
			.color(color2)
			.toHexString()} 100%)`
	};
};

const fontSizeSchema = () => {
	const data = faker.random.arrayElement([
		{
			slug: "x-small",
			size: 10
		},
		{
			slug: "small",
			size: 14
		},
		{
			slug: "medium",
			size: 16
		},
		{
			slug: "large",
			size: 20
		},
		{
			slug: "x-large",
			size: 32
		}
	]);

	return data;
};

/**
 * Source:
 * https://github.com/WordPress/gutenberg/blob/d4d083083306de27675eee3eed24c8cfd9bd80d5/docs/designers-developers/developers/themes/theme-json.md#settings
 */
const __initialState__ = [
	{
		key: "settings.defaults.color.custom",
		category: "settings.defaults.color",
		type: DATA_TYPES.boolean,
		value: true,
		label: "Custom",
		description: "Enable custom colors"
	},
	{
		key: "settings.defaults.color.customGradient",
		category: "settings.defaults.color",
		type: DATA_TYPES.boolean,
		value: true,
		label: "Custom Gradient",
		description: "Enable custom gradient colors"
	},
	{
		key: "settings.defaults.color.link",
		category: "settings.defaults.color",
		type: DATA_TYPES.boolean,
		value: false,
		label: "Link",
		description: "Enable custom link colors"
	},

	{
		key: "settings.defaults.color.palette",
		category: "settings.defaults.color",
		type: DATA_TYPES.array,
		value: [],
		valueOf: [
			{
				key: "slug",
				label: "Slug",
				type: "text"
			},
			{
				key: "color",
				label: "Color",
				type: "color"
			}
		],
		schema: "color",
		label: "Palette",
		description: "Add custom color presets"
	},
	{
		key: "settings.defaults.color.gradients",
		category: "settings.defaults.color",
		type: DATA_TYPES.array,
		value: [],
		valueOf: [
			{
				key: "slug",
				label: "Slug",
				type: "text"
			},
			{
				key: "gradient",
				label: "Gradient",
				type: "textarea"
			}
		],
		schema: "gradient",
		label: "Gradient",
		description: "Add custom gradient presets"
	},
	{
		key: "settings.defaults.spacing.customPadding",
		category: "settings.defaults.spacing",
		type: DATA_TYPES.boolean,
		value: true,
		label: "Custom Padding",
		description: "Enable padding controls"
	},
	{
		key: "settings.defaults.spacing.units",
		category: "settings.defaults.spacing",
		type: DATA_TYPES.textArray,
		value: ["px", "em", "rem", "vh", "vw"],
		label: "Units",
		description: "Filters unit values"
	},
	{
		key: "settings.defaults.typography.customFontSize",
		category: "settings.defaults.typography",
		type: DATA_TYPES.boolean,
		value: true,
		label: "Custom Font Sizes",
		description: "Enable custom font sizes"
	},
	{
		key: "settings.defaults.typography.customLineHeight",
		category: "settings.defaults.typography",
		type: DATA_TYPES.boolean,
		value: false,
		label: "Custom Line Height",
		description: "Enable custom line height controls"
	},
	{
		key: "settings.defaults.typography.dropCap",
		category: "settings.defaults.typography",
		type: DATA_TYPES.boolean,
		value: true,
		label: "Dropcap",
		description: "Enable drop cap controls"
	},
	{
		key: "settings.defaults.typography.fontSizes",
		category: "settings.defaults.typography",
		type: DATA_TYPES.array,
		value: [],
		valueOf: [
			{
				key: "slug",
				label: "Slug",
				type: "text"
			},
			{
				key: "size",
				label: "Size",
				type: "text"
			}
		],
		schema: "fontSize",
		label: "Font Sizes",
		description: "Add custom font sizes"
	}
];

const categories = [
	{
		key: "settings.defaults.color",
		label: "Color"
	},
	{
		key: "settings.defaults.spacing",
		label: "Spacing"
	},
	{
		key: "settings.defaults.typography",
		label: "Typography"
	}
];

const initialState = JSON.parse(JSON.stringify(__initialState__));

export const useCategoriesStore = createStore(set => ({
	categories
}));

export const useCategories = () =>
	useCategoriesStore(state => state.categories);

export const useStore = createStore(set => ({
	config: initialState,
	categories,
	schemas: {
		color: colorSchema,
		gradient: gradientSchema,
		fontSize: fontSizeSchema
	},
	update: data => {
		const flatData = flatten(data);
		const nextEntries = Object.keys(flatData);
		let thing = initialState;

		/**
		 * VERY WIP
		 */
		nextEntries.forEach(key => {
			const value = flatData[key];
			let [index, ...paths] = key.split(".").reverse();
			paths = paths.reverse();

			if (isNaN(Number(index))) {
				paths.push(index);
				index = undefined;
			} else {
				index = Number(index);
			}
			paths = paths.join(".");

			thing.map(entry => {
				if (entry.key === paths) {
					if (index === undefined) {
						return { ...entry, value };
					}
					console.log({ ...entry, value: (entry.value[index] = value) });
					return { ...entry, value: (entry.value[index] = value) };
				} else {
					return entry;
				}
			});
		});
	},
	updateProp: ({ prop, value: next }) => {
		set(prev => {
			return {
				config: prev.config.map(entry => {
					if (entry.key === prop) {
						return { ...entry, value: next };
					}
					return entry;
				})
			};
		});
	}
}));

export const useConfig = () => {
	return useStore(
		React.useCallback(state => state.config, []),
		shallowCompare
	);
};

export const useConfigProp = prop => {
	return useStore(
		React.useCallback(
			state => {
				const value = state.config.find(entry => entry.key === prop);

				const update = next => {
					state.updateProp({ prop, value: next });
				};

				return [value, update];
			},
			[prop]
		),
		shallowCompare
	);
};

export const useConfigPropArray = prop => {
	return useStore(
		React.useCallback(
			state => {
				const entry = state.config.find(entry => entry.key === prop);

				const update = ({ value: next, index }) => {
					state.updateProp({
						prop,
						value: entry.value.map((v, i) => {
							if (i === index) {
								return { ...v, ...next };
							}
							return v;
						})
					});
				};

				const add = () => {
					const nextSchema = state.schemas[entry.schema];
					if (nextSchema) {
						state.updateProp({
							prop,
							value: [...entry.value, nextSchema()]
						});
					}
				};

				const remove = ({ index }) => {
					state.updateProp({
						prop,
						value: entry.value.filter((v, i) => i !== index)
					});
				};

				return [entry, update, add, remove];
			},
			[prop]
		),
		shallowCompare
	);
};

export const useConfigJson = () => {
	return useStore(
		React.useCallback(state => {
			const configJson = {};

			state.config.forEach(entry => {
				_.set(configJson, entry.key, entry.value);
			});

			return configJson;
		}, []),
		shallowCompare
	);
};

export const useUrlSync = () => {
	const store = useConfig;

	React.useEffect(() => {
		const { config } = queryString.parse(window.location.search);

		if (config) {
			let encoded = decodeURIComponent(config);
			try {
				encoded = JSON.parse(atob(encoded));
				store.setState(prev => ({ ...prev, config: encoded, hasChange: true }));
			} catch (err) {
				console.log("Could not load config");
			}
		}

		const unsubSync = store.subscribe(state => {
			if (!state.hasChange) {
				window.history.pushState(null, null, `?config`);
			} else {
				const nextConfig = encodeURIComponent(
					btoa(JSON.stringify(state.config))
				);
				window.history.pushState(null, null, `?config=${nextConfig}`);
			}
		});

		return () => {
			unsubSync();
		};
	}, [store]);
};
