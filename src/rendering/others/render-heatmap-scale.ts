import { axisBottom, axisLeft, axisRight, format, scaleLinear, scalePoint, select, ticks } from 'd3';

function getSvgWidth(trackId: string, hasYScale: boolean, mirrorYScale: boolean) {
  const trackWrapper = document.getElementById(`${trackId}-heatmap-track-parent`);
  if (!trackWrapper) return;

  // Get parent width for axis range
  const defaultMarginRight = mirrorYScale ? 20 : 10;
  const yScaleWidth = 20;
  const delta = hasYScale ? yScaleWidth + defaultMarginRight : defaultMarginRight;
  const width = trackWrapper.getBoundingClientRect().width - delta;
  return width;
}

export function renderHeatmapXScale(trackId: string, sequenceLength: number, xScaleText: string, hasYScale: boolean, mirrorYScale: boolean) {
  const trackWrapper = document.getElementById(`${trackId}-heatmap-track-parent`);
  if (!trackWrapper) {
    console.warn(`Heatmap track #${trackId}-heatmap-track not found.`);
    return;
  }
  // get parent of "${trackId}-heatmap-track" and append svg below it

  // Remove old chart if it exists
  const existing = trackWrapper.querySelector<SVGSVGElement>('.heatmap-xscale-svg');
  if (existing) existing.remove();

  const width = getSvgWidth(trackId, hasYScale, mirrorYScale);
  if (width === undefined) return;

  const marginLeft = hasYScale ? 20 : 0;

  // Create an SVG below the heatmap
  const svgChart = select(trackWrapper)
    .append('svg')
    .attr('id', `${trackId}-heatmap-xscale`)
    .attr('class', 'heatmap-xscale-svg')
    .attr('width', width)
    .attr('height', 40)
    .style('overflow', 'visible')
    .style('margin-left', marginLeft);

  const start = 1;
  const end = sequenceLength;

  // Define the linear scale
  const x = scaleLinear()
    .domain([0.5, end + 0.5])
    .range([0, width]); //.nice();

  // Compute “nice” ticks, then reinsert 1 and sequenceLength
  const approxTickCount = Math.min(10, Math.floor(sequenceLength / 50) + 2);
  const autoTicks = ticks(1, sequenceLength, approxTickCount);

  // Ensure 1 and sequenceLength are included
  const tickValues = Array.from(new Set([1, ...autoTicks, sequenceLength]))
    .filter((t) => t >= 1 && t <= sequenceLength)
    .sort((a, b) => a - b);

  // const xAxis = axisBottom(x).tickFormat(format('d')).ticks(Math.min(sequenceLength, 10));

  // Create axis with our custom ticks
  const xAxis = axisBottom(x).tickValues(tickValues).tickFormat(format('d'));

  // Append axis group
  const gxAxis = svgChart.append('g').attr('class', 'x-axis').attr('transform', `translate(0, 0)`).call(xAxis);

  // Add labels
  const xAxisTitle = svgChart
    .append('text')
    .attr('x', width / 2)
    .attr('y', 35)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .text(xScaleText);

  // Save references directly on the DOM node for future updates
  (trackWrapper as any).__heatmapXScale = { x, start, end, xAxis, gxAxis, xAxisTitle, svgChart, width, hasYScale, mirrorYScale };
}

/**
 * Updates an existing heatmap X-axis (e.g., on zoom or resize).
 */
