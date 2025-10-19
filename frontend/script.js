import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const timelineInput = document.getElementById("timelineInput");
const renderTimelineBtn = document.getElementById("renderTimelineBtn");
const outputDiv = document.getElementById("output");
const button = document.getElementById("checkBtn");
const inputArea = document.getElementById("formulaInput");

button.addEventListener("click", async () => {
  const formulas = inputArea.value
    .split("\n")
    .map(f => f.trim())
    .filter(f => f.length > 0);

  if (formulas.length > 0) {
    outputDiv.innerText = "Processing...\nResults will appear here";
    try {
      const result = await checkUnsatCore(formulas);
      outputDiv.innerText = JSON.stringify(result, null, 2);
    } catch (err) {
      outputDiv.innerText = "Error: " + err.message;
    }
  } else {
    outputDiv.innerText = "Please enter at least one formula.\nResults will appear here";
  }
});

renderTimelineBtn.addEventListener("click", () => {
  const csvText = timelineInput.value.trim();
  if (!csvText) {
    alert("Please enter CSV data for the timeline.");
    return;
  }
  try {
    renderTimeline(csvText);
  } catch (err) {
    alert("Error parsing timeline: " + err.message);
  }
});

function renderTimeline(csvText) {
  // --- Parse CSV text ---
  const lines = csvText.trim().split('\n');
  const variables = lines[0].replace(/^#\s*/, '').split(',').map(h => h.trim());

  // Convert rows into numeric arrays
  const csvData = lines.slice(1).map(line =>
    line.split(',').map(v => (v.trim() === '1' ? 1 : 0))
  );

  const timesteps = csvData.length;

  // --- Create Plotly traces ---
  let traces = [];
  variables.forEach((v, vi) => {
    let x = [];
    let y = [];
    for (let t = 0; t < timesteps; t++) {
      if (csvData[t][vi] === 1) {
        x.push(t);
        y.push(vi + 1); // numeric position for y
      }
    }
    traces.push({
      x: x,
      y: y,
      mode: "markers",
      marker: { size: 12, color: "steelblue" },
      name: v,
      hoverinfo: "x+name"
    });
  });

  const yPositions = variables.map((v, i) => i + 1);

  const layout = {
    title: `${variables.length} Variables x ${timesteps} Timesteps`,
    xaxis: { title: "Time Step", fixedrange: false },
    yaxis: {
      title: "Variables",
      tickvals: yPositions,
      ticktext: variables,
      autorange: "reversed",
      fixedrange: false,
    },
    dragmode: "pan",
    showlegend: false,
    margin: { l: 100, r: 30, t: 50, b: 50 }
  };

  Plotly.newPlot("plotContainer", traces, layout, { responsive: false });

  const trueVarsList = document.getElementById("trueVarsList");
  const hoverTimestep = document.getElementById("timestepVar");

  function updateTrueVars(timestep) {
    hoverTimestep.textContent = `${timestep}`
    const trueVars = [];
    for (let vi = 0; vi < variables.length; vi++) {
      if (csvData[timestep][vi] === 1) trueVars.push(variables[vi]);
    }
    trueVarsList.innerHTML = "";
    trueVars.forEach(v => {
      const li = document.createElement("li");
      li.textContent = v;
      trueVarsList.appendChild(li);
    });
  }

  // Hover event: update live
  const plot = document.getElementById("plotContainer");
  plot.on('plotly_hover', (eventData) => {
    if(eventData.points.length > 0){
      const timestep = eventData.points[0].x;
      updateTrueVars(timestep);
    }
  });

}

export async function checkUnsatCore(formulas) {
  const resp = await fetch('http://localhost:3000/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formulas }),
  });
  if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
  return resp.json();
}
