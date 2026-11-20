# LwMetricsTrendChart

> **Status:** planned (docs only — no `*.tsx` yet) · Unit roadmap: [`ROADMAP.md`](./ROADMAP.md) · Family: [`../ROADMAP.md`](../ROADMAP.md)

## Why it exists

Reusable **over-time** metrics surface: one or two series of monthly bars with a
legend beside the chart, and month-first tooltips. Beacon's "View Beacon submission trends" drawer is the first
consumer (LWLP-1961); any product that needs a rolling cumulative trend can reuse
it.

Call sites own the data, the month window, all copy (title and "?" help popover,
series labels, tooltip wording), and the fills. Kit owns the PF chart host, layout,
tooltip alignment and sizing, and a11y table.

`LwMetricsStackChart` stays the horizontal category stack. It is a different job
(categories on the y axis, hardcoded "Packages" axis label) and is not changed by
this unit.

## What it can do

| Capability          | Notes                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| Single series       | One bar per month (e.g. shared vulnerabilities)                              |
| Stacked series (2)  | Lower + upper layers per month (e.g. your fixes + other members' fixes)      |
| Legend to the right | Fixed-width side legend; one entry per series                                |
| Tooltips            | Month on the first line, then one line per series, optional total line       |
| A11y table          | Optional structured table for screen readers                                 |
| Fills               | Per-series `fill`; defaults read from `lightwellConfig.colors`               |

## What it does not do

- Render a title or "?" popover — the call site composes `LwTitle` + `LwPopover` above it.
- Fetch data, compute the rolling 6-month window, or own any copy (product).
- Time-window chooser (later; the unit takes `categories` so a chooser can drive it).
- Replace or modify `LwMetricsStackChart`.

## Related

- Stack chart: [`../stack/README.md`](../stack/README.md)
- Drawer host (primitive, unchanged): [`../../../primitives/drawer/drawer.tsx`](../../../primitives/drawer/drawer.tsx)
