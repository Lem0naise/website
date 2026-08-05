// Chart.js lifecycle and Daylio-specific analytical chart factories.

(() => {
    const instances = new Map();
    const colours = ['#8b5a83', '#718b75', '#728293', '#a36d74', '#b18452', '#6b647d'];

    function destroy(id) {
        const chart = instances.get(id);
        if (chart) {
            chart.destroy();
            instances.delete(id);
        }
    }

    function canvasFor(id) {
        const canvas = document.getElementById(id);
        if (!canvas || typeof window.Chart === 'undefined') return null;
        return canvas;
    }

    function renderMoodMoving(id, points, onDate) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !points.length) return false;
        const chart = new window.Chart(canvas, {
            type: 'line',
            data: {
                labels: points.map((point) => point.date),
                datasets: [{
                    label: '14-day average mood',
                    data: points.map((point) => point.value),
                    borderColor: '#8b5a83',
                    backgroundColor: 'rgba(139, 90, 131, .12)',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: .28,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450 },
                scales: {
                    x: { ticks: { maxTicksLimit: 8, font: { family: 'Syne Mono', size: 10 } }, grid: { display: false } },
                    y: { min: 1, max: 5, ticks: { stepSize: 1 }, grid: { color: '#e8e6e0' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const point = points[context.dataIndex];
                                return `${point.value.toFixed(2)} average mood from ${point.count} recent entries`;
                            }
                        }
                    }
                },
                onClick(event, activeElements) {
                    if (!activeElements.length) return;
                    onDate(points[activeElements[0].index].date);
                }
            }
        });
        instances.set(id, chart);
        return true;
    }

    function refreshSocialPercentages(chart) {
        const raw = chart.$daylioRaw;
        const visibleIndexes = raw.datasets
            .map((_, index) => index)
            .filter((index) => chart.isDatasetVisible(index));
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            dataset.data = raw.labels.map((_, labelIndex) => {
                const denominator = visibleIndexes.reduce((sum, index) => sum + raw.datasets[index].values[labelIndex], 0);
                return denominator ? (raw.datasets[datasetIndex].values[labelIndex] / denominator) * 100 : 0;
            });
        });
        chart.update();
    }

    function renderSocialShift(id, data, onPeriod) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !data.datasets.length || !data.labels.length) return false;

        const chart = new window.Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.values,
                    backgroundColor: colours[index % colours.length],
                    borderColor: '#fcfaf3',
                    borderWidth: 1,
                    stack: 'social'
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450 },
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: {
                        stacked: true,
                        min: 0,
                        max: 100,
                        ticks: { callback: (value) => `${value}%` },
                        grid: { color: '#e8e6e0' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, font: { family: 'Syne Mono', size: 10 } },
                        onClick(event, legendItem, legend) {
                            const chartInstance = legend.chart;
                            chartInstance.setDatasetVisibility(legendItem.datasetIndex, !chartInstance.isDatasetVisible(legendItem.datasetIndex));
                            refreshSocialPercentages(chartInstance);
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const raw = context.chart.$daylioRaw.datasets[context.datasetIndex].values[context.dataIndex];
                                return `${context.dataset.label}: ${raw} mentions (${context.parsed.y.toFixed(1)}%)`;
                            }
                        }
                    }
                },
                onClick(event, activeElements) {
                    if (!activeElements.length) return;
                    onPeriod(data.labels[activeElements[0].index]);
                }
            }
        });
        chart.$daylioRaw = data;
        refreshSocialPercentages(chart);
        instances.set(id, chart);
        return true;
    }

    function renderCadence(id, points, onSelect) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !points.length) return false;
        const chart = new window.Chart(canvas, {
            data: {
                labels: points.map((point) => point.label || point.key),
                datasets: [
                    {
                        type: 'bar',
                        label: 'Median words',
                        data: points.map((point) => point.medianWords),
                        backgroundColor: 'rgba(139, 90, 131, .58)',
                        yAxisID: 'words'
                    },
                    {
                        type: 'line',
                        label: 'Entries',
                        data: points.map((point) => point.entryCount),
                        borderColor: '#718b75',
                        backgroundColor: '#718b75',
                        pointRadius: 2,
                        tension: .25,
                        yAxisID: 'entries'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                    words: { beginAtZero: true, position: 'left', grid: { color: '#e8e6e0' } },
                    entries: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
                },
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } },
                onClick(event, activeElements) {
                    if (activeElements.length) onSelect(points[activeElements[0].index]);
                }
            }
        });
        instances.set(id, chart);
        return true;
    }

    function renderBar(id, data, options = {}) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !data.length) return false;
        const chart = new window.Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.map((item) => item.label),
                datasets: [{
                    label: options.label || '',
                    data: data.map((item) => item.value),
                    backgroundColor: options.colour || '#728293'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: options.min !== 1, min: options.min, max: options.max, grid: { color: '#e8e6e0' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return options.tooltip ? options.tooltip(data[context.dataIndex]) : `${context.parsed.y}`;
                            }
                        }
                    }
                },
                onClick(event, activeElements) {
                    if (activeElements.length && options.onSelect) options.onSelect(data[activeElements[0].index]);
                }
            }
        });
        instances.set(id, chart);
        return true;
    }

    function renderRadar(id, datasets) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !datasets.length || !datasets.some((dataset) => dataset.values.some((item) => item.value))) return false;
        const labels = datasets[0].values.map((item) => item.label);
        const chart = new window.Chart(canvas, {
            type: 'radar',
            data: {
                labels,
                datasets: datasets.map((dataset, index) => {
                    const color = colours[index % colours.length];
                    return {
                        label: dataset.label,
                        data: dataset.values.map((item) => item.value),
                        borderColor: color,
                        backgroundColor: `${color}2e`,
                        pointBackgroundColor: color
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { r: { beginAtZero: true, ticks: { display: false }, grid: { color: '#e8e6e0' } } },
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }
            }
        });
        instances.set(id, chart);
        return true;
    }

    function renderScatter(id, entries, onSelect) {
        destroy(id);
        const canvas = canvasFor(id);
        if (!canvas || !entries.length) return false;
        const points = entries.map((entry, index) => ({
            x: index,
            y: entry.moodScore,
            date: entry.date,
            tone: entry.moodScore >= 4 ? '#718b75' : entry.moodScore <= 2 ? '#a36d74' : '#728293'
        }));
        const chart = new window.Chart(canvas, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Matching entries',
                    data: points,
                    pointRadius: 5,
                    pointBackgroundColor: points.map((point) => point.tone)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { callback: (value) => points[value]?.date || '' }, grid: { display: false } },
                    y: { min: 1, max: 5, ticks: { stepSize: 1 }, grid: { color: '#e8e6e0' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (context) => `${points[context.dataIndex].date} · mood ${context.parsed.y}/5` } }
                },
                onClick(event, activeElements) {
                    if (activeElements.length) onSelect(points[activeElements[0].index].date);
                }
            }
        });
        instances.set(id, chart);
        return true;
    }

    function destroyAll() {
        [...instances.keys()].forEach(destroy);
    }

    window.DaylioCharts = {
        renderMoodMoving, renderSocialShift, renderCadence, renderBar, renderRadar, renderScatter, destroy, destroyAll
    };
})();
