import { FilterSettings, LocalSettings } from "cdm/SettingsModel";
import { ConfigState } from "cdm/TableStateInterface";
import { DatabaseView } from "DatabaseView";
import create from "zustand";

const useConfigStore = (view: DatabaseView) => {
    const { global_settings } = view.plugin.settings;
    const { config, filters } = view.diskConfig.yaml;
    return create<ConfigState>()(
        (set, get) => ({
            ddbbConfig: config,
            filters: filters,
            global: global_settings,
            actions: {
                alterFilters: async (partialFilters: Partial<FilterSettings>) => {
                    await view.diskConfig.updateFilters(partialFilters);
                    set((state) => {
                        return ({ filters: { ...state.filters, ...partialFilters } });
                    })
                },
                alterConfig: (alteredConfig: Partial<LocalSettings>) =>
                    set((state) => {
                        view.diskConfig.updateConfig(alteredConfig);
                        return ({ ddbbConfig: { ...state.ddbbConfig, ...alteredConfig } });
                    }),
            },
            info: {
                getLocalSettings: () => get().ddbbConfig,
                getFilters: () => get().filters,
            },
        })
    );
}
export default useConfigStore;