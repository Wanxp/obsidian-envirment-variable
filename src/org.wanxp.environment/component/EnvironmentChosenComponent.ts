import { DropdownComponent,   setIcon } from "obsidian";
import {EnvironmentHolder} from "../module/EnvironmentHolder";
import EnvironmentVariablePlugin from "../main";
import {EnvironmentConfigModal} from "./EnvironmentConfigModal";

export class EnvironmentChosenComponent {

	private containerEl:HTMLElement;

	private dropdown:DropdownComponent;
	private envHolder:EnvironmentHolder;

	private plugin:EnvironmentVariablePlugin;


	constructor(containerEl: HTMLElement, envHolder: EnvironmentHolder, plugin: EnvironmentVariablePlugin) {
		this.containerEl = containerEl.createSpan("obsidian-environment-status-bar");
		this.envHolder = envHolder;
		this.plugin = plugin;
		this.init();
	}

	private init() {
		const {envHolder, containerEl} = this;
		containerEl.addClass("obsidian-environment-status-bar")
		this.dropdown = new DropdownComponent(containerEl);
		const {dropdown} = this;
		envHolder.getEnvItems()
			.forEach(env => {
				dropdown.addOption(env, env);
			})
		dropdown.setValue(envHolder.getActiveEnv());
		dropdown.onChange(async (env) => {
			await this.onChangeEnv(env);
		});
		const icon = containerEl.createSpan("status-bar-item-segment icon");
		setIcon(icon, "align-justify");
		icon.addEventListener("click", async () => await this.onOpenConfigModal())
	}

	private async onOpenConfigModal() {
		console.log('open env');
		new EnvironmentConfigModal(this.plugin.app, this.plugin).open();
		// new EnvironmentConfigModal2(this.plugin.app, this.plugin).onOpen();
	}

	private async onChangeEnv(env: string):Promise<void> {
		await this.envHolder.activeEnv(env);
		this.plugin.app.vault.getAllLoadedFiles().forEach( file => (file))
	}

	public async reload():Promise<void> {
		this.containerEl.empty();
		this.init();
	}
}
