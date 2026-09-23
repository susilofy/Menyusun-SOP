import React from "react";
import { FlowType, PelaksanaMutuBakuStep } from "../types";

interface FlowchartPelaksanaCellProps {
  step: PelaksanaMutuBakuStep;
  stepIdx: number;
  totalSteps: number;
  pelaksanaName: string;
  pelaksanaIdx: number;
  pelaksanaList: string[];
  allSteps: PelaksanaMutuBakuStep[];
  isPrintMode?: boolean;
  onClick?: () => void;
}

export const FlowchartPelaksanaCell: React.FC<FlowchartPelaksanaCellProps> = ({
  step,
  stepIdx,
  totalSteps,
  pelaksanaName,
  pelaksanaIdx,
  pelaksanaList,
  allSteps,
  isPrintMode = false,
  onClick,
}) => {
  // Helper to determine all checked columns for any step
  const getCheckedCols = (s: PelaksanaMutuBakuStep): number[] => {
    const checked = pelaksanaList
      .map((p, i) => (s.pelaksanaChecks?.[p] ? i : -1))
      .filter((i) => i !== -1);
    if (checked.length > 0) return checked;
    // Fallback: at least one actor is active
    return [s.activePelaksanaIndex !== undefined && s.activePelaksanaIndex >= 0 && s.activePelaksanaIndex < pelaksanaList.length ? s.activePelaksanaIndex : 0];
  };

  // Helper to determine primary routing actor column for any step
  const getPrimaryCol = (s: PelaksanaMutuBakuStep): number => {
    const checked = getCheckedCols(s);
    if (
      s.activePelaksanaIndex !== undefined &&
      s.activePelaksanaIndex >= 0 &&
      s.activePelaksanaIndex < pelaksanaList.length &&
      checked.includes(s.activePelaksanaIndex)
    ) {
      return s.activePelaksanaIndex;
    }
    return checked.length > 0 ? checked[0] : 0;
  };

  // 1. Current step actors and columns
  const currentCheckedCols = getCheckedCols(step);
  const primaryCol = getPrimaryCol(step);
  const isThisChecked = !!step.pelaksanaChecks?.[pelaksanaName];
  const isPrimaryActor = pelaksanaIdx === primaryCol;
  const flow: FlowType =
    step.flowType || (stepIdx === 0 ? "start" : stepIdx === totalSteps - 1 ? "end" : "process");

  // Joint execution span across actors within the same step
  const minCheckedCol = Math.min(...currentCheckedCols);
  const maxCheckedCol = Math.max(...currentCheckedCols);
  const hasMultipleActors = currentCheckedCols.length > 1;
  const isInJointSpan = hasMultipleActors && pelaksanaIdx >= minCheckedCol && pelaksanaIdx <= maxCheckedCol;

  // 2. Previous step transition
  const hasPrev = stepIdx > 0;
  const prevStep = hasPrev ? allSteps[stepIdx - 1] : null;
  const prevFlow = prevStep?.flowType || "process";
  // The flow always enters at current step's primaryCol
  const hasIncoming = hasPrev && prevFlow !== "end" && pelaksanaIdx === primaryCol;

  // 3. Next step transition
  const hasNext = stepIdx < totalSteps - 1;
  const nextStep = hasNext ? allSteps[stepIdx + 1] : null;
  const nextPrimaryCol = nextStep ? getPrimaryCol(nextStep) : -1;
  const hasOutgoing = hasNext && flow !== "end";

  // Transit conditions for cross-column horizontal routing (Row N to Row N+1)
  const isRoutingRow = hasOutgoing && primaryCol !== nextPrimaryCol;
  const minRouteCol = Math.min(primaryCol, nextPrimaryCol);
  const maxRouteCol = Math.max(primaryCol, nextPrimaryCol);
  const isTransitColumn = isRoutingRow && pelaksanaIdx > minRouteCol && pelaksanaIdx < maxRouteCol;
  const isTargetColumnInCurrentRow = isRoutingRow && pelaksanaIdx === nextPrimaryCol;

  // Y-coordinate tracking position for turn (8px from bottom of cell)
  const turnBottomPx = 8;

  return (
    <td
      onClick={onClick}
      className={`border border-black p-0 text-center align-middle relative min-w-[76px] h-full select-none bg-white ${
        isPrintMode ? "" : onClick ? "cursor-pointer hover:bg-indigo-50/50 transition-colors" : ""
      }`}
      title={
        !isPrintMode && onClick
          ? `Klik untuk aktifkan/nonaktifkan ${pelaksanaName} pada langkah ${step.no || stepIdx + 1}`
          : undefined
      }
    >
      <div className="relative w-full h-full min-h-[72px] flex flex-col items-center justify-between">
        {/* ========================================================
            LAYER 0: HORIZONTAL COORDINATION LINE (Garis Hubung Antar-Pelaksana dalam 1 Langkah)
            Connects all actors involved in the same activity step
            ======================================================== */}
        {isInJointSpan && (
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 pointer-events-none">
            {pelaksanaIdx === minCheckedCol && (
              <div className="absolute top-0 right-0 left-1/2 h-[2px] bg-black" />
            )}
            {pelaksanaIdx === maxCheckedCol && (
              <div className="absolute top-0 left-0 right-1/2 h-[2px] bg-black" />
            )}
            {pelaksanaIdx > minCheckedCol && pelaksanaIdx < maxCheckedCol && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </div>
        )}

        {/* ========================================================
            TOP ZONE: INCOMING VERTICAL FLOW LINE & ARROWHEAD
            Seamlessly connects from top border down to top of symbol
            ======================================================== */}
        <div className="flex-1 w-full relative flex flex-col items-center justify-end min-h-[14px]">
          {hasIncoming && (
            <>
              {/* Full height vertical line from top border to symbol */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black z-10" />
              {/* Downward Arrowhead touching the top of symbol */}
              <div className="relative z-20 -mb-[1px] pointer-events-none">
                <svg width="10" height="7" viewBox="0 0 10 7" className="block overflow-visible">
                  <polygon points="0,0 10,0 5,7" fill="#000000" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* ========================================================
            MIDDLE ZONE: FLOWCHART SYMBOL (Mulai, Proses, Keputusan, Selesai)
            ======================================================== */}
        <div className="shrink-0 relative z-20 flex flex-col items-center justify-center my-0.5 min-h-[30px]">
          {/* A. PRIMARY ACTOR SYMBOLS */}
          {isPrimaryActor && isThisChecked && (
            <div className="relative flex flex-col items-center justify-center">
              {/* MULAI (Start Oval) */}
              {flow === "start" && (
                <div className="px-3 py-1 rounded-full border-2 border-black bg-white text-[9px] font-black text-black tracking-tight shadow-xs whitespace-nowrap">
                  Mulai
                </div>
              )}

              {/* PROSES (Process Box) */}
              {flow === "process" && (
                <div className="px-2.5 py-1 border-2 border-black bg-white text-[9px] font-bold text-black text-center shadow-xs min-w-[50px] leading-tight">
                  Proses
                </div>
              )}

              {/* KEPUTUSAN (Decision Diamond) */}
              {flow === "decision" && (
                <div className="relative my-1">
                  <div className="w-8 h-8 rotate-45 border-2 border-black bg-white flex items-center justify-center shadow-xs">
                    <span className="-rotate-45 text-[9px] font-black text-black">?</span>
                  </div>

                  {/* Cabang "Tidak: Revisi" (Side Loopback Branch Arrow) */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-30 ${
                      primaryCol > 0 ? "right-full mr-0.5" : "left-full ml-0.5"
                    }`}
                  >
                    {primaryCol > 0 ? (
                      <div className="flex items-center">
                        <span className="text-[7px] font-black text-red-700 bg-red-50 border border-red-400 rounded-2xs px-1 py-0.2 whitespace-nowrap mr-0.5 shadow-2xs">
                          Tdk: Revisi
                        </span>
                        <div className="w-3 h-[2px] bg-black" />
                        <svg width="6" height="8" viewBox="0 0 6 8" className="-mr-0.5">
                          <polygon points="6,0 0,4 6,8" fill="#000000" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg width="6" height="8" viewBox="0 0 6 8" className="-ml-0.5">
                          <polygon points="0,0 6,4 0,8" fill="#000000" />
                        </svg>
                        <div className="w-3 h-[2px] bg-black" />
                        <span className="text-[7px] font-black text-red-700 bg-red-50 border border-red-400 rounded-2xs px-1 py-0.2 whitespace-nowrap ml-0.5 shadow-2xs">
                          Tdk: Revisi
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SELESAI (End Oval) */}
              {flow === "end" && (
                <div className="px-3 py-1 rounded-full border-2 border-black bg-black text-white text-[9px] font-black tracking-tight shadow-xs whitespace-nowrap">
                  Selesai
                </div>
              )}

              {/* CENTANG (Check Mark) */}
              {flow === "check" && (
                <div className="w-6 h-6 border-2 border-black bg-white text-black font-black text-xs flex items-center justify-center shadow-xs">
                  ✓
                </div>
              )}
            </div>
          )}

          {/* B. SECONDARY / COLLABORATIVE ACTOR SYMBOL (Terkait dalam langkah bersama) */}
          {!isPrimaryActor && isThisChecked && (
            <div className="relative flex flex-col items-center justify-center">
              <div className="px-2 py-0.5 border-2 border-black bg-white text-[8px] font-bold text-black text-center shadow-xs min-w-[42px] leading-tight">
                Proses
              </div>
              <span className="text-[7px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded px-1 mt-0.5 whitespace-nowrap">
                (Bersama)
              </span>
            </div>
          )}
        </div>

        {/* ========================================================
            BOTTOM ZONE: OUTGOING VERTICAL & CROSS-COLUMN TRANSITION FLOW LINES
            Seamlessly connects from bottom of symbol down to bottom border
            ======================================================== */}
        <div className="flex-1 w-full relative min-h-[14px]">
          {/* A. SAME COLUMN: Direct downward vertical line to bottom border */}
          {hasOutgoing && isPrimaryActor && primaryCol === nextPrimaryCol && (
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-black z-10">
              {flow === "decision" && (
                <span className="absolute left-1.5 top-0.5 text-[7px] font-black bg-white px-0.5 border border-black rounded-2xs text-black leading-none z-20">
                  Ya
                </span>
              )}
            </div>
          )}

          {/* B. SOURCE COLUMN: Drop from symbol, then turn horizontally toward next actor */}
          {hasOutgoing && isPrimaryActor && primaryCol !== nextPrimaryCol && (
            <>
              {/* Vertical line from bottom of symbol down to turn level */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] bg-black z-10"
                style={{ bottom: `${turnBottomPx}px` }}
              >
                {flow === "decision" && (
                  <span className="absolute left-1.5 top-0.5 text-[7px] font-black bg-white px-0.5 border border-black rounded-2xs text-black leading-none z-20">
                    Ya
                  </span>
                )}
              </div>

              {/* Horizontal branch toward destination column */}
              {primaryCol < nextPrimaryCol ? (
                // Turn RIGHT: from center (50%) to right edge (right: 0)
                <div
                  className="absolute h-[2px] bg-black z-10"
                  style={{
                    left: "50%",
                    right: "0px",
                    bottom: `${turnBottomPx}px`,
                  }}
                />
              ) : (
                // Turn LEFT: from left edge (left: 0) to center (50%)
                <div
                  className="absolute h-[2px] bg-black z-10"
                  style={{
                    left: "0px",
                    right: "50%",
                    bottom: `${turnBottomPx}px`,
                  }}
                />
              )}
            </>
          )}

          {/* C. TRANSIT COLUMN: Full-width horizontal line passing through */}
          {isTransitColumn && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-black z-10"
              style={{ bottom: `${turnBottomPx}px` }}
            />
          )}

          {/* D. TARGET COLUMN IN CURRENT ROW: Receive horizontal line & drop down to bottom border */}
          {isTargetColumnInCurrentRow && (
            <>
              {/* Horizontal entry from source direction */}
              {primaryCol < nextPrimaryCol ? (
                // Coming from LEFT: left edge (0) to center (50%)
                <div
                  className="absolute h-[2px] bg-black z-10"
                  style={{
                    left: "0px",
                    right: "50%",
                    bottom: `${turnBottomPx}px`,
                  }}
                />
              ) : (
                // Coming from RIGHT: center (50%) to right edge (0)
                <div
                  className="absolute h-[2px] bg-black z-10"
                  style={{
                    left: "50%",
                    right: "0px",
                    bottom: `${turnBottomPx}px`,
                  }}
                />
              )}

              {/* Vertical drop from turn level to bottom border (connecting with top of next row) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-black z-10"
                style={{
                  bottom: "0px",
                  height: `${turnBottomPx}px`,
                }}
              />
            </>
          )}
        </div>
      </div>
    </td>
  );
};
