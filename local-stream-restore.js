(function () {
  function isBoundaryStart(data) {
    return data === "$" || data === "$?" || data === "$~" || data === "$!" || data === "&";
  }

  function isBoundaryEnd(data) {
    return data === "/$" || data === "/&";
  }

  function revealMotionContent(root) {
    var scope = root || document;
    scope.querySelectorAll('[style*="opacity:0"], [style*="opacity: 0"]').forEach(function (node) {
      node.style.opacity = "1";
      if (node.style.transform && /translate|scale/.test(node.style.transform)) {
        node.style.transform = "none";
      }
    });

    scope.querySelectorAll('.blur-text, .blur-text *, [style*="filter: blur"], [style*="filter:blur"]').forEach(function (node) {
      node.style.filter = "none";
      node.style.opacity = "1";
      if (node.style.transform) {
        node.style.transform = "none";
      }
    });
  }

  function restoreStreamedBlocks() {
    document.querySelectorAll('div[hidden][id^="S:"]').forEach(function (stream) {
      var suffix = stream.id.slice(2);
      var template = document.getElementById("B:" + suffix);
      var placeholder = document.getElementById("P:" + suffix);
      if (!template && placeholder && placeholder.parentNode) {
        var placeholderParent = placeholder.parentNode;
        while (stream.firstChild) {
          placeholderParent.insertBefore(stream.firstChild, placeholder);
        }
        placeholder.remove();
        stream.remove();
        revealMotionContent(placeholderParent);
        return;
      }
      if (!template || !template.parentNode) {
        return;
      }

      var parent = template.parentNode;
      var cursor = template.previousSibling || template;
      var insertionPoint = null;
      var depth = 0;

      while (cursor) {
        var next = cursor.nextSibling;

        if (cursor.nodeType === Node.COMMENT_NODE) {
          var data = cursor.data;
          if (isBoundaryEnd(data)) {
            if (depth === 0) {
              insertionPoint = next;
              parent.removeChild(cursor);
              break;
            }
            depth -= 1;
          } else if (isBoundaryStart(data)) {
            depth += 1;
          }
        }

        parent.removeChild(cursor);
        cursor = next;
      }

      while (stream.firstChild) {
        parent.insertBefore(stream.firstChild, insertionPoint);
      }
      stream.remove();
      revealMotionContent(parent);
    });

    revealMotionContent(document.getElementById("main-content") || document);
  }

  function scheduleRestore() {
    restoreStreamedBlocks();
    setTimeout(restoreStreamedBlocks, 50);
    setTimeout(restoreStreamedBlocks, 300);
    setTimeout(restoreStreamedBlocks, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRestore, { once: true });
  } else {
    scheduleRestore();
  }
})();
