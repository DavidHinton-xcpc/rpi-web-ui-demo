import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { type Language, models } from "../data";

/**
 * Composer model picker for the slim variant.
 *
 * The original build exposes model *selection* twice (here and in the runtime
 * panel) while the runtime entry sits on its own toolbar button. Here the
 * picker is the single place for anything model-related: choosing a model, and
 * — at the top of the same menu — a jump into the runtime panel, which is where
 * the read-only context/token diagnostics live. That removes the duplicate
 * selector without hiding the panel.
 */
export function ModelMenu({
  language,
  value,
  onChange,
  onOpenRuntime,
}: {
  language: Language;
  value: string;
  onChange: (id: string) => void;
  onOpenRuntime: () => void;
}) {
  const zh = language === "zh";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const anchor = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // One flat list so arrow keys can walk the runtime entry and the models in a
  // single order; index 0 is the runtime action, 1..n are the models.
  const rows = models.length + 1;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-model-menu]")) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const selected = models.findIndex((m) => m.id === value);
      setActive(selected >= 0 ? selected + 1 : 1);
    }
  }, [open, value]);

  // The composer sits at the bottom of the viewport, so the menu opens upward
  // and is clamped horizontally. Measured after mount because the height
  // depends on the model count.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const trigger = anchor.current?.getBoundingClientRect();
      const box = menu.current?.getBoundingClientRect();
      if (!trigger || !box) return;
      const gap = 6;
      const top = Math.max(gap, trigger.top - box.height - gap);
      const left = Math.min(
        Math.max(gap, trigger.left),
        window.innerWidth - box.width - gap,
      );
      setPosition({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function choose(index: number) {
    if (index === 0) {
      onOpenRuntime();
    } else {
      onChange(models[index - 1].id);
    }
    setOpen(false);
  }

  return (
    <div className="dropdown-anchor" data-dropdown="true" data-model-menu ref={anchor}>
      <button
        type="button"
        className="composer-model"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={zh ? "选择模型" : "Choose model"}
        title={zh ? "选择模型" : "Choose model"}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{value}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div
          ref={menu}
          className="dropdown-popover slim-model-menu"
          role="menu"
          style={{ top: position.top, left: position.left }}
          aria-label={zh ? "模型" : "Model"}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(rows - 1, i + 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              choose(active);
            }
          }}
        >
          {/* Runtime entry lives at the top of the menu: model settings and the
              runtime panel are the same concern, so one menu owns both. */}
          <button
            type="button"
            role="menuitem"
            className="dropdown-item slim-model-runtime"
            data-active={active === 0}
            onMouseEnter={() => setActive(0)}
            onClick={() => choose(0)}
          >
            <span className="slim-model-runtime-label">
              <SlidersHorizontal size={13} aria-hidden="true" />
              {zh ? "运行时设置" : "Runtime settings"}
            </span>
            <span className="slim-model-runtime-hint">
              {zh ? "上下文 · 工具" : "Context · tools"}
            </span>
          </button>
          <div className="dropdown-group">
            <div className="dropdown-group-label">{zh ? "模型" : "Model"}</div>
            {models.map((model, i) => {
              const index = i + 1;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={model.id === value}
                  aria-selected={model.id === value}
                  className="dropdown-item"
                  data-active={active === index}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(index)}
                >
                  <span className="slim-model-name">{model.label}</span>
                  <span className="slim-model-tail">
                    <span className="slim-model-hint">{model.hint}</span>
                    {model.id === value && <Check size={13} aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
