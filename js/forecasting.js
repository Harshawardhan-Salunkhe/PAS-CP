document.addEventListener('DOMContentLoaded', () => {
    if (typeof forecastsData === 'undefined') return;

    const colors = window.getChartColors();

    // 1. Forecast Chart
    const ctxForecast = document.getElementById('forecastChart');
    let forecastChart;

    function initForecastChart() {
        if (!ctxForecast) return;
        
        // Prepare data. We want the "Actual" line to stop at index 30, and "Predicted" line to go all the way,
        // with "upperBound" and "lowerBound" filling between them.
        
        const labels = forecastsData.timeseries.labels;
        
        const actualData = [...forecastsData.timeseries.actual];
        // pad actual data with nulls so it stops at historical boundary
        while(actualData.length < labels.length) actualData.push(null);

        forecastChart = new Chart(ctxForecast, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual',
                        data: actualData,
                        borderColor: colors.primary,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Forecast',
                        data: forecastsData.timeseries.predicted,
                        borderColor: colors.secondary,
                        borderDash: [5, 5],
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Upper Bound',
                        data: forecastsData.timeseries.upperBound,
                        borderColor: 'transparent',
                        backgroundColor: 'rgba(112, 0, 255, 0.1)',
                        fill: '+1', // fill to lower bound
                        pointRadius: 0,
                        tension: 0.4
                    },
                    {
                        label: 'Lower Bound',
                        data: forecastsData.timeseries.lowerBound,
                        borderColor: 'transparent',
                        backgroundColor: 'transparent',
                        pointRadius: 0,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: { grid: { color: colors.grid } },
                    y: { grid: { color: colors.grid } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    initForecastChart();

    // Model Selector interaction
    const selector = document.getElementById('modelSelector');
    if (selector) {
        selector.addEventListener('change', (e) => {
            const modelName = e.target.value;
            const modelData = forecastsData.comparison.find(m => m.model === modelName);
            if (modelData) {
                document.getElementById('valMAE').innerText = modelData.mae;
                document.getElementById('valRMSE').innerText = modelData.rmse;
                document.getElementById('valMAPE').innerText = modelData.mape + '%';
                document.getElementById('valR2').innerText = modelData.r2;
                
                // Add some animation effect
                document.getElementById('valR2').classList.remove('fade-in-up');
                void document.getElementById('valR2').offsetWidth; 
                document.getElementById('valR2').classList.add('fade-in-up');
            }
        });
    }

    // 2. Time Series Decomposition Charts
    function createDecompChart(ctxId, data, color, title) {
        const ctx = document.getElementById(ctxId);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 60}, (_, i) => i),
                datasets: [{
                    data: data,
                    borderColor: color,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: title, position: 'left', color: colors.text }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    }

    // Generate mock decomposition data
    const len = 60;
    const tData = Array.from({length: len}, (_, i) => i * 0.5); // Trend
    const sData = Array.from({length: len}, (_, i) => Math.sin(i * 0.5) * 10); // Seasonality
    const rData = Array.from({length: len}, () => (Math.random() - 0.5) * 5); // Residual
    const oData = Array.from({length: len}, (_, i) => tData[i] + sData[i] + rData[i]); // Observed

    createDecompChart('decompObserved', oData, colors.primary, 'Observed');
    createDecompChart('decompTrend', tData, '#ffffff', 'Trend');
    createDecompChart('decompSeasonal', sData, colors.secondary, 'Seasonal');
    createDecompChart('decompResidual', rData, '#ff3d00', 'Residual');

});
