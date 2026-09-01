/**
 * 注解（term）tooltip 交互
 *
 * - 点击 .term 元素任意位置弹出 tooltip
 * - tooltip 默认显示在元素上方，空间不足时显示在下方
 * - 点击 tooltip 及 .term 之外的任意区域时关闭
 * - 悬浮时有 hover 视觉反馈（CSS 处理），这里只负责点击弹出
 */

let tooltipEl: HTMLElement | null = null;
let activeTerm: HTMLElement | null = null;

function closeTooltip() {
  if (tooltipEl) {
    const el = tooltipEl;
    tooltipEl = null;
    activeTerm = null;
    // 播放淡出过渡，结束后移除
    el.classList.add("term-tooltip-hidden");
    el.addEventListener(
      "transitionend",
      () => el.remove(),
      { once: true }
    );
  }
}

function positionTooltip(term: HTMLElement, tooltip: HTMLElement) {
  const termRect = term.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const gap = 8; // 与元素的间距

  // 默认上方，若上方空间不足则放下方
  const spaceAbove = termRect.top;
  const spaceBelow = window.innerHeight - termRect.bottom;

  let top: number;
  if (spaceAbove >= tooltipRect.height + gap || spaceAbove >= spaceBelow) {
    // 显示在上方
    top = termRect.top - tooltipRect.height - gap;
  } else {
    // 显示在下方
    top = termRect.bottom + gap;
  }

  // 水平居中于 term，但不超出视口
  let left = termRect.left + termRect.width / 2 - tooltipRect.width / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function openTooltip(term: HTMLElement) {
  const annotation = term.getAttribute("data-annotation");
  if (!annotation) return;

  // 如果已经有 tooltip 且是同一个 term，关闭
  if (tooltipEl && activeTerm === term) {
    closeTooltip();
    return;
  }

  closeTooltip();

  tooltipEl = document.createElement("div");
  tooltipEl.className = "term-tooltip";
  tooltipEl.textContent = annotation;
  document.body.appendChild(tooltipEl);

  activeTerm = term;
  positionTooltip(term, tooltipEl);

  // 下一帧加上 visible 类，触发淡入过渡
  requestAnimationFrame(() => {
    tooltipEl?.classList.add("term-tooltip-visible");
  });
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // 点击了 term
  const term = target.closest?.(".term") as HTMLElement | null;
  if (term) {
    e.preventDefault();
    openTooltip(term);
    return;
  }

  // 点击了 tooltip 内部，不关闭
  if (tooltipEl && tooltipEl.contains(target)) {
    return;
  }

  // 点击其他地方，关闭
  if (tooltipEl) {
    closeTooltip();
  }
}

function handleScroll() {
  // 滚动时如果 tooltip 存在且 term 移出视口，关闭；否则重新定位
  if (tooltipEl && activeTerm) {
    const rect = activeTerm.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      closeTooltip();
    } else {
      positionTooltip(activeTerm, tooltipEl);
    }
  }
}

function init() {
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

init();

// View Transitions 下重新绑定（避免重复绑定，用 once 逻辑）
document.addEventListener("astro:after-swap", () => {
  closeTooltip();
});
