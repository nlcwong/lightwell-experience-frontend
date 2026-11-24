# LwMetricsDonutChart — roadmap

**Scope:** this unit only — PF `ChartDonut` host, series API, colors, tooltips,
web container ref.  
**Not here:** Lens report types, coverage copy, stack chart, family inventory.  
**Prerequisite:** this file + [`README.md`](./README.md) before unit `*.tsx`.

**Family:** [`../ROADMAP.md`](../ROADMAP.md) · Extract plan:
[`../examples/lens-coverage-layout-extract.md`](../examples/lens-coverage-layout-extract.md)

---

## Job

Configurable **donut / utilization** metrics surface. Pages pass series + labels;
kit owns PF chart harness and default match-status color scale.

**Host:** PatternFly Charts `ChartDonut` (Victory). Optional wrapping `div` for
resize-observer call sites (ref on container).

**Convention:** [PF Resize Observer](https://www.patternfly.org/components/charts/resize-observer#responsive-bullet-chart-with-wrapping-legend)
— call site measures width; unit renders at given `width` / `height`.

---

## Proposed API

```tsx
<LwMetricsDonutChart
  data={[
    { x: 'Exact match', y: 60 },
    { x: 'Partial match', y: 15 },
    { x: 'No match', y: 25 },
  ]}
  width={320}
  height={280}
  title='75%'
  subTitle='packages matched'
  containerRef={containerRef}
/>
```

| Prop                  | Role                                                |
| --------------------- | --------------------------------------------------- |
| `data`                | `{ x, y }[]` slices                                 |
| `width` / `height`    | Chart box                                           |
| `title` / `subTitle?` | Center labels                                       |
| `colorScale?`         | Default: match-status exact → partial → none        |
| `allowTooltip?`       | Default true                                        |
| `getLabel?`           | Tooltip label fn                                    |
| `innerData?`          | Optional nested inner-ring slices (`{ x, y }[]`)    |
| `innerColorScale?`    | Inner-ring colors (use `'transparent'` for padding) |
| `innerGetLabel?`      | Inner-ring tooltip label fn                         |
| `innerAriaDesc?`      | Inner-ring a11y description                         |
| `containerRef?`       | Web measure host                                    |
| `ariaDesc?`           | A11y                                                |

**Nested ring:** when `innerData` is set, the unit renders a second concentric
`ChartDonut` inside the main one (shared center/SVG, smaller radius with a gap), and moves
the center `title`/`subTitle` to the inner ring. Both rings use `padAngle={0}` and the same
`startAngle`/order so a caller can align inner segments under an outer slice by padding the
inner series (transparent segments) to the same total. Kit stays generic — the caller owns
the series, colors, and alignment padding.

---

## Phases

| Phase | Deliverable                                                           | Done when |
| ----- | --------------------------------------------------------------------- | --------- |
| D0    | README + this roadmap                                                 | Docs      |
| D1    | Shell + defaults + unit test                                          | Green     |
| D2    | Barrel; Lens CoverageReport compose; thin Lens `MatchDonutChart` wrap | Replace   |

**Progress:** D0 → D2 in extract pass.
