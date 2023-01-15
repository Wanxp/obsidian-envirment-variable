import {App} from "obsidian";
import {EnvironmentSetting} from "../model/EnvironmentSetting";
import EnvironmentVariablePlugin from "../main";

export class EnvironmentSettingHolder {
	private app: App;
	private setting: EnvironmentSetting;

	private plugin: EnvironmentVariablePlugin;

	constructor(app:App, plugin: EnvironmentVariablePlugin) {
		this.app = app;
		this.plugin = plugin;
		this.loadSetting(plugin);
	}

	private async loadSetting(plugin:EnvironmentVariablePlugin){
		this.setting = plugin.setting;
	}

	async saveSettings(setting:EnvironmentSetting) {
		this.setting = setting;
		await this.plugin.saveData(setting);
	}

	getSetting():EnvironmentSetting {
		return this.setting;
	}


}
