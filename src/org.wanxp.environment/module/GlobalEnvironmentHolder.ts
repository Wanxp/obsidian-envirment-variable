import {App} from "obsidian";
import {EnvironmentSettingHolder} from "./EnvironmentSettingHolder";
import {EnvironmentHolder} from "./EnvironmentHolder";
import {EnvironmentSetting} from "../model/EnvironmentSetting";
import {ObjectUtil} from "../ObjectUtil";
import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export class GlobalEnvironmentHolder implements EnvironmentHolder{

	private app:App;

	private envSettingHolder:EnvironmentSettingHolder;

	private

	constructor(app:App, envSettingHolder:EnvironmentSettingHolder) {
		this.app = app;
		this.envSettingHolder = envSettingHolder;
	}

	getEnvItemData(env: string): Map<string, string> {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		let envData:Object = {};
		if (setting.envContent) {
			envData = JSON.parse(setting.envContent);
		}
		const data:Object = envData[env];
		return ObjectUtil.toMap(data);
	}

	getEnvItems(): string[] {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		let envData:Object = {};
		if (setting.envContent) {
			envData = JSON.parse(setting.envContent);
		}
		return Object.keys(envData);
	}

	async saveEnv(env: string) {

	}

	getEnvLevel(): EnvLevelEnum {
		return EnvLevelEnum.GLOBAL;
	}

	getActiveEnv(): string {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		return setting.envActive;
	}




}
