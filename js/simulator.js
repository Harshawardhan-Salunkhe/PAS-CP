document.addEventListener('DOMContentLoaded', () => {
    const colors = window.getChartColors();

    const simProduct = document.getElementById('simProduct');
    const simPrice = document.getElementById('simPrice');
    const simDiscount = document.getElementById('simDiscount');
    const simFestival = document.getElementById('simFestival');
    const simDay = document.getElementById('simDay');

    const simPriceVal = document.getElementById('simPriceVal');
    const simDiscountVal = document.getElementById('simDiscountVal');
    const predDemand = document.getElementById('predDemand');
    const predChange = document.getElementById('predChange');

    const baseDemand = 427;
    const basePrice = 500;

    const ctxSim = document.getElementById('simChart');
    let simChart;

    function initChart() {
        if (!ctxSim) return;
        simChart = new Chart(ctxSim, {
            type: 'bar',
            data: {
                labels: ['Current', 'Simulated'],
                datasets: [{
                    label: 'Demand (Units)',
                    data: [baseDemand, baseDemand],
                    backgroundColor: [colors.grid, colors.primary],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: colors.grid }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    initChart();

    function calculateDemand() {
        const elasticity = parseFloat(simProduct.value); // 1 = high, 0.5 = low
        const price = parseFloat(simPrice.value);
        const discount = parseFloat(simDiscount.value);
        const festivalMult = parseFloat(simFestival.value);
        const dayMult = parseFloat(simDay.value);

        // Calculate effective price
        const effectivePrice = price * (1 - (discount / 100));
        
        // Elasticity formula: demand = base * (basePrice / effectivePrice)^elasticity
        // Avoid division by zero
        let priceEffect = 1;
        if(effectivePrice > 0) {
            priceEffect = Math.pow((basePrice / effectivePrice), elasticity);
        }

        let demand = baseDemand * priceEffect * festivalMult * dayMult;
        
        // Add some small random noise to make it feel "real"
        demand = demand * (1 + (Math.random() * 0.02 - 0.01));
        
        return Math.max(0, Math.round(demand));
    }

    function updateSimulation() {
        const newDemand = calculateDemand();
        
        // Animate counter
        animateValue(predDemand, parseInt(predDemand.innerText) || baseDemand, newDemand, 500);

        const changePct = ((newDemand - baseDemand) / baseDemand) * 100;
        
        if (changePct > 0) {
            predChange.innerText = `+${changePct.toFixed(1)}%`;
            predChange.style.color = "var(--positive)";
        } else if (changePct < 0) {
            predChange.innerText = `${changePct.toFixed(1)}%`;
            predChange.style.color = "var(--negative)";
        } else {
            predChange.innerText = "0.0%";
            predChange.style.color = "var(--text-secondary)";
        }

        if (simChart) {
            simChart.data.datasets[0].data[1] = newDemand;
            simChart.update();
        }
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = Math.floor(progress * (end - start) + start);
            obj.innerHTML = `${val} <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">units</span>`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const inputs = [simProduct, simPrice, simDiscount, simFestival, simDay];
    
    inputs.forEach(el => {
        if(!el) return;
        el.addEventListener('input', (e) => {
            if (e.target.id === 'simPrice') simPriceVal.innerText = e.target.value;
            if (e.target.id === 'simDiscount') simDiscountVal.innerText = e.target.value + '%';
            updateSimulation();
        });
    });

    // Initial update
    setTimeout(updateSimulation, 500);
});
