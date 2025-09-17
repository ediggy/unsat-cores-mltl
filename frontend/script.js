const outputDiv = document.getElementById("output");
const button = document.getElementById("checkBtn");
const inputArea = document.getElementById("formulaInput");

button.addEventListener("click", async () => {
  console.log("button clicked");


  const formulas = inputArea.value
                      .split("\n")
                      .map(f => f.trim())
                      .filter(f => f.length > 0);

  console.log("formulas: ",formulas);

  if (formulas.length > 0){
    outputDiv.innerText = "Processing...\nResults will appear here";

    try{
      const result = await checkUnsatCore(formulas);
      outputDiv.innerText = JSON.stringify(result, null, 2);
    } catch(err){
      outputDiv.innerText = "Error: " + err.message;
    }
  } else {
    outputDiv.innerText = "Please enter atleast one formula.\nResults will appear here"
  }

});

export async function checkUnsatCore(formulas) {
  const resp = await fetch('http://localhost:3000/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formulas })
  });
  if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
  return resp.json();
}