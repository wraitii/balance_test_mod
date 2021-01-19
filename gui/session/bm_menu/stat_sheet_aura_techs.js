/**
 * Load unit template data onto the stat sheet.
 */
var g_StatSheetAuraTechs;
class StatSheetAuraTechs
{
	static Init()
	{
		g_StatSheetAuraTechs = new StatSheetAuraTechs();
	}

	static Open()
	{
		g_StatSheet.load(g_StatSheetAuraTechs.data,
			g_StatSheetAuraTechs.preset_data,
			g_StatSheetAuraTechs.filter);
		g_StatSheet.setFilters("", "");
		g_StatSheet.choosePreset(0);
		StatSheet.Open();
	}

	constructor()
	{
		this.preset_data = [
			[
				"Modifiers",
				"",
				"this.formatRes(raw?.cost)",
				"this.formatModifications(raw)",
				"raw?.affects || ''",
			],
			[
				"Cost",
				"Costs",
				"this.formatRes(raw?.cost)",
				"'Time: ' + this.cleanFloat(raw?.researchTime)",
				"this.formatRequirements(raw)",
			],
			[
				"Tooltips",
				"Validate tooltips vs modifiers",
				"this.formatModifications(raw)",
				"raw?.tooltip || ''",
				"raw?.description || ''",
			],
		];
		this.loadTemplates();
	}

	loadTemplates()
	{
		this.data = {};
		let sources = Engine.ListDirectoryFiles("simulation/data/technologies/", "*.json", true);
		sources = sources.concat(Engine.ListDirectoryFiles("simulation/data/auras/", "*.json", true));
		for (let template of sources)
		{
			let tp = template.replace("simulation/data/", "").replace(".json", "");
			try
			{
				let temp = Engine.ReadJSONFile(template);
				this.data[tp] = {
					"raw": temp,
					"template": temp,
				};
			}
			catch(err) {
				//warn("Err : " + tp + " - " + err);
			}
		}
	}

	filter(tp, raw, template, nameFilter, classFilter)
	{
		if (classFilter !== "")
			if (!raw.modifications || !raw.modifications.some(m => m.value.indexOf(classFilter) !== -1))
				return false;

		if (nameFilter !== "")
			if (tp.indexOf(nameFilter) === -1)
				return false;
		return true;
	}
}