export function updateHeatmapXScale(trackId: string, newDomain: [number, number]) {
  const trackEl = document.getElementById(`${trackId}-heatmap-track-parent`);
  if (!trackEl) return;

  const stored = (trackEl as any).__heatmapXScale;
  if (!stored) {
    console.warn(`No heatmap X-scale data found for track #${trackId}`);
    return;
  }
  const { x, xAxis, gxAxis, xAxisTitle, svgChart, hasYScale, mirrorYScale } = stored;
  const [start, end] = newDomain;

  const width = getSvgWidth(trackId, hasYScale, mirrorYScale);
  if (width === undefined) return;

  // Safety check
  if (start >= end) return;

  svgChart.attr('width', width);
  xAxisTitle.attr('x', width / 2);

  // Apply +0.5 offset so ticks are centered over residues
  const adjustedStart = start - 0.5;
  const adjustedEnd = end + 0.5;

  // Update scale domain
  x.domain([adjustedStart, adjustedEnd]).range([0, width]);

  // Compute rounded ticks but preserve exact domain edges
  const approxTickCount = Math.min(10, Math.floor((end - start) / 50) + 2);
  const autoTicks = ticks(start, end, approxTickCount);

  const tickValues = Array.from(new Set([start, ...autoTicks, end]))
    .filter((t) => t >= start && t <= end)
    .map((t) => Math.round(t))
    .sort((a, b) => a - b);

  // Update axis ticks and re-render
  xAxis.tickValues(tickValues).tickFormat(format('d'));
  gxAxis.transition().duration(200).call(xAxis);

  // Optionally store the updated state
  stored.x = x;
  stored.xAxis = xAxis;
  stored.gxAxis = gxAxis;
  stored.start = start;
  stored.end = end;
}

export function renderHeatmapYScale(trackId: string, yDomain: string[], trackHeight: number, yScaleText: string, heatmapType?: string, mirrorYScale?: boolean) {
  if (heatmapType !== 'PDBeLigands') {
    const wrapper = document.getElementById(`${trackId}-yscale-wrapper`);
    if (!wrapper) {
      console.warn(`Y scale wrapper #${trackId}-yscale-wrapper not found.`);
      return;
    }

    // Remove old Y-axis if re-rendering
    wrapper.querySelectorAll<SVGSVGElement>('.heatmap-yscale-svg').forEach((el) => el.remove());

    // Create shared Y scale
    const yUnit = trackHeight / yDomain.length / 2;
    const y = scalePoint()
      .domain(yDomain)
      .range([yUnit, trackHeight - yUnit])
      .padding(0);

    const svgLeft = select(wrapper)
      .insert('svg', ':first-child') // prepend
      .attr('class', 'heatmap-yscale-svg heatmap-yscale-left')
      .attr('width', 20)
      .attr('height', trackHeight)
      .style('z-index', 8)
      .style('background', '#ffffff80')
      .style('overflow', 'visible');

    const yAxisLeft = axisLeft(y);
    const gyAxisLeft = svgLeft
      .append('g')
      .attr('class', 'y-axis-left')
      .attr('transform', 'translate(20, 0)') // adjust to line up neatly
      .call(yAxisLeft);

    svgLeft
      .append('text')
      .attr('x', -trackHeight / 2)
      .attr('y', 0)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(yScaleText);

    // eslint-disable-next-line prefer-const
    const heatmapYScale: any = {
      y,
      yAxisLeft,
      yAxisRight: undefined,
      gyAxisLeft,
      gyAxisRight: undefined,
      svgLeft,
      svgRight: undefined,
      trackHeight,
      yDomain,
    };
    if (mirrorYScale) {
      /** ───────────── RIGHT AXIS ───────────── */
      const svgRight = select(wrapper)
        .append('svg') // append to end
        .attr('class', 'heatmap-yscale-svg heatmap-yscale-right')
        .attr('width', 20)
        .attr('height', trackHeight)
        .style('z-index', 8)
        .style('background', '#ffffff80')
        .style('overflow', 'visible');

      const yAxisRight = axisRight(y);
      const gyAxisRight = svgRight
        .append('g')
        .attr('class', 'y-axis-right')
        .attr('transform', 'translate(0, 0)') // small offset
        .call(yAxisRight);
      heatmapYScale['yAxisRight'] = yAxisRight;
      heatmapYScale['gyAxisRight'] = gyAxisRight;
      heatmapYScale['svgRight'] = svgRight;
    }
    (wrapper as any).__heatmapYScale = heatmapYScale;
  }
}
