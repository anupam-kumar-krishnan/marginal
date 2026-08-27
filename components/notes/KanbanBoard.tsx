"use client";

import { useState } from "react";
import type { KanbanData } from "@/lib/types";

export default function KanbanBoard({
  data,
  onChange,
}: {
  data: KanbanData;
  onChange?: (data: KanbanData) => void;
}) {
  const [board, setBoard] = useState<KanbanData>(data);
  const [dragCard, setDragCard] = useState<{
    columnId: string;
    cardId: string;
  } | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const update = (next: KanbanData) => {
    setBoard(next);
    onChange?.(next);
  };

  const addCard = (columnId: string) => {
    update({
      columns: board.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [...col.cards, { id: crypto.randomUUID(), content: "" }],
            }
          : col,
      ),
    });
  };

  const updateCard = (columnId: string, cardId: string, content: string) => {
    update({
      columns: board.columns.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((c) =>
                c.id === cardId ? { ...c, content } : c,
              ),
            }
          : col,
      ),
    });
  };

  const removeCard = (columnId: string, cardId: string) => {
    update({
      columns: board.columns.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col,
      ),
    });
  };

  const handleDragStart = (columnId: string, cardId: string) => {
    setDragCard({ columnId, cardId });
  };

  const handleDragEnd = () => {
    setDragCard(null);
    setOverColumn(null);
  };

  const handleDropOnCard = (targetColumnId: string, targetCardId: string) => {
    if (!dragCard) return;
    moveCard(dragCard.columnId, targetColumnId, dragCard.cardId, targetCardId);
    handleDragEnd();
  };

  const handleDropOnColumn = (targetColumnId: string) => {
    if (!dragCard) return;
    moveCard(dragCard.columnId, targetColumnId, dragCard.cardId, null);
    handleDragEnd();
  };

  const moveCard = (
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    beforeCardId: string | null,
  ) => {
    if (fromColumnId === toColumnId && cardId === beforeCardId) return;

    let movedCard: { id: string; content: string } | undefined;

    const columnsWithoutCard = board.columns.map((col) => {
      if (col.id !== fromColumnId) return col;
      const found = col.cards.find((c) => c.id === cardId);
      if (found) movedCard = found;
      return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    });

    if (!movedCard) return;

    const finalColumns = columnsWithoutCard.map((col) => {
      if (col.id !== toColumnId) return col;
      const cards = [...col.cards];
      const insertAt = beforeCardId
        ? cards.findIndex((c) => c.id === beforeCardId)
        : cards.length;
      cards.splice(insertAt === -1 ? cards.length : insertAt, 0, movedCard!);
      return { ...col, cards };
    });

    update({ columns: finalColumns });
  };

  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {board.columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.id);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              handleDropOnColumn(col.id);
            }}
            className={`flex w-64 shrink-0 flex-col gap-2 rounded-xl p-2.5 transition ${
              overColumn === col.id ? "ring-2 ring-inset" : ""
            }`}
            style={{
              background: `${col.color}14`,
              ...(overColumn === col.id
                ? ({ "--tw-ring-color": col.color } as any)
                : {}),
            }}
          >
            <div className="flex items-center gap-1.5 px-1 py-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: col.color }}
              />
              <span className="text-sm font-medium text-ink">{col.title}</span>
              <span className="text-xs text-ink-soft">{col.cards.length}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(col.id, card.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropOnCard(col.id, card.id);
                  }}
                  className={`group flex items-start justify-between gap-2 rounded-lg border border-line/60 bg-surface px-3 py-2.5 text-sm shadow-sm transition ${
                    dragCard?.cardId === card.id
                      ? "cursor-grabbing opacity-40"
                      : "cursor-grab"
                  }`}
                >
                  <input
                    value={card.content}
                    onChange={(e) =>
                      updateCard(col.id, card.id, e.target.value)
                    }
                    placeholder="Untitled card"
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
                  />
                  <button
                    onClick={() => removeCard(col.id, card.id)}
                    className="shrink-0 text-ink-soft opacity-0 transition group-hover:opacity-100 hover:text-ink"
                    aria-label="Remove card"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addCard(col.id)}
              className="mt-0.5 rounded-lg px-2 py-1.5 text-left text-xs text-ink-soft transition hover:bg-black/5"
            >
              + Add card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
