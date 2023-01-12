import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, setIcon, Setting} from 'obsidian';
import {EnvironmentSettingHolder} from "./module/EnvironmentSettingHolder";
import {EnvLevelEnum} from "./dict/EnvLevelEnum";
import {EnvironmentHolder} from "./module/EnvironmentHolder";
import {GlobalEnvironmentHolder} from "./module/GlobalEnvironmentHolder";
import {EnvironmentChosenModal} from "./component/EnvironmentChosenModal";
import {EnvironmentSetting} from "./model/EnvironmentSetting";
import {DEFAULT_SETTING} from "./constant/DefaultSetting";

export default class EnvironmentVariablePlugin extends Plugin {

	setting:EnvironmentSetting;
	settingsHolder: EnvironmentSettingHolder;
	envHolders:EnvironmentHolder[];

	async onload() {
		await this.loadSettings();
		this.envHolders = [new GlobalEnvironmentHolder(app, this.settingsHolder)]
		for (const envHolder of this.envHolders) {
			await this.createStatusBar(envHolder);
		}
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

	}

	async createStatusBar(envHolder:EnvironmentHolder) {
		const envLevel:EnvLevelEnum = envHolder.getEnvLevel();
		const statusBarItem = this.addStatusBarItem();
		const icon = statusBarItem.createSpan("status-bar-item-segment icon");
		envLevel == EnvLevelEnum.GLOBAL ? setIcon(icon, "gear") : setIcon(icon, "gear"); // inject svg icon

		statusBarItem.createSpan({
			cls: "status-bar-item-segment name",
			text: envHolder.getActiveEnv(),
			prepend: false,
		});
		statusBarItem.addEventListener("click", evt => this.onStatusBarClick(evt, envHolder));

	}

	onunload() {

	}

	async loadSettings() {
		this.setting = Object.assign({}, DEFAULT_SETTING, await this.loadData());
		this.settingsHolder = await new EnvironmentSettingHolder(this.app, this);
	}

	async activeEnv(env: string, level:EnvLevelEnum) {
		const environmentHolder = this.envHolders.find(h => h.getEnvLevel() == level);
		await environmentHolder.saveEnv(env);
		// await environmentHolder.updateEnvView(env, this.app.)
	}

	private onStatusBarClick(evt: MouseEvent, envHolder: EnvironmentHolder) {
		new EnvironmentChosenModal(this.app, this, envHolder).open();
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: EnvironmentVariablePlugin;

	constructor(app: App, plugin: EnvironmentVariablePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
