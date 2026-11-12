(() => {
  "use strict";
  const status = document.getElementById("route-status");
  const verified = document.getElementById("verified-route");
  const firstNode = document.getElementById("route-node");
  const repair = document.getElementById("repair-edge");
  const breakEdge = document.getElementById("break-edge");
  if (!status || !verified || !firstNode || !repair || !breakEdge) return;
  repair.addEventListener("click", () => {
    firstNode.textContent = "C";
    firstNode.classList.remove("missing");
    verified.hidden = false;
    status.textContent = "The route now follows the map: A → B → C → D. Each transition has a declared edge.";
  });
  breakEdge.addEventListener("click", () => {
    firstNode.textContent = "C";
    firstNode.classList.add("missing");
    verified.hidden = true;
    status.textContent = "The proposal again skips the declared A → B edge. A → C is not in the map.";
  });
})();