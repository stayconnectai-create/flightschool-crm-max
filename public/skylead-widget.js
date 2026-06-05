/* SkyLead chatbot loader — drop this on any site:
   <script src="https://YOUR_APP/skylead-widget.js" data-workspace="USER_ID"
           data-color="0EA5E9" data-title="Acme Flight School"
           data-greeting="Hi! How can I help?"
           data-status="Online — typically replies in a few minutes"
           data-suggestions="Course pricing|Book a discovery flight|Requirements|Visit the school"
           data-proactive="Have questions about our courses? Ask me anything!"
           data-proactive-delay="8"></script>
*/
(function () {
  var s = document.currentScript;
  if (!s) return;
  var workspace = s.getAttribute("data-workspace");
  if (!workspace) { console.error("[SkyLead] missing data-workspace"); return; }
  var color = (s.getAttribute("data-color") || "0EA5E9").replace(/^#/, "");
  var title = encodeURIComponent(s.getAttribute("data-title") || "Chat");
  var greeting = encodeURIComponent(s.getAttribute("data-greeting") || "Hi! How can I help?");
  var statusLbl = encodeURIComponent(s.getAttribute("data-status") || "Online — typically replies in a few minutes");
  var suggestions = s.getAttribute("data-suggestions") || "";
  var proactive = s.getAttribute("data-proactive") || "";
  var proactiveDelay = parseInt(s.getAttribute("data-proactive-delay") || "10", 10) * 1000;
  var origin = s.src.split("/").slice(0, 3).join("/");
  var iframeSrc = origin + "/chatbot.html?w=" + encodeURIComponent(workspace) +
    "&c=" + color + "&t=" + title + "&g=" + greeting + "&s=" + statusLbl +
    (suggestions ? "&q=" + encodeURIComponent(suggestions) : "") +
    (proactive ? "&p=" + encodeURIComponent(proactive) : "");

  /* ---- Chat button ---- */
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Open chat");
  btn.style.cssText = "position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:0;background:#" + color + ";color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:pointer;z-index:2147483646;display:flex;align-items:center;justify-content:center;transition:transform .2s;";
  btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.onmouseenter = function(){ btn.style.transform = "scale(1.08)"; };
  btn.onmouseleave = function(){ btn.style.transform = "scale(1)"; };

  /* ---- Chat panel (iframe) ---- */
  var panel = document.createElement("div");
  panel.style.cssText = "position:fixed;right:20px;bottom:90px;width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 120px);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.25);z-index:2147483647;display:none;background:#fff;";
  var iframe = document.createElement("iframe");
  iframe.style.cssText = "width:100%;height:100%;border:0;";
  iframe.title = "Chat";
  panel.appendChild(iframe);

  /* ---- Proactive notification bubble ---- */
  var bubble = document.createElement("div");
  bubble.style.cssText = "position:fixed;right:20px;bottom:88px;max-width:260px;background:#fff;color:#0f172a;padding:12px 16px;border-radius:14px 14px 2px 14px;box-shadow:0 4px 20px rgba(0,0,0,.12);font-size:13.5px;line-height:1.4;cursor:pointer;z-index:2147483645;opacity:0;transform:translateY(10px) scale(.95);transition:opacity .35s ease,transform .35s ease;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";
  if (proactive) bubble.textContent = proactive;

  var bubbleArrow = document.createElement("div");
  bubbleArrow.style.cssText = "position:absolute;right:18px;bottom:-6px;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:2px 2px 4px rgba(0,0,0,.06);";
  bubble.appendChild(bubbleArrow);

  var pulse = document.createElement("div");
  pulse.style.cssText = "position:fixed;right:14px;bottom:14px;width:72px;height:72px;border-radius:50%;border:0;background:" + hexToRgba(color, 0.35) + ";z-index:2147483644;opacity:0;pointer-events:none;";
  var styleSheet = document.createElement("style");
  styleSheet.textContent = "@keyframes sl-pulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.5);opacity:0}100%{transform:scale(1.5);opacity:0}}";
  document.head.appendChild(styleSheet);

  var opened = false;
  function openChat() {
    opened = true;
    if (!iframe.src) iframe.src = iframeSrc;
    panel.style.display = "block";
    hideProactive();
  }
  function closeChat() { opened = false; panel.style.display = "none"; }
  function toggleChat() { if (opened) closeChat(); else openChat(); }

  btn.addEventListener("click", toggleChat);
  bubble.addEventListener("click", openChat);

  var proactiveShown = false;
  function showProactive() {
    if (proactiveShown || opened || !proactive) return;
    proactiveShown = true;
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0) scale(1)";
    bubble.style.pointerEvents = "auto";
    pulse.style.animation = "sl-pulse 2s ease-out infinite";
    pulse.style.opacity = "1";
  }
  function hideProactive() {
    bubble.style.opacity = "0";
    bubble.style.transform = "translateY(10px) scale(.95)";
    bubble.style.pointerEvents = "none";
    pulse.style.animation = "none";
    pulse.style.opacity = "0";
    proactiveShown = true;
  }
  if (proactive && proactiveDelay >= 0) setTimeout(showProactive, proactiveDelay);

  document.addEventListener("click", function (e) {
    if (!opened && proactiveShown && e.target !== btn && e.target !== bubble && !bubble.contains(e.target)) {
      hideProactive();
    }
  });

  document.body.appendChild(panel);
  document.body.appendChild(bubble);
  document.body.appendChild(btn);
  document.body.appendChild(pulse);

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }
})();
