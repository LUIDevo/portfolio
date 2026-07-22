/* ---------------------------------------------------------------------------
   charts.js — small chart renderer for blog posts.

   Two forms: renderLineChart(el, cfg) and renderBarChart(el, cfg).
   Mark specs: 2px lines with 8px end markers ringed in the surface color,
   bars capped under 24px with a rounded data-end and a square baseline,
   hairline solid gridlines, direct labels only at line ends and bar tips.
   Every chart gets a hover tooltip and a collapsible data table.
   Colors come from CSS custom properties (--series-*, --chart-*) declared
   by the host page, so the site's light/dark toggle themes charts for free.
--------------------------------------------------------------------------- */

(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function seriesColor(i) {
    return 'var(--series-' + (i + 1) + ')';
  }

  function resolvedSeriesColor(el, i) {
    return getComputedStyle(el).getPropertyValue('--series-' + (i + 1)).trim();
  }

  function niceTicks(min, max, count) {
    var span = max - min;
    var step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10;
    else if (err >= 3.5) step *= 5;
    else if (err >= 1.5) step *= 2;
    var ticks = [];
    var start = Math.floor(min / step) * step;
    var end = Math.ceil(max / step) * step;
    for (var v = start; v <= end + step * 1e-9; v += step) {
      ticks.push(Math.round(v * 1e9) / 1e9);
    }
    return ticks;
  }

  function fmt(n) {
    if (Math.abs(n) >= 1000) return n.toLocaleString('en-US');
    return String(Math.round(n * 100) / 100);
  }

  function makeTooltip(container) {
    var tt = document.createElement('div');
    tt.className = 'chart-tooltip';
    container.appendChild(tt);
    return tt;
  }

  function placeTooltip(tt, container, x, y) {
    var cw = container.clientWidth;
    var tw = tt.offsetWidth;
    var left = x + 14;
    if (left + tw > cw - 8) left = x - tw - 14;
    tt.style.left = left + 'px';
    tt.style.top = Math.max(4, y - tt.offsetHeight / 2) + 'px';
    tt.style.opacity = '1';
  }

  function header(container, cfg) {
    if (cfg.title) {
      var t = document.createElement('p');
      t.className = 'chart-title';
      t.textContent = cfg.title;
      container.appendChild(t);
    }
    if (cfg.subtitle) {
      var s = document.createElement('p');
      s.className = 'chart-subtitle';
      s.textContent = cfg.subtitle;
      container.appendChild(s);
    }
  }

  function legend(container, names) {
    if (names.length < 2) return; // one series: the title names it
    var box = document.createElement('div');
    box.className = 'chart-legend';
    names.forEach(function (name, i) {
      var key = document.createElement('span');
      key.className = 'key';
      var sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = seriesColor(i);
      key.appendChild(sw);
      key.appendChild(document.createTextNode(name));
      box.appendChild(key);
    });
    container.appendChild(box);
  }

  function dataTable(container, cfg, headers, rows) {
    var details = document.createElement('details');
    details.className = 'chart-data';
    var summary = document.createElement('summary');
    summary.textContent = 'View data as table';
    details.appendChild(summary);
    var table = document.createElement('table');
    table.className = 'chart-table';
    var thead = document.createElement('tr');
    headers.forEach(function (h) {
      var th = document.createElement('th');
      th.textContent = h;
      thead.appendChild(th);
    });
    table.appendChild(thead);
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      r.forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    details.appendChild(table);
    container.appendChild(details);
  }

  /* ---- line chart ----------------------------------------------------------
     cfg: { title, subtitle, xLabel, xUnit, x: [..], series: [{name, values: [..]}] }
  ---------------------------------------------------------------------------- */
  global.renderLineChart = function (container, cfg) {
    var W = 640, H = 340;
    var pad = { top: 16, right: 96, bottom: 34, left: 46 };
    var pw = W - pad.left - pad.right;
    var ph = H - pad.top - pad.bottom;

    header(container, cfg);
    legend(container, cfg.series.map(function (s) { return s.name; }));

    var allVals = [];
    cfg.series.forEach(function (s) { allVals = allVals.concat(s.values); });
    var yMin = Math.min.apply(null, allVals);
    var yMax = Math.max.apply(null, allVals);
    var yPad = (yMax - yMin) * 0.05;
    var yTicks = niceTicks(yMin - yPad, yMax + yPad, 5);
    yMin = yTicks[0];
    yMax = yTicks[yTicks.length - 1];

    var xMin = cfg.x[0], xMax = cfg.x[cfg.x.length - 1];
    function sx(v) { return pad.left + (v - xMin) / (xMax - xMin) * pw; }
    function sy(v) { return pad.top + (1 - (v - yMin) / (yMax - yMin)) * ph; }

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    if (cfg.title) svg.setAttribute('aria-label', cfg.title);

    // gridlines: hairline, solid, recessive
    yTicks.forEach(function (t) {
      svg.appendChild(svgEl('line', {
        x1: pad.left, x2: pad.left + pw, y1: sy(t), y2: sy(t),
        stroke: 'var(--chart-grid)', 'stroke-width': 1
      }));
      var lbl = svgEl('text', { x: pad.left - 8, y: sy(t) + 3.5, 'text-anchor': 'end' });
      lbl.textContent = fmt(t);
      svg.appendChild(lbl);
    });

    // baseline
    svg.appendChild(svgEl('line', {
      x1: pad.left, x2: pad.left + pw, y1: pad.top + ph, y2: pad.top + ph,
      stroke: 'var(--chart-axis)', 'stroke-width': 1
    }));

    // x ticks: every point when there are few enough to fit; else first/middle/last
    var xTickIdx = cfg.x.length <= 6
      ? cfg.x.map(function (_, i) { return i; })
      : [0, Math.floor((cfg.x.length - 1) / 2), cfg.x.length - 1];
    xTickIdx.forEach(function (i) {
      var lbl = svgEl('text', {
        x: sx(cfg.x[i]), y: pad.top + ph + 22,
        'text-anchor': i === 0 ? 'start' : (i === cfg.x.length - 1 ? 'end' : 'middle')
      });
      lbl.textContent = fmt(cfg.x[i]) + (cfg.xUnit ? ' ' + cfg.xUnit : '');
      svg.appendChild(lbl);
    });

    // lines + end markers + direct end labels
    cfg.series.forEach(function (s, si) {
      var d = s.values.map(function (v, i) {
        return (i === 0 ? 'M' : 'L') + sx(cfg.x[i]).toFixed(1) + ' ' + sy(v).toFixed(1);
      }).join(' ');
      svg.appendChild(svgEl('path', {
        d: d, fill: 'none', stroke: seriesColor(si),
        'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      }));
      var lastX = sx(cfg.x[cfg.x.length - 1]);
      var lastY = sy(s.values[s.values.length - 1]);
      // 2px surface ring under an 8px marker
      svg.appendChild(svgEl('circle', { cx: lastX, cy: lastY, r: 6, fill: 'var(--chart-surface)' }));
      svg.appendChild(svgEl('circle', { cx: lastX, cy: lastY, r: 4, fill: seriesColor(si) }));
      var lbl = svgEl('text', { x: lastX + 10, y: lastY + 4, 'class': 'direct-label' });
      lbl.textContent = s.name;
      svg.appendChild(lbl);
    });

    // hover layer: crosshair + tooltip snapped to nearest x
    var crosshair = svgEl('line', {
      y1: pad.top, y2: pad.top + ph, stroke: 'var(--chart-axis)',
      'stroke-width': 1, opacity: 0
    });
    svg.appendChild(crosshair);
    var hoverDots = cfg.series.map(function (s, si) {
      var g = svgEl('g', { opacity: 0 });
      g.appendChild(svgEl('circle', { r: 6, fill: 'var(--chart-surface)' }));
      g.appendChild(svgEl('circle', { r: 4, fill: seriesColor(si) }));
      svg.appendChild(g);
      return g;
    });

    var chartBox = document.createElement('div');
    chartBox.style.position = 'relative';
    chartBox.appendChild(svg);
    container.appendChild(chartBox);
    var tt = makeTooltip(chartBox);

    function clearHover() {
      crosshair.setAttribute('opacity', 0);
      hoverDots.forEach(function (g) { g.setAttribute('opacity', 0); });
      tt.style.opacity = '0';
    }

    svg.addEventListener('mousemove', function (e) {
      var rect = svg.getBoundingClientRect();
      var scale = W / rect.width;
      var mx = (e.clientX - rect.left) * scale;
      if (mx < pad.left || mx > pad.left + pw) { clearHover(); return; }
      var best = 0, bestD = Infinity;
      cfg.x.forEach(function (xv, i) {
        var d = Math.abs(sx(xv) - mx);
        if (d < bestD) { bestD = d; best = i; }
      });
      var px = sx(cfg.x[best]);
      crosshair.setAttribute('x1', px);
      crosshair.setAttribute('x2', px);
      crosshair.setAttribute('opacity', 1);
      var html = '<strong>' + fmt(cfg.x[best]) + (cfg.xUnit ? ' ' + cfg.xUnit : '') + '</strong>';
      cfg.series.forEach(function (s, si) {
        var g = hoverDots[si];
        g.setAttribute('transform', 'translate(' + px + ',' + sy(s.values[best]) + ')');
        g.setAttribute('opacity', 1);
        html += '<div class="tt-row"><span class="tt-dot" style="background:' +
          resolvedSeriesColor(container, si) + '"></span>' + s.name + ': ' + fmt(s.values[best]) + '</div>';
      });
      tt.innerHTML = html;
      placeTooltip(tt, chartBox, px / scale, sy(cfg.series[0].values[best]) / scale);
    });
    svg.addEventListener('mouseleave', clearHover);

    dataTable(container, cfg,
      [cfg.xLabel || 'x'].concat(cfg.series.map(function (s) { return s.name; })),
      cfg.x.map(function (xv, i) {
        return [fmt(xv)].concat(cfg.series.map(function (s) { return fmt(s.values[i]); }));
      }));
  };

  /* ---- horizontal bar chart -------------------------------------------------
     cfg: { title, subtitle, unit, items: [{label, value}] }
     Single series: one hue for every bar, value labels at the bar tips.
  ---------------------------------------------------------------------------- */
  global.renderBarChart = function (container, cfg) {
    var W = 640;
    var barH = 22;                 // under the 24px cap
    var gap = 16;
    var pad = { top: 8, right: 70, bottom: 8, left: 120 };
    var H = pad.top + cfg.items.length * (barH + gap) - gap + pad.bottom;
    var pw = W - pad.left - pad.right;

    header(container, cfg);

    var max = Math.max.apply(null, cfg.items.map(function (d) { return d.value; }));
    function sx(v) { return v / max * pw; }

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });
    if (cfg.title) svg.setAttribute('aria-label', cfg.title);

    var chartBox = document.createElement('div');
    chartBox.style.position = 'relative';

    // baseline at zero
    svg.appendChild(svgEl('line', {
      x1: pad.left, x2: pad.left, y1: pad.top - 4, y2: H - pad.bottom + 4,
      stroke: 'var(--chart-axis)', 'stroke-width': 1
    }));

    var tt; // created after append

    cfg.items.forEach(function (d, i) {
      var y = pad.top + i * (barH + gap);
      var w = Math.max(sx(d.value), 4);

      // rounded data-end, square baseline
      var path = 'M' + pad.left + ' ' + y +
        ' H' + (pad.left + w - 4) +
        ' Q' + (pad.left + w) + ' ' + y + ' ' + (pad.left + w) + ' ' + (y + 4) +
        ' V' + (y + barH - 4) +
        ' Q' + (pad.left + w) + ' ' + (y + barH) + ' ' + (pad.left + w - 4) + ' ' + (y + barH) +
        ' H' + pad.left + ' Z';
      var bar = svgEl('path', { d: path, fill: 'var(--series-1)' });
      svg.appendChild(bar);

      // category label, left of the baseline — text tokens, never series color
      var cat = svgEl('text', {
        x: pad.left - 10, y: y + barH / 2 + 4, 'text-anchor': 'end'
      });
      cat.textContent = d.label;
      svg.appendChild(cat);

      // value at the tip
      var val = svgEl('text', {
        x: pad.left + w + 8, y: y + barH / 2 + 4, 'class': 'direct-label'
      });
      val.textContent = fmt(d.value) + (cfg.unit ? ' ' + cfg.unit : '');
      svg.appendChild(val);

      // hover: hit target bigger than the mark
      var hit = svgEl('rect', {
        x: pad.left, y: y - gap / 2, width: pw, height: barH + gap,
        fill: 'transparent'
      });
      hit.addEventListener('mousemove', function () {
        bar.setAttribute('opacity', 0.8);
        var rect = svg.getBoundingClientRect();
        var scale = rect.width / W;
        tt.innerHTML = '<strong>' + d.label + '</strong><div>' + fmt(d.value) +
          (cfg.unit ? ' ' + cfg.unit : '') + '</div>';
        placeTooltip(tt, chartBox, (pad.left + w) * scale, (y + barH / 2) * scale);
      });
      hit.addEventListener('mouseleave', function () {
        bar.setAttribute('opacity', 1);
        tt.style.opacity = '0';
      });
      svg.appendChild(hit);
    });

    chartBox.appendChild(svg);
    container.appendChild(chartBox);
    tt = makeTooltip(chartBox);

    dataTable(container, cfg,
      ['Item', cfg.unit ? 'Value (' + cfg.unit + ')' : 'Value'],
      cfg.items.map(function (d) { return [d.label, fmt(d.value)]; }));
  };

})(window);
