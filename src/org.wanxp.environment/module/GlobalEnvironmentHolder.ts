import {App} from "obsidian";
import {EnvironmentSettingHolder} from "./EnvironmentSettingHolder";
import {EnvironmentHolder} from "./EnvironmentHolder";
import {EnvironmentSetting} from "../model/EnvironmentSetting";
import {EnvLevelEnum} from "../dict/EnvLevelEnum";

export class GlobalEnvironmentHolder implements EnvironmentHolder{

	private app:App;

	private envSettingHolder:EnvironmentSettingHolder;

	private envAllData:object;

	private activeEnvData:object;

	private activeEnvValue:string;


	constructor(app:App, envSettingHolder:EnvironmentSettingHolder) {
		this.app = app;
		this.envSettingHolder = envSettingHolder;
		this.activeEnvValue = this.getSettingActiveEnvValue(envSettingHolder);
		this.activeEnvData = this.getEnvDataByEnv(this.activeEnvValue);
		this.envAllData = this.getEnvAllData(envSettingHolder);

	}



	private getEnvDataByEnv(activeEnvValue:string):object {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		if(activeEnvValue && setting.envContent) {
			const envData:object = JSON.parse(setting.envContent);
			if (envData.hasOwnProperty(activeEnvValue)) {
				// @ts-ignore
				return envData[activeEnvValue];
			}else {
				return {};
			}
		}else {
			return {};
		}
	}

	getEnvItemDataObject(env: string): object {
		return this.getEnvDataByEnv(env);
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
		return this.activeEnvValue;
	}

	async activeEnv(env: string) {
		this.activeEnvValue = env;
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		setting.envActive = env;
		this.activeEnvData = this.getEnvItemDataObject(env);
		await this.envSettingHolder.saveSettings(setting);
	}

	getActiveEnvData(): object {
		return this.activeEnvData;
	}


	private getSettingActiveEnvValue(envSettingHolder: EnvironmentSettingHolder):string {
		return envSettingHolder.getSetting().envActive;
	}

	private getEnvAllData(envSettingHolder: EnvironmentSettingHolder) {
		if(envSettingHolder.getSetting().envContent) {
			return JSON.parse(envSettingHolder.getSetting().envContent);
		}
		return {};
	}

	async saveAllEnv(envAllData: object): Promise<void> {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		this.envAllData = envAllData;
		setting.envContent = JSON.stringify(envAllData);
		await this.envSettingHolder.saveSettings(setting);
	}

	async saveEnv(env: string, envData: object): Promise<void> {
		const setting:EnvironmentSetting = this.envSettingHolder.getSetting();
		// @ts-ignore
		this.envAllData[env] = envData;
		setting.envContent = JSON.stringify(this.envAllData);
		await this.envSettingHolder.saveSettings(setting);
	}
}
