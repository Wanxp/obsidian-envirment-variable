import {App, Modal, Setting} from "obsidian";
import {EnvironmentHolder} from "../module/EnvironmentHolder";
import EnvironmentVariablePlugin from "../main";
import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export class EnvironmentConfigModal extends Modal {

	private plugin:EnvironmentVariablePlugin;

	private envHolders:EnvironmentHolder[];

	private envLevel:string = EnvLevelEnum.GLOBAL;

	private envCache:Map<string, Map<string, object>> = new Map<string, Map<string, object>>();



	constructor(app:App, plugin:EnvironmentVariablePlugin) {
		super(app);
		this.plugin = plugin;
		this.envHolders = plugin.envHolders;
		this.envCache = this.initEnvCache(this.envHolders);
	}

	private initEnvCache(envHolders: EnvironmentHolder[]):Map<string, Map<string, object>> {
		const cache:Map<string,  Map<string, object>> = new Map<string,  Map<string, object>>();
		if (envHolders) {
			envHolders.forEach(envHolder => {
				const envLevel:string = envHolder.getEnvLevel();
				if (!cache.has(envLevel)) {
					cache.set(envLevel, new Map<string, object>);
				}
				if(envHolder.getEnvItems()) {
					const variableMap:Map<string, object> | undefined = cache.get(envLevel);
					if (variableMap) {
						envHolder.getEnvItems().forEach(envItem => {
							variableMap.set(envItem, envHolder.getEnvItemDataObject(envItem))
						})
					}
				}
			});
		}
		return cache;
	}


	onOpen() {
		this.contentEl.empty();
		this.show(this.contentEl);
	}

	onClose() {

	}

	private show(contentEl: HTMLElement) {
		contentEl.createDiv({cls:  "obsidian-environment-variable-env-config", text: "配置环境", type: "H3"});
		const envLevelDiv:HTMLDivElement = contentEl.createDiv({cls: "obsidian-environment-variable-env-config"});
		const envData:HTMLDivElement = contentEl.createDiv({cls: "obsidian-environment-variable-env-config"});
		this.showEnvLevelConfig(envLevelDiv, envData);
		this.showEnvConfig(envData);
	}

	private showEnvConfig(div: HTMLDivElement) {
		div.empty();
		const envConfigDiv:HTMLDivElement = div.createDiv({cls: "obsidian-environment-variable-env-config"});
		const envDataConfigDiv:HTMLDivElement = div.createDiv({cls: "obsidian-environment-variable-env-config"});

		// @ts-ignore
		let dropdownValue:string = this.envCache.get(this.envLevel).keys().next().value;
		new Setting(envConfigDiv)
			.addDropdown((dropdown) => {
				const envConfig:Map<string, object> | undefined = this.envCache.get(this.envLevel);
				if (envConfig) {
					for (const key of envConfig.keys()) {
						dropdown.addOption(key, key);
					}
					dropdown.setValue(dropdownValue);
				}
				dropdown.onChange((value) => {
					this.showEnvDataConfig(envDataConfigDiv, value);
				})
			})
			.addExtraButton((extraButton) => {
				extraButton.setIcon('add')
					.onClick(() => {
						console.log('add -env')
					})
			})
		this.showEnvDataConfig(envDataConfigDiv, dropdownValue);
	}

	private showEnvDataConfig(div: HTMLDivElement, env:string) {
		div.empty();
		const envData:Map<string, object> | undefined =  this.envCache.get(this.envLevel);
		const textValue:string | undefined = envData && envData.get(env) ? JSON.stringify(envData.get(env)) : `{
}`
		new Setting(div)
			.addTextArea((textarea) => {
				textarea.setValue(textValue);
				textarea.onChange((textareaValue) => {
					if (envData) {
						envData.set(env, JSON.parse(textareaValue));
					}
				})
			})
	}

	private showEnvLevelConfig(div: HTMLDivElement, envDiv:HTMLDivElement) {
		new Setting(div)
			.addDropdown((dropdown) => {
				if (this.envCache) {
					this.envCache.forEach((value, key) => {
						dropdown.addOption(key, key);
					});
					dropdown.setValue(this.envLevel)
				}else {
					dropdown.addOption(EnvLevelEnum.GLOBAL, EnvLevelEnum.GLOBAL);
					dropdown.addOption(EnvLevelEnum.LOCAL, EnvLevelEnum.LOCAL);
					dropdown.setValue(EnvLevelEnum.GLOBAL);
				}
				dropdown.onChange((value) => {
					this.envLevel = value;
					this.showEnvConfig(envDiv);
				})
			})

	}
}
