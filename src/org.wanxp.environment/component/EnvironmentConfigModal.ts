import {App, ButtonComponent, Modal, Notice, Setting, TextAreaComponent} from "obsidian";
import {EnvironmentHolder} from "../module/EnvironmentHolder";
import EnvironmentVariablePlugin from "../main";
import {EnvLevelEnum} from "../dict/EnvLevelEnum";
import {StringUtil} from "../util/StringUtil";


export class EnvironmentConfigModal extends Modal {

	private plugin:EnvironmentVariablePlugin;

	private envHolders:EnvironmentHolder[];

	private envLevel:string = EnvLevelEnum.GLOBAL;

	private envCache:Map<string, Map<string, object>> = new Map<string, Map<string, object>>();

	private envAddText:string;
	private envAddTextEnvData:string;
	private envAddTextEnvErrorData: string;



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
		this.plugin.reloadStatusBar();
	}

	private show(contentEl: HTMLElement) {
		contentEl.createEl('h3').innerText = "配置环境";
		new Setting(contentEl);
		const envLevelDiv:HTMLDivElement = contentEl.createDiv({cls: "obsidian-environment-variable-env-config"});
		const envData:HTMLDivElement = contentEl.createDiv({cls: "obsidian-environment-variable-env-config"});
		this.showEnvLevelConfig(envLevelDiv, envData);
		this.showEnvConfig(envData, false);
		this.showButton(contentEl.createDiv({cls:  "obsidian-environment-env-config-button"}))
	}

	private showEnvConfig(div: HTMLDivElement, addEnv:boolean, envValueSelection?:string) {
		div.empty();
		const envConfigDiv:HTMLDivElement = div.createDiv({cls: "obsidian-environment-variable-env-config"});
		const envDataConfigDiv:HTMLDivElement = div.createDiv({cls: "obsidian-environment-variable-env-config"});
		let dropdownValue:string = '';
		if (addEnv) {
			new Setting(envConfigDiv)
				.setName("环境名称")
				.addText((text) => {
					text.onChange((value) => {
						this.envAddText = value;
					})
				})
				.addExtraButton((extraButton) => {
					extraButton.setIcon('check-square')
						.onClick(() => {
							if (!this.envAddText) {
								new Notice('请填写环境名称');
								return;
							}
							const addText = this.envAddText;
							const envAddTextEnvData = this.envAddTextEnvData;
							this.envAddText = '';
							this.envAddTextEnvData = '';
							this.addEnvAndShow(addText, envAddTextEnvData, div);
						})
						.setTooltip("确认环境名称")
				})
				.addExtraButton((extraButton) => {
					extraButton.setIcon('x-square')
						.onClick(() => {
							this.envAddText = '';
							this.envAddTextEnvData = ''
							this.showEnvConfig(div, false);
						})
						.setTooltip("取消新增")
				})
		}else {
			// @ts-ignore
			dropdownValue = envValueSelection ? envValueSelection : this.envCache.get(this.envLevel).keys() ? this.envCache.get(this.envLevel).keys().next().value : '';
			new Setting(envConfigDiv)
				.setName("环境名称")
				.addDropdown((dropdown) => {
					const envConfig:Map<string, object> | undefined = this.envCache.get(this.envLevel);
					if (envConfig) {
						for (const key of envConfig.keys()) {
							dropdown.addOption(key, key);
						}
						dropdown.setValue(dropdownValue);
					}
					dropdown.onChange((value) => {
						dropdownValue = value;
						this.showEnvDataConfig(envDataConfigDiv, value, addEnv);
					})
				})
				.addExtraButton((extraButton) => {
					extraButton.setIcon('plus-square')
						.onClick(() => {
							this.showEnvConfig(div, true);
						})
						.setTooltip("新增环境")
				})
				.addExtraButton((extraButton) => {
					extraButton.setIcon('delete')
						.onClick(() => {
							this.deleteEnvAndShow(div, dropdownValue);
						})
						.setTooltip("删除环境")
				})
		}
		this.showEnvDataConfig(envDataConfigDiv, dropdownValue, addEnv);
	}

	private showEnvDataConfig(div: HTMLDivElement, env:string, adding:boolean) {
		if (this.envAddTextEnvErrorData) {
			new Notice('JSON格式错误,请检查你录入的参数内容是否符合JSON格式');
			return;
		}
		div.empty();
		new Setting(div).setName("参数内容(JSON)")
		.addExtraButton((extraButton) => {
			extraButton.setIcon('paintbrush')
				.onClick(() => {
					this.showEnvDataConfig(div, env, adding);
				})
				.setTooltip("优化JSON显示")
		})
		// @ts-ignore
		const envData:Map<string, object>  =  this.envCache.get(this.envLevel);
		let textValue:string;
		if(this.envAddText) {
			textValue = JSON.stringify(JSON.parse(this.envAddTextEnvData), null, 2);
		}else {
			textValue = envData && envData.get(env) ? JSON.stringify(envData.get(env), null, 2) : `{
}`
		}
		const textarea = new TextAreaComponent(div);
		textarea.setValue(textValue);
		textarea.onChange((textareaValue) => {
			if(textareaValue) {
				if (StringUtil.isJson(textareaValue)) {
					if(adding) {
						this.envAddTextEnvData = textareaValue;
					}else {
						this.setEnv(env, textareaValue);
					}
					this.envAddTextEnvErrorData = '';
				}else {
					this.envAddTextEnvErrorData = textareaValue;
				}
			}
		});
		textarea.inputEl.style.width = '100%';
		textarea.inputEl.style.height = '540px';
		textarea.inputEl.style.fontSize = '0.8em';
	}

	private showEnvLevelConfig(div: HTMLDivElement, envDiv:HTMLDivElement) {
		new Setting(div)
			.setName("范围等级")
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
					this.showEnvConfig(envDiv, false);
				})
			})

	}

	private addEnvAndShow(envAddText: string, envAddTextEnvData:string, div: HTMLDivElement):void {
		if (!envAddText) {
			this.showEnvConfig(div, false);
			return;
		}
		if(this.addEnv(envAddText, envAddTextEnvData)) {
			this.showEnvConfig(div, false, envAddText);
		}
	}

	private showButton(buttonDiv: HTMLDivElement) {

		new ButtonComponent(buttonDiv)
			.setButtonText("取消")
			.onClick(() => {
				this.close();
			})
			.setClass("obsidian-environment-env-config-button");

		new ButtonComponent(buttonDiv)
			.setButtonText("保存")
			.onClick(async () => {
				await this.saveEnvData();

			})
			.setClass("obsidian-environment-env-config-button");

	}

	private async saveEnvData() {
		if (this.envAddTextEnvErrorData) {
			new Notice('JSON格式错误,请检查你录入的参数内容是否符合JSON格式');
			return;
		}
		if(this.envAddText) {
			this.addEnv(this.envAddText, this.envAddTextEnvData);
			this.envAddText = '';
			this.envAddTextEnvData = '';
			this.envAddTextEnvErrorData = '';
		}
		for (const envHolder of this.envHolders) {
			let map:Map<string, object> | undefined = this.envCache.get(envHolder.getEnvLevel());
			let result:object = {};
			if (map) {
				result = Object.fromEntries(map);
			}
			await envHolder.saveAllEnv(result);
		}
		this.close();
	}

	private addEnv(envAddText: string, envAddTextEnvData: string):boolean {
		let map:Map<string, object> | undefined = this.envCache.get(this.envLevel);
		if (!map) {
			map = new Map<string, object>();
			this.envCache.set(this.envLevel, map);
		}
		if (map.has(envAddText)) {
			new Notice('已经存在')
			return false;
		}
		let envData:string = envAddTextEnvData;
		if (!envData) {
			envData = '{}';
		}
		if (!StringUtil.isJson(envData)) {
			new Notice('JSON格式错误,请检查你录入的参数内容是否符合JSON格式')
			return false;
		}
		map.set(envAddText, JSON.parse(envData));
		return true;
	}

	private setEnv(env: string, envDataValue: string):boolean {
		let map:Map<string, object> | undefined = this.envCache.get(this.envLevel);
		if (!map) {
			map = new Map<string, object>();
			this.envCache.set(this.envLevel, map);
		}
		let envData:string = envDataValue;
		if (!envData) {
			envData = '{}';
		}
		if (!StringUtil.isJson(envData)) {
			new Notice('JSON格式错误,请检查你录入的参数内容是否符合JSON格式')
			return false;
		}
		map.set(env, JSON.parse(envData));
		return true;
	}

	private deleteEnvAndShow(envDiv: HTMLDivElement, dropdownValue:string):void {
		if (!dropdownValue || !this.envCache || !this.envCache.get(this.envLevel)) {
			return;
		}

		// @ts-ignore
		const map:Map<string, object> = this.envCache.get(this.envLevel);
		map.delete(dropdownValue);
		this.showEnvConfig(envDiv, false);

	}
}
