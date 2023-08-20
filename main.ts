import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	TFolder,
} from "obsidian";

interface LookupSource {
	name: string;
	language: string;
	url: string;
}

interface YiLangToolsSettings {
	lookupSources: Array<LookupSource>;
	vocabTemplate?: string;
	vocabFolder?: string;
	fragmentTemplate?: string;
	openVocabOnCreate: boolean;
	openFragmentOnCreate: boolean;
}

const DEFAULT_SETTINGS: YiLangToolsSettings = {
	openFragmentOnCreate: true,
	openVocabOnCreate: true,
	lookupSources: [],
};

export default class YiLanguageToolsPlugin extends Plugin {
	settings: YiLangToolsSettings;

	private lookup(word: string, targetUrl: string) {
		window.open(
			targetUrl.replace("{}", encodeURIComponent(word)),
			"_blank"
		);
	}

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const selection = editor.getSelection();
				if (selection.length > 0) {
					if (!view.file) return;

					const meta = this.app.metadataCache.getFileCache(view.file);
					if (!meta) return;

					const language = meta.frontmatter?.language;
					if (!language) return;
					console.log({ language });

					const suitableLookupSources =
						this.settings.lookupSources.filter(
							(ls) =>
								ls.language.toLocaleLowerCase() ===
								language.toLocaleLowerCase()
						);

					for (const ls of suitableLookupSources) {
						menu.addItem((item) => {
							item.setTitle(`Search ${ls.name}`)
								.setIcon("search")
								.onClick(async () => {
									this.lookup(selection, ls.url);
								});
						});
					}
				}
			})
		);

		this.addCommand({
			id: "add-fragment",
			name: "Add Text Fragment",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!view.file) {
					new Notice("Please open a file first!");
					return;
				}
				const selection = editor.getSelection();
				if (selection.length < 1) return;

				//Get Template
				const fragmentTemplateName = this.settings.fragmentTemplate;
				if (!fragmentTemplateName) {
					new Notice(
						"Please configure fragment template file first!"
					);
					return;
				}
				const fragmentTemplate =
					this.app.vault.getAbstractFileByPath(fragmentTemplateName);
				if (!(fragmentTemplate instanceof TFile)) {
					new Notice("Configured fragment template does not exist!");
					return;
				}

				//Create vocab file
				const targetFolder = view.file.parent;
				if (!targetFolder) {
					console.log({ targetFolder });
					new Notice("Could not open target folder!");
					return;
				}

				const count = targetFolder.children.length;
				const countString = String(count).padStart(2, "0");
				const targetFileName = `${view.file.name.slice(
					0,
					-3
				)} - ${countString}.md`;
				const targetFilePath = `${targetFolder.path}/${targetFileName}`;

				const targetFileContent = await this.app.vault.cachedRead(
					fragmentTemplate
				);
				const newFileContentFromTemplate = targetFileContent.replace(
					"{{fragment}}",
					`${selection} ^fragment`
				);
				const newFile = await this.app.vault.create(
					targetFilePath,
					newFileContentFromTemplate
				);

				editor.replaceRange(
					`![[${targetFileName}#^fragment]]`,
					editor.getCursor("from"),
					editor.getCursor("to")
				);

				if (this.settings.openVocabOnCreate) {
					this.app.workspace.getLeaf("tab").openFile(newFile);
				}
			},
		});

		this.addCommand({
			id: "add-vocab",
			name: "Add vocabulary",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				if (!view.file) {
					new Notice("Please open a file first!");
					return;
				}
				const selection = editor.getSelection();
				if (selection.length < 1) return;

				//Get Template
				const vocabTemplateName = this.settings.vocabTemplate;
				if (!vocabTemplateName) {
					new Notice("Please configure vocab template file first!");
					return;
				}
				const vocabTemplate =
					this.app.vault.getAbstractFileByPath(vocabTemplateName);
				if (!(vocabTemplate instanceof TFile)) {
					new Notice("Configured vocab template does not exist!");
					return;
				}

				//Create vocab file
				const targetFolderName = this.settings.vocabFolder;
				if (!targetFolderName) {
					new Notice(
						"Please configure vocab destination folder first!"
					);
					return;
				}

				let templatedFolderName = targetFolderName;
				//const templatedFolderName = targetFolderName.replace('{}', );
				if (templatedFolderName.includes("{}")) {
					const meta = this.app.metadataCache.getFileCache(view.file);
					if (!meta) return;

					const language = meta.frontmatter?.language;
					if (!language) {
						new Notice(
							"Target folder contains {} but no language found in frontmatter!"
						);
						return;
					}
					templatedFolderName = templatedFolderName.replace(
						"{}",
						language
					);
				}
				const targetFolder =
					this.app.vault.getAbstractFileByPath(templatedFolderName);
				if (!(targetFolder instanceof TFolder)) {
					console.log({ targetFolder, templatedFolderName });
					new Notice("Configured template folder does not exist!");
					return;
				}

				const newVocabFile = await this.app.vault.copy(
					vocabTemplate,
					`${targetFolder.path}/${selection}.md`
				);

				const zeroWidthSpace = "​";
				editor.replaceRange(
					`[[${selection}|${selection}${zeroWidthSpace}]]`,
					editor.getCursor("from"),
					editor.getCursor("to")
				);

				if (this.settings.openVocabOnCreate) {
					this.app.workspace.getLeaf("tab").openFile(newVocabFile);
				}
			},
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: YiLanguageToolsPlugin;

	constructor(app: App, plugin: YiLanguageToolsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Vocab Template")
			.setDesc("Template to use when adding new vocabulary.")
			.addSearch((cb) => {
				cb.setValue(this.plugin.settings.vocabTemplate || "").onChange(
					(fileName) => {
						const templateFile =
							this.app.vault.getAbstractFileByPath(fileName);
						if (templateFile instanceof TFile) {
							this.plugin.settings.vocabTemplate =
								templateFile.path;
							this.plugin.saveSettings();
						} else {
							new Notice("Selected file does not exist!");
						}
					}
				);
			});

		new Setting(containerEl)
			.setName("Vocab Folder")
			.setDesc("Folder to use when adding new vocabulary.")
			.addSearch((cb) => {
				cb.setValue(this.plugin.settings.vocabFolder || "").onChange(
					(folderName) => {
						this.plugin.settings.vocabFolder = folderName;
						this.plugin.saveSettings();
					}
				);
			});

		new Setting(containerEl)
			.setName("Open Vocabulary on create")
			.setDesc("Open the newly created file in a new tab")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openVocabOnCreate)
					.onChange((shouldOpen) => {
						this.plugin.settings.openVocabOnCreate = shouldOpen;
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Textfragment Template")
			.setDesc("Template to use when adding new text fragments.")
			.addSearch((cb) => {
				cb.setValue(
					this.plugin.settings.fragmentTemplate || ""
				).onChange((fileName) => {
					const templateFile =
						this.app.vault.getAbstractFileByPath(fileName);
					if (templateFile instanceof TFile) {
						this.plugin.settings.fragmentTemplate =
							templateFile.path;
						this.plugin.saveSettings();
					} else {
						new Notice("Selected file does not exist!");
					}
				});
			});

		new Setting(containerEl)
			.setName("Open Textfragment on create")
			.setDesc("Open the newly created file in a new tab")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openFragmentOnCreate)
					.onChange((shouldOpen) => {
						this.plugin.settings.openFragmentOnCreate = shouldOpen;
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Lookup Sources")
			.setDesc("Manage lookup sources for your languages")
			.addButton((button) => {
				button.setButtonText("+").onClick(async () => {
					this.plugin.settings.lookupSources.push({
						language: "",
						name: "",
						url: "",
					});
					await this.plugin.saveSettings();
					this.display();
				});
			});

		for (const lookupSource of this.plugin.settings.lookupSources) {
			new Setting(containerEl)
				.setName(lookupSource.name)
				.addText((text) =>
					text
						.setPlaceholder("Name")
						.setValue(lookupSource.name)
						.onChange(async (value) => {
							lookupSource.name = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text) =>
					text
						.setPlaceholder("Language")
						.setValue(lookupSource.language)
						.onChange(async (value) => {
							lookupSource.language = value;
							await this.plugin.saveSettings();
						})
				)
				.addText((text) =>
					text
						.setPlaceholder("URL")
						.setValue(lookupSource.url)
						.onChange(async (value) => {
							lookupSource.url = value;
							await this.plugin.saveSettings();
						})
				)
				.addButton((button) => {
					button.setButtonText("-").onClick(async () => {
						this.plugin.settings.lookupSources.remove(lookupSource);
						await this.plugin.saveSettings();
						this.display();
					});
				});
		}
	}
}
