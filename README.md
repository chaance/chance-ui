# Chance UI

I am Chance, and this repository is for building UIs.

Coming soon.

## Development notes

**NOTE:** This all a work in progress and will likely change as I experiment.

Packages may include a number of entrypoints at various levels of composition. For example, a `listbox` package might look something like this:

- `index.ts`
- `listbox-state-chart`: state chart definitions for a listbox component
- `use-listbox.ts`: renderless hook to provide state and props for listbox component parts
- `use-listbox-state.ts`: renderless hook to provide state for listbox component parts
- `use-listbox-props.ts`: renderless hook to provide props for listbox component parts
- `react-listbox.tsx`: rendered React `Listbox` components
