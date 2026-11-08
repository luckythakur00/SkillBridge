// Stores register a reset here, so that one user's data never leaks into the next session.
const resetters = new Set();

export const onSessionEnd = (reset) => resetters.add(reset);
export const resetSessionStores = () => resetters.forEach((reset) => reset());

// Runs a data load, tracking loading and error state under the given key.
export async function runLoad(set, key, loader, apply) {
  set((state) => ({ loading: { ...state.loading, [key]: true }, errors: { ...state.errors, [key]: null } }));
  try {
    const data = await loader();
    set((state) => ({ ...apply(data, state), loading: { ...state.loading, [key]: false } }));
    return data;
  } catch (error) {
    set((state) => ({
      loading: { ...state.loading, [key]: false },
      errors: { ...state.errors, [key]: error.message },
    }));
    return null;
  }
}
