import {App, FuzzySuggestModal} from "obsidian";
import {EnvironmentSettingHolder} from "../module/EnvironmentSettingHolder";
import {GlobalEnvironmentHolder} from "../module/GlobalEnvironmentHolder";
import {EnvironmentHolder} from "../module/EnvironmentHolder";
import EnvironmentVariablePlugin from "../main";

export class EnvironmentChosenModal extends FuzzySuggestModal<string> {

	private environments:string[];
	private envHolder:EnvironmentHolder;

	private plugin:EnvironmentVariablePlugin;
	constructor(app:App, plugin, envHolder:EnvironmentHolder) {
		super(app);
		this.plugin = plugin;
		this.envHolder = envHolder;
		this.initItems(envHolder);
		this.setPlaceholder('search env');
		this.buildInstructions();
	}

	private initItems(envHolder: EnvironmentHolder) {
		this.environments = envHolder.getEnvItems();
	}

	getItemText(item: string): string {
		return item;
	}

	getItems(): string[] {
		return this.environments;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.plugin.activeEnv(item, this.envHolder.getEnvLevel());
	}

	buildInstructions(): void {
			let instructions;
			instructions = [
				{
					command: "↵",
					purpose: "switch",
				},
				{
					command: "ctrl ↵",
					purpose: "rename",
				},
				{
					command: "shift ⌫",
					purpose: "delete",
				},
				{
					command: "esc",
					purpose: "cancel",
				}
			];
			this.setInstructions(instructions);
	}

	setupScope(): void {
		this.scope.register([], "Escape", evt => this.onEscape(evt));
		// this.scope.register([], "Enter", evt => this.useSelectedItem(evt));
		this.scope.register(["Ctrl"], "Enter", evt => this.showEditModal(evt));
		// this.scope.register(["Shift"], "Enter", evt => this.useSelectedItem(evt));
		// this.scope.register(["Alt"], "Enter", evt => this.useSelectedItem(evt));
		// this.scope.register([], "ArrowUp", evt => {
		// 	if (!evt.isComposing) return this..setSelectedItem(this.chooser.selectedItem - 1, true), false;
		// });
		// this.scope.register([], "ArrowDown", evt => {
		// 	if (!evt.isComposing) return this.chooser.setSelectedItem(this.chooser.selectedItem + 1, true), false;
		// });
	}


	private onEscape(evt: KeyboardEvent) {
		this.close();
	}

	private showEditModal(evt: KeyboardEvent) {

	}
}
