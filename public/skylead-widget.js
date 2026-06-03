/* SkyLead chatbot loader — drop this on any site:
   <script src="https://YOUR_APP/skylead-widget.js" data-workspace="USER_ID"
           data-color="0EA5E9" data-title="Acme Flight School"
           data-greeting="Hi! How can I help?"></script>
*/
(function () {
  var s = document.currentScript;
  if (!s) return;
  var workspace = s.getAttribute("data-workspace");
  if (!workspace) { console.error("[SkyLead] missing data-workspace"); return; }
  var color = (s.getAttribute("data-color") || "0EA5E9").replace(/^#/, "");
  var title = encodeURIComponent(s.getAttribute("data-title") || "Chat");
  var greeting = encodeURIComponent(s.getAttribute("data-greeting") || "Hi! How can I help?");
  var origin = s.src.split("/").slice(0, 3).join("/");
  var iframeSrc = origin + "/chatbot.html?w=" + encodeURIComponent(workspace) +
    "&c=" + color + "&t=" + title + "&g=" + greeting;

  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Open chat");
  btn.style.cssText = "position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:0;background:#" + color + ";color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer;z-index:2147483646;display:flex;align-items:center;justify-content:center;transition:transform .2s;";
  btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.onmouseenter = function(){ btn.style.transform = "scale(1.08)"; };
  btn.onmouseleave = function(){ btn.style.transform = "scale(1)"; };

  var panel = document.createElement("div");
  panel.style.cssText = "position:fixed;right:20px;bottom:90px;width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25);z-index:2147483647;display:none;background:#fff;";
  var iframe = document.createElement("iframe");
  iframe.style.cssText = "width:100%;height:100%;border:0;";
  iframe.title = "Chat";
  panel.appendChild(iframe);

  var opened = false;
  btn.addEventListener("click", function () {
    opened = !opened;
    if (opened && !iframe.src) iframe.src = iframeSrc;
    panel.style.display = opened ? "block" : "none";
  });

  document.body.appendChild(panel);
  document.body.appendChild(btn);
})();
