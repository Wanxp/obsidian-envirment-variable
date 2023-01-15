import {App} from "obsidian";
import {EnvironmentSettingHolder} from "./EnvironmentSettingHolder";
import {EnvironmentHolder} from "./EnvironmentHolder";
import {EnvironmentSetting} from "../model/EnvironmentSetting";
import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export class GlobalEnvironmentHolder implements EnvironmentHolder{

	private app:App;

	private envSettingHolder:EnvironmentSettingHolder;

	private activeEnvData:Object;

	private activeEnvValue:string;


	constructor(app:App, envSettingHolder:EnvironmentSettingHolder) {
		this.app = app;
		this.envSettingHolder = envSettingHolder;
		this.activeEnvData = {
			"host": "https://127.0.0.1:5000"
		}
	}

	getEnvItemDataObject(env: string): object {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		let envData:Object = {};
		if (setting.envContent) {
			envData = JSON.parse(setting.envContent);
		}
		return envData;
	}


	getEnvItems(): string[] {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		let envData:Object = {};
		if (setting.envContent) {
			envData = JSON.parse(setting.envContent);
		}
		return Object.keys(envData);
	}


	getEnvLevel(): EnvLevelEnum {
		return EnvLevelEnum.GLOBAL;
	}

	getActiveEnv(): string {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		return setting.envActive;
	}

	activeEnv(env: string) {
		this.activeEnvValue = env;
	}


	getActiveEnvData(): Object {
		return this.activeEnvData;
	}




}
