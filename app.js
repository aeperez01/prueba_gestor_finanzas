const LS_KEY = "gf:tx";
let tx = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

const $ = sel => document.querySelector(sel);
const fmt = n => n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});

$("#date").value = new Date().toISOString().slice(0,10);

$("#txForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: crypto.randomUUID(),
    type: $("#type").value,
    category: $("#category").value,
    amount: parseFloat($("#amount").value),
    date: $("#date").value,
    note: $("#note").value
  };
  tx.push(data);
  localStorage.setItem(LS_KEY, JSON.stringify(tx));
  e.target.reset();
  render();
});

$("#filterType").addEventListener("input", render);
$("#filterMonth").addEventListener("input", render);
$("#filterText").addEventListener("input", render);
$("#btnClear").addEventListener("click", () => {
  if(confirm("¿Borrar todas?")){
    tx = [];
    localStorage.setItem(LS_KEY, "[]");
    render();
  }
});

$("#btnExport").addEventListener("click", () => {
  const csv = tx.map(t => `${t.date},${t.type},${t.category},${t.note},${t.amount}`).join("\n");
  const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "transacciones.csv"; a.click();
  URL.revokeObjectURL(url);
});

function render(){
  const fType = $("#filterType").value;
  const fMonth = $("#filterMonth").value;
  const fText = $("#filterText").value.toLowerCase();

  const filtered = tx.filter(t => 
    (fType==="all" || t.type===fType) &&
    (!fMonth || t.date.startsWith(fMonth)) &&
    (!fText || t.category.toLowerCase().includes(fText) || t.note.toLowerCase().includes(fText))
  );

  $("#txTableBody").innerHTML = filtered.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>${t.note}</td>
      <td>${fmt(t.amount)}</td>
      <td><button onclick="delTx('${t.id}')">Eliminar</button></td>
    </tr>
  `).join("");

  const inc = filtered.filter(t=>t.type==="ingreso").reduce((a,b)=>a+b.amount,0);
  const exp = filtered.filter(t=>t.type==="gasto").reduce((a,b)=>a+b.amount,0);
  $("#sumIn").textContent = fmt(inc);
  $("#sumOut").textContent = fmt(exp);
  $("#balance").textContent = fmt(inc-exp);
}

function delTx(id){
  tx = tx.filter(t=>t.id!==id);
  localStorage.setItem(LS_KEY, JSON.stringify(tx));
  render();
}

render();
