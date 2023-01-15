import {
	MarkdownPostProcessorContext,
	Plugin,
} from 'obsidian';
import {EnvironmentSettingHolder} from "./module/EnvironmentSettingHolder";
import {EnvLevelEnum} from "./dict/EnvLevelEnum";
import {EnvironmentHolder} from "./module/EnvironmentHolder";
import {GlobalEnvironmentHolder} from "./module/GlobalEnvironmentHolder";
import {EnvironmentSetting} from "./model/EnvironmentSetting";
import {DEFAULT_SETTING} from "./constant/DefaultSetting";
import {EnvironmentChosenComponent} from "./component/EnvironmentChosenComponent";
import {StringUtil} from "./util/StringUtil";
export const COUNTER_VIEW_TYPE = "test-viewwwww";

export const REX = /{{(\S+)}}/

export default class EnvironmentVariablePlugin extends Plugin {

	setting:EnvironmentSetting;
	settingsHolder: EnvironmentSettingHolder;
	envHolders:EnvironmentHolder[];

	chosenComponent:EnvironmentChosenComponent;

	async onload() {
		await this.loadSettings();
		this.envHolders = [new GlobalEnvironmentHolder(app, this.settingsHolder)]
		for (const envHolder of this.envHolders) {
			await this.createStatusBar(envHolder);
		}

		this.registerMarkdownPostProcessor((element, _context) => {
			this.replaceStrByEnv(element, _context);
		});
		// This adds a settings tab so the user can configure various aspects of the plugin
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(COUNTER_VIEW_TYPE);

		await this.app.workspace.getRightLeaf(true).setViewState({
			type: COUNTER_VIEW_TYPE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(COUNTER_VIEW_TYPE)[0]
		);
	}

	async createStatusBar(envHolder:EnvironmentHolder) {
		const statusBarItem = this.addStatusBarItem();
		this.chosenComponent = new EnvironmentChosenComponent(statusBarItem, envHolder, this);
	}

	onunload() {
	}



	async loadSettings() {
		this.setting = Object.assign({}, DEFAULT_SETTING, await this.loadData());
		this.settingsHolder = await new EnvironmentSettingHolder(this.app, this);
	}

	async activeEnv(env: string, level:EnvLevelEnum) {
		const environmentHolder = this.envHolders.find(h => h.getEnvLevel() == level);
		if (environmentHolder) {
			await environmentHolder.activeEnv(env);
		}
		this.app.workspace.getLayout()
		// await environmentHolder.updateEnvView(env, this.app.)
	}


	private replaceStrByEnv(element: HTMLElement, _context: MarkdownPostProcessorContext) {
		Array.from(element.getElementsByTagName("code"))
			.forEach((codeBlock: HTMLElement) => {
				this.envHolders.forEach(holder => {
					this.replaceChildrenText(codeBlock, holder.getActiveEnvData());
				})
			});
	}

	private replaceChildrenText(codeBlock:ChildNode , data:object) {
		if (codeBlock.childNodes && codeBlock.childNodes.length > 0) {
			codeBlock.childNodes.forEach(codeChild => {
				this.replaceChildrenText(codeChild, data);
			})
		}else {
			 if(codeBlock.textContent && REX.test(codeBlock.textContent)) {
				 const result:string = StringUtil.replacePlaceHolder(codeBlock.textContent, data,  {
					 error: false});
				 codeBlock.replaceWith(result);
			 }
		}

	}

	async reloadStatusBar() {
		await this.chosenComponent.reload();
	}
}



