# LwMetricsTrendChart — roadmap

**Scope:** this unit only — vertical monthly bar host, series API, side legend,
tooltip format, a11y table.  
**Not here:** Beacon data/hooks, rolling-window logic, drawer composition, stack
chart, family inventory.  
**Prerequisite:** this file + [`README.md`](./README.md) before unit `*.tsx`.

**Family:** [`../ROADMAP.md`](../ROADMAP.md)

---

## Job

Configurable **time-series bar** metrics surface. Pages pass `categories`
(months, oldest first) and 1–2 series; kit owns the PF `Chart` + `ChartStack` +
`ChartBar` harness.

**Host:** PatternFly Charts Victory `Chart` / `ChartStack` / `ChartBar` with
`ChartVoronoiContainer` + `ChartTooltip` (left-aligned text, fixed flyout width).

**Convention:** [PF Resize Observer](https://www.patternfly.org/components/charts/resize-observer#responsive-bullet-chart-with-wrapping-legend)
— cited from the family roadmap, not redefined here.

---

## Proposed API

```tsx
<LwMetricsTrendChart
  categories={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']}
  series={[{ id: 'shared', label: 'Shared vulnerabilities', data: [2, 5, 9, 14, 18, 23] }]}
  width={400}
  height={180}
  containerRef={containerRef}
  a11yTable={{ caption: '…' }}
/>

// Stacked, with total line
<LwMetricsTrendChart
  series={[
    { id: 'yours', label: 'Your fixes', data: […], fill: … },
    { id: 'others', label: "Other members' fixes", data: […], fill: … },
  ]}
  totalLabel="Total fixes in the network"
/>
```

| Prop               | Role                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `categories`       | X labels (months), oldest first                                       |
| `series`           | 1–2 layers: `id`, `label`, `data: number[]`, optional `fill`          |
| `totalLabel?`      | Adds a "label: sum" line to the tooltip (stacked only)                |
| `width` / `height` | Chart box                                                             |
| `allowTooltip?`    | Default true                                                          |
| `a11yTable?`       | Screen-reader table                                                   |
| `containerRef?`    | Web measure host                                                      |

Decisions (T0 review):

1. **Flyout width:** measured from the longest tooltip line, not a fixed prop.
2. **Series count:** v1 supports 1 or 2 series (single bars, or one stack of two).
   Three or more layers are out of scope until a consumer needs them.
3. **Header / "?" popover:** not part of this unit. Kit rule: domain copy stays in
   product and hydrates slots; PF charts keep titles outside the chart (or in
   `ChartTitle`, which we don't use). The call site composes `LwTitle` +
   `LwPopover` above the chart. The chart stays a pure host.
4. **Fill defaults:** reuse existing `lightwellConfig.colors` entries (palette
   frozen for now); no new tokens.

---

## Phases

| Phase | Deliverable                                                                         | Done when        |
| ----- | ----------------------------------------------------------------------------------- | ---------------- |
| T0    | README + this roadmap; family inventory row; review and consensus                   | Docs agreed      |
| T1    | Shell: bars, side legend, measured tooltip, CSS, barrel export                      | Renders          |
| T2    | A11y table; unit tests (tooltip text, legend, single/stack)                         | Green            |
| T3    | Validate: build, lint, screenshot parity vs. harness C8                             | Matches C8       |

Product wiring (Beacon drawer, hook, rolling window, CTA) is **not** a phase of
this unit — it is family sequencing (`F7` in the family roadmap).
