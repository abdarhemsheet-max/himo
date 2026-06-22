import { describe, it, expect } from "vitest";
import { useAppStore } from "../app.store";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarCollapsed: false, showBalance: true });
  });

  it("should start with defaults", () => {
    const state = useAppStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.showBalance).toBe(true);
  });

  it("should toggle sidebar", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it("should toggle balance visibility", () => {
    useAppStore.getState().toggleBalance();
    expect(useAppStore.getState().showBalance).toBe(false);
    useAppStore.getState().toggleBalance();
    expect(useAppStore.getState().showBalance).toBe(true);
  });
});
