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
    verified.hidden = false;
    status.textContent = "Added the map-checked route A → B → C → D. The original proposal above remains for comparison.";
  });
  breakEdge.addEventListener("click", () => {
    firstNode.textContent = "C";
    firstNode.classList.add("missing");
    verified.hidden = true;
    status.textContent = "The map-checked route is hidden. The original A → C jump has no declared edge.";
  });
})();