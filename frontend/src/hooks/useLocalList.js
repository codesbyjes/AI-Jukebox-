import { useCallback, useRef, useState } from "react";

function readList(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Shared localStorage list helper for recent searches, saved tools, and
 * recently used tools. Writes are synchronous so a navigation immediately
 * after an action never discards the just-created item.
 */
export function useLocalList(storageKey, { max = 20, keyFn = (item) => item.id } = {}) {
  const [items, setItems] = useState(() => readList(storageKey));
  const itemsRef = useRef(items);

  const commit = useCallback(
    (nextItems) => {
      itemsRef.current = nextItems;
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextItems));
      } catch {
        // Keep the current session usable when browser storage is unavailable.
      }
      setItems(nextItems);
    },
    [storageKey]
  );

  const push = useCallback(
    (item) => {
      const withoutDuplicate = itemsRef.current.filter((existing) => keyFn(existing) !== keyFn(item));
      commit([{ ...item, at: Date.now() }, ...withoutDuplicate].slice(0, max));
    },
    [commit, keyFn, max]
  );

  const remove = useCallback(
    (item) => {
      commit(itemsRef.current.filter((existing) => keyFn(existing) !== keyFn(item)));
    },
    [commit, keyFn]
  );

  const has = useCallback(
    (item) => items.some((existing) => keyFn(existing) === keyFn(item)),
    [items, keyFn]
  );

  const toggle = useCallback(
    (item) => {
      if (has(item)) remove(item);
      else push(item);
    },
    [has, push, remove]
  );

  return { items, push, remove, toggle, has };
}
